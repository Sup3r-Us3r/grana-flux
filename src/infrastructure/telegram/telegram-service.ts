import { Agent } from 'node:https';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface SendMessageOptions {
  chatId: number;
  text: string;
  parseMode?: 'HTML' | 'MarkdownV2';
}

interface TelegramApiResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private baseUrl!: string;
  private httpAgent: Agent;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('TELEGRAM_API_KEY');

    this.baseUrl = `https://api.telegram.org/bot${apiKey}`;
    this.httpAgent = new Agent({
      keepAlive: true,
      family: 4,
    });
  }

  async sendMessage(options: SendMessageOptions): Promise<void> {
    const { chatId, text, parseMode = 'HTML' } = options;
    const url = `${this.baseUrl}/sendMessage`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<TelegramApiResponse>(
          url,
          {
            chat_id: chatId,
            text,
            parse_mode: parseMode,
          },
          {
            timeout: 30_000,
            httpsAgent: this.httpAgent,
          },
        ),
      );

      if (!response.data.ok) {
        const description =
          response.data.description ?? 'Unknown Telegram API error';

        this.logger.error(
          `Telegram API error (chatId=${chatId}): ${description}`,
        );

        throw new Error(description);
      }

      this.logger.debug(`Telegram message sent (chatId=${chatId})`);
    } catch (err) {
      this.handleAxiosError(err, chatId);
    }
  }

  private handleAxiosError(error: unknown, chatId: number): never {
    if (error instanceof AxiosError) {
      if (error.response) {
        const status = error.response.status;
        const description =
          (error.response.data as TelegramApiResponse)?.description ??
          error.response.statusText ??
          'Telegram API error';

        this.logger.error(
          `Telegram HTTP ${status} (chatId=${chatId}): ${description}`,
        );

        throw new Error(description);
      }

      if (error.code) {
        this.logger.error(
          `Telegram network error (chatId=${chatId}): ${error.code}`,
        );

        throw new Error(`Telegram network error: ${error.code}`);
      }
    }

    this.logger.error(
      `Unexpected error sending Telegram message (chatId=${chatId})`,
    );

    throw error instanceof Error ? error : new Error('Unknown Telegram error');
  }
}
