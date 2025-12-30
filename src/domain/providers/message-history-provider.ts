export interface ChatMessage {
  role: 'human' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export abstract class MessageHistoryProvider {
  abstract getMessages(sessionId: string): Promise<ChatMessage[]>;
  abstract addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  abstract clearMessages(sessionId: string): Promise<void>;
}
