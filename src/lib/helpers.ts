import { ChatMessage } from '@/types/common.types';

/**
 * Converts an array of ChatMessage objects into a format suitable for chat history.
 * @param {ChatMessage[]} messages - Array of chat messages to convert.
 * @returns {Array<{ role: string, parts: Array<{ text: string }> }>} - Formatted chat history.
 */
export const getChatHistory = (messages: ChatMessage[]) => {
  return messages.map(message => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));
};
