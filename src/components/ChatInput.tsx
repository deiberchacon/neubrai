'use client';

import { useState, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { ChatInputProps } from '../types/common.types';
import { twMerge } from 'tailwind-merge';

const ChatInput: React.FC<ChatInputProps> = ({
  isLoading,
  isStreaming,
  onSendMessage,
  onCancelStream,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const hasPrompt = prompt.trim().length;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!prompt.trim()) return;

      onSendMessage(prompt);
      setPrompt('');
    },
    [prompt, onSendMessage]
  );

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex w-full justify-center bg-gradient-to-b from-transparent from-0% to-white to-40% px-4 pt-6 pb-8">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col items-end justify-end rounded-3xl border-1 border-gray-300 bg-white px-5 py-4"
      >
        <textarea
          autoFocus
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
            className={twMerge(
              'rounded-full bg-gray-100 p-3 text-gray-500 transition-colors duration-200 ease-in-out',
              hasPrompt &&
                'cursor-pointer bg-sky-100 text-gray-700 hover:text-gray-950'
            )}
            disabled={!hasPrompt}
            type="submit"
          >
            <SendHorizontal className="size-5" />
          </button>
        ) : (
          // Cancel button to stop the streaming
          <button
            type="button"
            className="size-[44px] cursor-pointer rounded-full bg-sky-100 text-gray-700 transition-colors duration-200 ease-in-out hover:text-gray-950"
            onClick={onCancelStream}
          >
            ■
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
