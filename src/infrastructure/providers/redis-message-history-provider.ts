import { CacheProvider } from '@domain/providers/cache-provider';
import {
  ChatMessage,
  MessageHistoryProvider,
} from '@domain/providers/message-history-provider';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisMessageHistoryProvider implements MessageHistoryProvider {
  private readonly TTL_SECONDS = 86400; // 24 hours

  constructor(private readonly cacheProvider: CacheProvider) {}

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const data = await this.cacheProvider.get(this.getKey(sessionId));
    if (!data) return [];

    try {
      const messages = JSON.parse(data) as Array<{
        role: 'human' | 'ai' | 'system';
        content: string;
        timestamp: string;
      }>;

      return messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return [];
    }
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const messages = await this.getMessages(sessionId);
    messages.push(message);

    await this.cacheProvider.set(
      this.getKey(sessionId),
      JSON.stringify(messages),
      this.TTL_SECONDS,
    );
  }

  async clearMessages(sessionId: string): Promise<void> {
    await this.cacheProvider.del(this.getKey(sessionId));
  }

  private getKey(sessionId: string): string {
    return `mcp:history:${sessionId}`;
  }
}
