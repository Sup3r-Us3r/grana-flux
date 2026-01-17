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

const FIXED_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

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
  handleWebhook(@Body() body: TelegramWebhookDTO): void {
    const { message } = body;

    // Ignore updates without text messages
    if (!message?.text) {
      this.logger.debug(
        `Ignoring update ${body.update_id}: no text message present`,
      );
      return;
    }

    const chatId = message.chat.id;
    const sessionId = chatId.toString();
    const userMessage = message.text;

    this.logger.log(`Webhook received from chat ${chatId}, emitting event...`);

    // Emit event for async processing - returns immediately to Telegram
    const event: TelegramMessageEvent = {
      chatId,
      sessionId,
      userId: FIXED_USER_ID,
      message: userMessage,
    };

    this.eventEmitter.emit(TELEGRAM_MESSAGE_RECEIVED, event);
  }
}
