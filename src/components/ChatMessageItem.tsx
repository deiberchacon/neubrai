import { memo } from 'react';
import { ChatMessage } from '../types/common.types';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLast?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  offset?: number;
}

const ChatMessageItem = memo(
  ({ message, isLast, ref, offset }: ChatMessageItemProps) => {
    return (
      <div
        ref={ref}
        style={isLast ? { minHeight: `${offset}px` } : {}}
        className={
          message.role === 'user'
            ? 'mb-4 w-full max-w-96 self-end rounded-tl-4xl rounded-b-4xl bg-sky-100 px-5 py-3'
            : 'w-full'
        }
      >
        {message.role === 'assistant' ? (
          <Markdown
            components={{
              code({ node, inline, className, children, ...rest }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...rest}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="rounded-lg bg-slate-100 px-2 py-0.5 font-normal text-slate-700"
                    {...rest}
                  >
                    {children}
                  </code>
                );
              },
              p({ node, ...rest }: any) {
                return <p className="mb-4 leading-6" {...rest} />;
              },
              li({ node, ...rest }: any) {
                return <li className="mb-2 pl-5 leading-6" {...rest} />;
              },
              ol({ node, ...rest }: any) {
                return (
                  <ol className="mt-2 mb-3 ml-2 list-decimal pl-5" {...rest} />
                );
              },
              ul({ node, ...rest }: any) {
                return (
                  <ul className="mt-2 mb-3 ml-2 list-disc pl-5" {...rest} />
                );
              },
            }}
          >
            {message.content.replace(/\n/g, '  \n')}
          </Markdown>
        ) : (
          message.content.replace(/\n/g, '  \n')
        )}
      </div>
    );
  }
);

export default ChatMessageItem;
