import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { useRouter } from './tests/mocks/next/navigation';
import { useSearchParams } from './tests/mocks/next/navigation';
import { usePathname } from './tests/mocks/next/navigation';


expect.extend(matchers);

afterEach(() => {
  cleanup();
});
