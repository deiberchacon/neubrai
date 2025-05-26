'use client';

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types/common.types';
import ChatMessageItem from './ChatMessageItem';
import ChatInput from './ChatInput';
import ChatStartScreen from './ChatStartScreen';

const ChatWindow: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<string>('');

  const scrollableRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const minScrollOffset = useRef<number>(0);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);

  // When a new user message is added, scroll to that message
  useEffect(() => {
    if (messages.length && messages[messages.length - 1].role === 'user') {
      // Calculate the minimum scroll offset
      // to keep the last user message in view
      minScrollOffset.current =
        window.innerHeight -
        (lastUserMessageRef.current?.offsetHeight ?? 0) -
        318;

      // Scroll to the last user message
      scrollableRef.current?.scrollTo({
        top:
          scrollableRef.current.scrollHeight +
          scrollableRef.current.scrollTop +
          minScrollOffset.current,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Handler for sending a message
  const handleSendMessage = async (prompt: string) => {
    if (isLoading || isStreaming) return;

    setIsLoading(true);

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    try {
      // Chat history for Multi-turn conversations
      const history = messages.map(message => {
        return {
          role: message.role,
          parts: [{ text: message.content }],
        };
      });

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
      readerRef.current = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      // Handle the stream
      if (readerRef.current) {
        setIsLoading(false);
        setIsStreaming(true);

        let message = '';

        // Read the stream until it's done
        while (true) {
          const { done, value } = await readerRef.current.read();

          // If the stream is done, add the message to the chat
          // and reset the incoming message
          if (done) {
            setMessages(prev => [...prev, { role: 'model', content: message }]);

            setIsStreaming(false);
            setIncomingMessage('');

            break;
          }

          // If the stream is not done, append the value to the message
          // and set the incoming message
          if (value) {
            message += value;
            setIncomingMessage(message);
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: "Sorry I can't answer in this moment" },
      ]);

      setIsStreaming(false);
      setIsLoading(false);
      setIncomingMessage('');

      console.error('Error:', error?.message || error);
    }
  };

  // Cancel the stream and reset the state
  const handleCancelStream = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      setIsStreaming(false);
      setIsLoading(false);
      setIncomingMessage('');
    }
  };

  return (
    <main
      ref={scrollableRef}
      className="scrollbar flex h-[calc(100vh-205px)] flex-col overflow-y-auto p-4"
    >
      {/* Message list */}
      {messages.length ? (
        <div className="mx-auto mb-12 flex w-full max-w-2xl flex-col gap-3">
          {/* Display the chat messages */}
          {messages.map((message, index) => (
            <ChatMessageItem
              key={index}
              message={message}
              offset={minScrollOffset.current}
              ref={
                message.role === 'user' && index === messages.length - 1
                  ? lastUserMessageRef
                  : null
              }
              isLast={message.role === 'model' && index === messages.length - 1}
            />
          ))}

          {/* Display the incoming message as it streams */}
          {incomingMessage && (
            <div>
              {isStreaming && (
                <div className="mb-2 font-mono text-gray-500">Typing...</div>
              )}
              <ChatMessageItem
                message={{
                  role: 'model',
                  content: incomingMessage,
                }}
                isLast={true}
                offset={minScrollOffset.current}
              />
            </div>
          )}

          {isLoading && (
            <ChatMessageItem
              message={{
                role: 'model',
                content: 'Thinking...',
              }}
              isLast={true}
              offset={minScrollOffset.current}
              isLoading={isLoading}
            />
          )}
        </div>
      ) : (
        <ChatStartScreen />
      )}

      {/* Input form for the user to type their message */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onCancelStream={handleCancelStream}
      />
    </main>
  );
};

export default ChatWindow;
