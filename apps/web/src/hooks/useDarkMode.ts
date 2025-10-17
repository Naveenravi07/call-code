import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return isDarkMode;
};
