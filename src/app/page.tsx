'use client';

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types/common.types';
import { SendHorizontal } from 'lucide-react';
import ChatMessageItem from '../components/ChatMessageItem';
import Header from '../components/Header';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<string>('');

  const scrollableRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const minScrollOffset = useRef<number>(0);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt || isLoading || isStreaming) return;

    setPrompt('');
    setIsLoading(true);

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    // Call the API route
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    // Check if the response is not successful
    if (!response.ok) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error' }]);
      console.error('Error:', response.statusText);
      return;
    }

    // Check if the response is empty
    if (!response.body) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry I can't answer in this moment" },
      ]);

      return;
    }

    // Stream the response
    readerRef.current = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    // const reader = readerRef.current;

    // Handle the stream
    if (readerRef.current) {
      setIsLoading(false);
      setIsStreaming(true);

      let message = '';

      while (true) {
        const { done, value } = await readerRef.current.read();

        // If the stream is done, add the message to the chat
        // and reset the incoming message
        if (done) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: message },
          ]);

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
  };

  return (
    <div className="mt-16 mb-[182px] grid grid-cols-1 bg-white">
      <Header />
      <main
        ref={scrollableRef}
        className="scrollbar flex h-[calc(100vh-205px)] flex-col overflow-y-auto p-4"
      >
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
              isLast={
                message.role === 'assistant' && index === messages.length - 1
              }
            />
          ))}

          {/* Display the incoming message as it streams */}
          {incomingMessage && (
            <ChatMessageItem
              message={{
                role: 'assistant',
                content: incomingMessage,
              }}
              isLast={true}
              offset={minScrollOffset.current}
            />
          )}

          {isLoading && (
            <ChatMessageItem
              message={{
                role: 'assistant',
                content: 'Thinking...',
              }}
              isLast={true}
              offset={minScrollOffset.current}
            />
          )}

          {isStreaming && <div>Typing...</div>}
        </div>

        <div className="fixed right-0 bottom-0 left-0 z-10 flex w-full justify-center bg-gradient-to-b from-transparent from-0% to-white to-40% px-4 pt-6 pb-8">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-2xl flex-col items-end justify-end rounded-3xl border-1 border-gray-300 bg-white px-5 py-4"
          >
            <textarea
              className="w-full resize-none outline-none"
              placeholder="Ask anything..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {!isLoading && !isStreaming ? (
              // Send button to submit the prompt
              <button
                className={`rounded-full p-3 transition-colors duration-200 ease-in-out ${!prompt.trim().length ? 'bg-gray-100 text-gray-500' : 'cursor-pointer bg-sky-100 text-gray-700 hover:text-gray-950'}`}
                disabled={!prompt.trim().length}
                type="submit"
              >
                <SendHorizontal className="size-5" />
              </button>
            ) : (
              // Cancel button to stop the streaming
              <button
                className="size-[44px] cursor-pointer rounded-full bg-sky-100 text-gray-700 transition-colors duration-200 ease-in-out hover:text-gray-950"
                onClick={() => {
                  if (readerRef.current) {
                    readerRef.current.cancel();
                    setIsStreaming(false);
                    setIncomingMessage('');
                  }
                }}
              >
                ■
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Home;
