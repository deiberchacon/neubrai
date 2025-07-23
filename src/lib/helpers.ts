import { ChatMessage } from '@/types/common.types';

/**
 * Converts an array of ChatMessage objects into a format suitable for chat history.
 * @param {ChatMessage[]} messages - Array of chat messages to convert.
 * @returns {Array<{ role: string, parts: Array<{ text: string }> }>} - Formatted chat history.
 */
export const getChatHistory = (messages: ChatMessage[]) => {
  return messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));
};

/**
 * Reads a stream of text from a ReadableStreamDefaultReader and updates the state with incoming messages.
 * @param {ReadableStreamDefaultReader<string>} reader - The reader for the stream.
 * @param {React.Dispatch<React.SetStateAction<ChatMessage[]>>} setMessages - Function to update chat messages.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsStreaming - Function to update streaming status.
 * @param {React.Dispatch<React.SetStateAction<string>>} setIncomingMessage - Function to update incoming message content.
 */
export const readStream = async (
  reader: ReadableStreamDefaultReader<string>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>,
  setIncomingMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  let message = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      setMessages((prev) => [...prev, { role: 'model', content: message }]);
      setIsStreaming(false);
      setIncomingMessage('');
      break;
    }
    if (value) {
      message += value;
      setIncomingMessage(message);
    }
  }
};
