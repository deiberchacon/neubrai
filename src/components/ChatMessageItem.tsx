import { memo } from 'react';
import { ChatMessageItemProps } from '../types/common.types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Markdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

const ChatMessageItem = memo(
  ({ message, ref, offset, isLast, isLoading }: ChatMessageItemProps) => {
    return (
      <div
        ref={ref}
        style={isLast ? { minHeight: `${offset}px` } : {}}
        className={twMerge(
          'w-full',
          message.role === 'user' &&
            'my-4 w-full max-w-96 self-end rounded-tl-4xl rounded-b-4xl dark:bg-slate-800 dark:text-white bg-sky-100 px-5 py-3',
          message.role === 'user' && isLoading && 'mb-2 font-mono text-gray-500',
        )}
      >
        {message.role === 'model' ? (
          // Format the message content using Markdown
          <div className='prose dark:prose-invert'>
            <Markdown components={markdownConfig}>{message.content.replace(/\n/g, '  \n')}</Markdown>
          </div>
        ) : (
          message.content.replace(/\n/g, '  \n')
        )}
      </div>
    );
  },
);

const markdownConfig = {
  code({ node, inline, className, children, ...rest }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ margin: 0}} {...rest}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="rounded-lg bg-slate-100 dark:bg-slate-800 dark:text-gray-300 px-2 py-0.5 font-normal text-slate-700" {...rest}>
        {children}
      </code>
    );
  },
};

export default ChatMessageItem;
