'use client';

import { useRef, useEffect, useState, ReactHTMLElement } from 'react';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    scrollToBottom();
  }, [messages, incomingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) return;

    setPrompt('');
    setIsLoading(true);

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    // Call the API route
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

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
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    // Handle the stream
    if (reader) {
      setIsLoading(false);
      setIsStreaming(true);

      let message = '';

      while (true) {
        const { done, value } = await reader.read();

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
    <div className="grid h-screen grid-cols-1 grid-rows-[auto_1fr] overflow-y-auto bg-white">
      <Header />
      <main
        className="mt-16 flex flex-col overflow-y-auto px-4 pt-4 pb-[182px]"
        ref={chatContainerRef}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {/* Display the chat messages */}
          {messages.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}

          {/* Display the incoming message as it streams */}
          {incomingMessage && (
            <ChatMessageItem
              message={{ role: 'assistant', content: incomingMessage }}
            />
          )}

          {isStreaming && <div>Typing...</div>}
        </div>

        {isLoading && <div>Thinking...</div>}

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
            <button
              className="cursor-pointer rounded-full bg-gray-100 p-3 transition-colors duration-200 ease-in-out hover:bg-gray-200"
              disabled={!prompt.trim().length}
              type="submit"
            >
              <SendHorizontal className="size-5 text-gray-500" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Home;
