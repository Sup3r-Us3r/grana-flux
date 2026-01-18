import { CreateUserUseCase } from '@application/use-cases/users/create-user/create-user-use-case';
import { GetUserByTelegramIdUseCase } from '@application/use-cases/users/get-user-by-telegram-id/get-user-by-telegram-id-use-case';
import {
  TELEGRAM_MESSAGE_RECEIVED,
  TelegramMessageEvent,
} from '@infra/telegram/telegram-message-handler';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TelegramWebhookDTO } from '../dtos/telegram/telegram-webhook-dto';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly getUserByTelegramIdUseCase: GetUserByTelegramIdUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Telegram Webhook Endpoint',
    description:
      'Receives messages from Telegram and processes them asynchronously via MCP Agent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
  })
  async handleWebhook(@Body() body: TelegramWebhookDTO): Promise<void> {
    const { message } = body;

    // Ignore updates without text messages
    if (!message?.text) {
      this.logger.debug(
        `Ignoring update ${body.update_id}: no text message present`,
      );
      return;
    }

    // Ignore updates without from (sender info)
    if (!message.from) {
      this.logger.debug(
        `Ignoring update ${body.update_id}: no sender information`,
      );
      return;
    }

    const chatId = message.chat.id;
    const sessionId = chatId.toString();
    const userMessage = message.text;
    const telegramUserId = message.from.id;
    const telegramName =
      message.from.first_name +
      (message.from.last_name ? ` ${message.from.last_name}` : '');
    const telegramUsername = message.from.username;

    // Find or create user
    let userId: string;

    const existingUser = await this.getUserByTelegramIdUseCase.execute({
      telegramUserId,
    });

    if (existingUser) {
      userId = existingUser.id;

      this.logger.debug(`Found existing user: ${userId}`);
    } else {
      const newUser = await this.createUserUseCase.execute({
        telegramUserId,
        name: telegramName,
        username: telegramUsername,
      });

      userId = newUser.id;

      this.logger.log(
        `Created new user: ${userId} for Telegram ID ${telegramUserId}`,
      );
    }

    this.logger.log(`Webhook received from chat ${chatId}, emitting event...`);

    // Emit event for async processing - returns immediately to Telegram
    const event: TelegramMessageEvent = {
      chatId,
      sessionId,
      userId,
      message: userMessage,
    };

    this.eventEmitter.emit(TELEGRAM_MESSAGE_RECEIVED, event);
  }
}
