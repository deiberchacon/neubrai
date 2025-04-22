import { ChatMessage } from '../types/common.types';

export const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  return (
    <div>
      {message.role === 'user' ? 'User' : 'Assistant'}: {message.content}
    </div>
  );
};
