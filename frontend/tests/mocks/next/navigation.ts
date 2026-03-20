import { vi } from 'vitest';

export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockBack = vi.fn();
export const mockForward = vi.fn();
export const mockPrefetch = vi.fn();
export const mockRefresh = vi.fn();

export const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  forward: mockForward,
  prefetch: mockPrefetch,
  refresh: mockRefresh,
}));

export const useSearchParams = vi.fn(() => ({
  get: vi.fn((key: string) => null),
  getAll: vi.fn(() => []),
  has: vi.fn(() => false),
  toString: vi.fn(() => ''),
}));

export const usePathname = vi.fn(() => '/');

export const useParams = vi.fn(() => ({}));
