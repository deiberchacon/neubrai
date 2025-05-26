'use client';

import { RefObject, useEffect, useRef } from 'react';
import { ChatMessage } from '../types/common.types';

export const useScrollToLastMessage = (
  messages: ChatMessage[],
  scrollableRef: RefObject<HTMLDivElement>,
  lastUserMessageRef: RefObject<HTMLDivElement>
) => {
  const minScrollOffset = useRef(0);

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
  }, [messages, scrollableRef, lastUserMessageRef]);

  return { minScrollOffset };
};
