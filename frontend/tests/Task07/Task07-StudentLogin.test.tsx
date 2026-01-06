import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../src/app/login/page';
import FirstTimeSetupPage from '../../src/app/login/first-time-setup/page';

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
    vi.clearAllMocks();
    
    // Default mock for fetch
    global.fetch = vi.fn((url: string, options?: any) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              role: 'student',
              token: 'mock-token-123',
              requiresPasswordChange: false,
            },
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
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
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
      // The checkbox label is in a span, not associated via aria-label
      expect(screen.getByText(/I accept the Data Protection and Privacy Principles/i)).toBeInTheDocument();
    });
  });

  describe('Role-based Redirection', () => {
    it('redirects to Student Dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            data: { role: 'student', token: 'mock-token', requiresPasswordChange: false }
          }),
        }) as any
      );

      render(<LoginPage />);

      // Fill in the form
      const usernameInput = screen.getByLabelText(/Username, Email, or Mobile/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/student');
      }, { timeout: 1000 });
    });

    it('redirects to superintendent dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            data: { role: 'superintendent', token: 'mock-token', requiresPasswordChange: false }
          }),
        }) as any
      );

      render(<LoginPage />);

      const usernameInput = screen.getByLabelText(/Username, Email, or Mobile/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(usernameInput, { target: { value: 'superintendent' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/superintendent');
      }, { timeout: 1000 });
    });

    it('redirects to trustee dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            data: { role: 'trustee', token: 'mock-token', requiresPasswordChange: false }
          }),
        }) as any
      );

      render(<LoginPage />);

      const usernameInput = screen.getByLabelText(/Username, Email, or Mobile/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(usernameInput, { target: { value: 'trustee' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/trustee');
      }, { timeout: 1000 });
    });

    it('redirects to accounts dashboard', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            data: { role: 'accounts', token: 'mock-token', requiresPasswordChange: false }
          }),
        }) as any
      );

      render(<LoginPage />);

      const usernameInput = screen.getByLabelText(/Username, Email, or Mobile/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(usernameInput, { target: { value: 'accounts' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/accounts');
      }, { timeout: 1000 });
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
