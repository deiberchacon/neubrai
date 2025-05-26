'use client';

import { useRef, useState } from 'react';
import { useScrollToLastMessage } from '@/hooks/use-scroll-to-last-message';
import { useChatStream } from '@/hooks/use-chat-stream';

import ChatMessageItem from './ChatMessageItem';
import ChatInput from './ChatInput';
import ChatStartScreen from './ChatStartScreen';

import { ChatMessage } from '../types/common.types';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { startStream, cancelStream, isStreaming, isLoading, incomingMessage } =
    useChatStream(setMessages);

  const scrollableRef = useRef<HTMLDivElement>(null!);
  const lastUserMessageRef = useRef<HTMLDivElement>(null!);
  // const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);

  // When a new user message is added, scroll to that message
  const { minScrollOffset } = useScrollToLastMessage(
    messages,
    scrollableRef,
    lastUserMessageRef
  );

  // Handler for sending a message
  const handleSendMessage = async (prompt: string) => {
    // Stream the message
    startStream(prompt, messages);
  };

  // Cancel the stream and reset the state
  const handleCancelStream = () => {
    cancelStream();
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
