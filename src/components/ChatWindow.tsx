'use client';

import { useRef, useState } from 'react';
import { useScrollToLastMessage } from '@/hooks/use-scroll-to-last-message';
import { useChatStream } from '@/hooks/use-chat-stream';

// Types
import { ChatMessage } from '../types/common.types';

// Components
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import ChatStartScreen from './ChatStartScreen';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollableRef = useRef<HTMLDivElement>(null!);
  const lastUserMessageRef = useRef<HTMLDivElement>(null!);

  // Handle chat streaming
  const { startStream, cancelStream, isStreaming, isLoading, incomingMessage } =
    useChatStream(setMessages);

  // When a new user message is added, scroll to that message
  const { minScrollOffset } = useScrollToLastMessage(messages, scrollableRef, lastUserMessageRef);

  // Handler for sending a message
  const handleSendMessage = async (prompt: string) => {
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
      {messages.length ? (
        // Message list
        <ChatMessageList
          messages={messages}
          lastUserMessageRef={lastUserMessageRef}
          minScrollOffset={minScrollOffset}
          incomingMessage={incomingMessage}
          isStreaming={isStreaming}
          isLoading={isLoading}
        />
      ) : (
        // Initial chat view
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
