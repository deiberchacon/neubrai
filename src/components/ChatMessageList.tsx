import React from 'react';
import ChatMessageItem from './ChatMessageItem';
import { ChatMessageListProps } from '@/types/common.types';

const ChatMessageList = ({
  messages,
  lastUserMessageRef,
  minScrollOffset,
  incomingMessage,
  isStreaming,
  isLoading,
}: ChatMessageListProps) => {
  return (
    <div className="mx-auto mb-12 flex w-full max-w-2xl flex-col gap-3">
      {/* Display the chat messages */}
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;

        return (
          <ChatMessageItem
            key={index}
            message={message}
            offset={minScrollOffset.current}
            ref={message.role === 'user' && isLast ? lastUserMessageRef : null}
            isLast={message.role === 'model' && isLast}
          />
        );
      })}

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
  );
};

export default ChatMessageList;
