// Next.js Router Mock Implementation
// Creates mocks for useRouter, useSearchParams, usePathname for test environment
import { vi } from 'vitest';

// Mock implementations
export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockPathname = vi.fn().mockReturnValue('/dashboard/student');

export const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  pathname: mockPathname,
  query: {},
  asPath: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
}));

export const useSearchParams = vi.fn(() => ({
  get: vi.fn(() => ({})),
}));

export const usePathname = vi.fn(() => ({
  pathname: mockPathname,
  params: {},
  search: {},
}));
