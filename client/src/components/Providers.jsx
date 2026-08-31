'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
export function Providers({ children }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="corporate"
      enableSystem={false}
      themes={['corporate', 'business']}
    >
      {children}
      <Toaster position="top-right" richColors />
    </NextThemesProvider>
  );
}
