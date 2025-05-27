/**
 * Represents a single chat message.
 * @property {'user' | 'model'} role - The sender of the message.
 * @property {string} content - The content of the message.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Props for the ChatMessageItem component.
 * @property {ChatMessage} message - The chat message to display.
 * @property {React.Ref<HTMLDivElement>} [ref] - Optional ref for the message container.
 * @property {number} [offset] - Optional offset for message positioning.
 * @property {boolean} [isLast] - Whether this is the last message in the list.
 * @property {boolean} [isLoading] - Whether the message is currently loading.
 */
export interface ChatMessageItemProps {
  message: ChatMessage;
  ref?: React.Ref<HTMLDivElement>;
  offset?: number;
  isLast?: boolean;
  isLoading?: boolean;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  lastUserMessageRef: React.RefObject<HTMLDivElement>;
  minScrollOffset: React.RefObject<number>;
  incomingMessage?: string;
  isStreaming: boolean;
  isLoading: boolean;
}

/**
 * Props for the ChatInput component.
 * @property {boolean} isLoading - Whether a message is being sent or processed.
 * @property {boolean} isStreaming - Whether a message is currently streaming.
 * @property {(message: string) => void} onSendMessage - Handler for sending a message.
 * @property {() => void} onCancelStream - Handler for cancelling a streaming message.
 */
export interface ChatInputProps {
  isLoading: boolean;
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onCancelStream: () => void;
}
