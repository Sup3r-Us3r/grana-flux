import { McpAgentService } from '@infra/mcp/mcp-agent-service';
import { TelegramService } from '@infra/telegram/telegram-service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { convert } from 'telegram-markdown-v2';

export const TELEGRAM_MESSAGE_RECEIVED = 'telegram.message.received';

export interface TelegramMessageEvent {
  chatId: number;
  sessionId: string;
  userId: string;
  message: string;
}

@Injectable()
export class TelegramMessageHandler {
  private readonly logger = new Logger(TelegramMessageHandler.name);

  constructor(
    private readonly mcpAgentService: McpAgentService,
    private readonly telegramService: TelegramService,
  ) {}

  @OnEvent(TELEGRAM_MESSAGE_RECEIVED, { async: true })
  async handleMessage(event: TelegramMessageEvent): Promise<void> {
    const { chatId, sessionId, userId, message } = event;

    this.logger.log(
      `Processing message from chat ${chatId}: "${message.substring(0, 50)}..."`,
    );

    try {
      // Process message through MCP Agent
      const result = await this.mcpAgentService.chat(
        sessionId,
        userId,
        message,
      );

      console.log(result);

      this.logger.debug(`MCP Agent response received for chat ${chatId}`);

      // Convert Markdown response to Telegram-compatible HTML
      // const htmlResponse = convertMarkdownToTelegramHtml(result.response);

      // Send response back to Telegram
      await this.telegramService.sendMessage({
        chatId,
        text: convert(result.response),
        parseMode: 'MarkdownV2',
        // parseMode: 'HTML',
      });

      this.logger.log(`Response sent to chat ${chatId}`);
    } catch {
      // Send error message to user
      try {
        await this.telegramService.sendMessage({
          chatId,
          text: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          parseMode: 'HTML',
        });
      } catch (sendError) {
        this.logger.error(
          `Failed to send error message to chat ${chatId}:`,
          sendError,
        );
      }
    }
  }
}
