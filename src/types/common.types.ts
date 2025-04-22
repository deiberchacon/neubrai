export interface ChatMessage {
  isLast?: boolean;
  role: 'user' | 'assistant';
  content: string;
}
