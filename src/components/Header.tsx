'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { usePersistentContext } from 'persistent-context';
import { ThemeState } from '@/types/common.types';

const Header = () => {
  const { state } = usePersistentContext<ThemeState>();

  // Set theme (dark or light)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return (
    <header className="fixed top-0 right-0 left-0 z-10 flex h-16 items-center justify-between bg-white dark:bg-slate-900 p-4">
      <Link href="/" className="font-mono text-lg font-bold uppercase dark:text-white">
        Neubrai
      </Link>
      <DarkModeToggle />
    </header>
  );
};

export default Header;
