import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../src/app/login/page';
import FirstTimeSetupPage from '../src/app/login/first-time-setup/page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(''),
  useParams: () => ({}),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe('Task 7 - Student Login, First-time Setup, and Role-based Redirection', () => {
  beforeEach(() => {
    mockPush.mockClear();
    global.fetch = vi.fn((url: string, options?: any) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            role: 'student',
            token: 'mock-token-123',
            requiresPasswordChange: false,
          }),
        }) as any;
      }
      if (url.includes('/api/auth/first-time-setup')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Password updated successfully',
            role: 'student',
          }),
        }) as any;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      }) as any;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('renders login form for students', () => {
      render(<LoginPage />);

      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to access your dashboard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Username, Email, or Mobile/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('displays "Forgot Password" link', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByText('Forgot Password?');
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/login/forgot-password');
    });

    it('has "Parent Login" link', () => {
      render(<LoginPage />);

      expect(screen.getByText(/Are you a parent\/guardian/i)).toBeInTheDocument();
      expect(screen.getByText(/Use OTP-based Parent Login/i)).toBeInTheDocument();
    });
  });

  describe('First-time Password Change', () => {
    it('detects first-time login and shows password change screen', () => {
      render(<FirstTimeSetupPage />);

      expect(screen.getByText(/First-Time Password Change/i)).toBeInTheDocument();
      expect(screen.getByText(/For security purposes, please set a new password/i)).toBeInTheDocument();
    });

    it('shows DPDP consent checkbox', () => {
      render(<FirstTimeSetupPage />);

      expect(screen.getAllByText(/DPDP/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Data Protection and Privacy Principles/i)).toBeInTheDocument();
    });
  });

  describe('Role-based Redirection', () => {
    it('redirects to Student Dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ role: 'student', token: 'mock-token' }),
        }) as any
      );

      render(<LoginPage />);

      const submitButton = screen.getByText('Sign In');
      submitButton.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/student');
    });

    it('redirects to superintendent dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ role: 'superintendent', token: 'mock-token' }),
        }) as any
      );

      render(<LoginPage />);

      const submitButton = screen.getByText('Sign In');
      submitButton.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/superintendent');
    });

    it('redirects to trustee dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ role: 'trustee', token: 'mock-token' }),
        }) as any
      );

      render(<LoginPage />);

      const submitButton = screen.getByText('Sign In');
      submitButton.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/trustee');
    });

    it('redirects to accounts dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ role: 'accounts', token: 'mock-token' }),
        }) as any
      );

      render(<LoginPage />);

      const submitButton = screen.getByText('Sign In');
      submitButton.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/accounts');
    });
  });

  describe('Forgot Password Flow', () => {
    it('renders forgot password link', () => {
      render(<LoginPage />);

      expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    });
  });

  describe('Session Handling and Security', () => {
    it('password input type is masked', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('provides clear institutional messaging about usage', () => {
      render(<LoginPage />);

      expect(screen.getByText(/Institutional Usage Rules/i)).toBeInTheDocument();
      expect(screen.getByText(/All login attempts are logged for security purposes/i)).toBeInTheDocument();
      expect(screen.getByText(/This system is for authorized use only/i)).toBeInTheDocument();
    });
  });
});
