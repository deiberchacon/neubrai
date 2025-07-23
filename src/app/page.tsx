'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatWindow from '@/components/ChatWindow';
import { PersistentProvider } from 'persistent-context';
import { ThemeState } from '@/types/common.types';


const Home = () => {
  const [isClient, setIsClient] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({
    darkMode: false, // Default to false (light mode)
  });

  useEffect(() => {
    setIsClient(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState({ darkMode: prefersDark });
  }, []);

  // Avoid hydration issues
  if (!isClient) return null;

  return (
    <PersistentProvider<ThemeState> initialState={themeState} storageKey="theme-preferences">
      <div className="mt-16 mb-[182px] grid grid-cols-1 bg-white dark:bg-slate-900">
        <Header />
        <ChatWindow />
      </div>
    </PersistentProvider>
  );
};

export default Home;
