'use client';

import { ResponsiveProvider } from '@/components/layout';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ResponsiveProvider>{children}</ResponsiveProvider>
    </LanguageProvider>
  );
}
