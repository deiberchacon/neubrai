'use client';

import { usePersistentContext } from 'persistent-context';
import { ThemeState } from '@/types/common.types';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const { state, setState } = usePersistentContext<ThemeState>();

  const handleClick = () => {
    setState((prevState) => ({
      ...prevState,
      darkMode: !prevState.darkMode,
    }));
  };

  return (
    <button onClick={handleClick} className="cursor-pointer">
      {state.darkMode ? <Sun className="text-white" /> : <Moon /> }
    </button>
  );
};

export default DarkModeToggle;
