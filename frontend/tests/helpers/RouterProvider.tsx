import { ReactNode } from 'react';

/**
 * RouterProvider - Placeholder for test router context
 *
 * Note: In Next.js App Router, use the jest.mock() approach for useRouter
 * instead of a context provider. This file is kept for potential future use.
 */
interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider = ({ children }: RouterProviderProps) => {
  return <>{children}</>;
};
