import React, { useRef, useState } from 'react';
import { ChatMessage } from '../types/common.types';
import { getChatHistory, readStream } from '../lib/helpers';

export const useChatStream = (setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<string>('');
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);

  const startStream = async (prompt: string, messages: ChatMessage[]) => {
    if (isLoading || isStreaming) return;

    setIsLoading(true);

    // Add user message to the chat
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);

    // Chat history for Multi-turn conversations
    const history = getChatHistory(messages);

    try {
      // Call the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, history }),
      });

      // Check if the response is not successful
      if (!response.body || !response.ok) {
        throw new Error(response.statusText);
      }

      // Stream the response
      readerRef.current = response.body.pipeThrough(new TextDecoderStream()).getReader();

      // Start reading the stream
      if (readerRef.current) {
        setIsLoading(false);
        setIsStreaming(true);

        await readStream(readerRef.current, setMessages, setIsStreaming, setIncomingMessage);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "Sorry I can't answer in this moment" },
      ]);

      setIsStreaming(false);
      setIsLoading(false);
      setIncomingMessage('');

      console.error('Error:', error?.message || error);
    }
  };

  const cancelStream = () => {
    readerRef.current?.cancel();
    setIsStreaming(false);
    setIsLoading(false);
    setIncomingMessage('');
  };

  return {
    startStream,
    cancelStream,
    isStreaming,
    isLoading,
    incomingMessage,
  };
};
