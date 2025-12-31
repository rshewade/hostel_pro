'use client';

import { ResponsiveProvider } from '@/components/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ResponsiveProvider>{children}</ResponsiveProvider>;
}
