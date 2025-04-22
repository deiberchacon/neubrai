'use client';

import { useState } from 'react';
import { ChatMessage } from '../types/common.types';
import { ChatMessageItem } from '../components/ChatMessageItem';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) return;

    setIsLoading(true);
    setPrompt('');

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

    if (!response.body) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry I can't answer" },
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
    <div>
      <div>
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

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Ask anything..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;
