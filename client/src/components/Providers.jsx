'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';

function ThemeSync() {
  const { theme, resolvedTheme } = useTheme();
  
  React.useEffect(() => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    if (currentTheme === 'business') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, resolvedTheme]);

  return null;
}

export function Providers({ children }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="corporate"
      enableSystem={false}
      themes={['corporate', 'business']}
    >
      <ThemeSync />
      {children}
      <Toaster position="top-right" richColors />
    </NextThemesProvider>
  );
}
