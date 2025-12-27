import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { Input } from '../src/components/forms/Input';
import { Button } from '../src/components/ui/Button';
import { OtpInput } from '../src/components/forms/OtpInput';

// Mock auth context
const mockAuthContext = {
  isAuthenticated: vi.fn(() => false),
  user: vi.fn(() => null),
  login: vi.fn(),
  logout: vi.fn(),
};

// Mock student user
const mockStudentUser = {
  id: 'student-001',
  name: 'John Doe',
  vertical: 'boys-hostel',
  role: 'STUDENT',
  email: 'john.doe@email.com',
  phone: '9876543210',
  room: 'Room 101',
  roomType: '2-sharing',
  status: 'ACTIVE',
};

// Mock parent user
const mockParentUser = {
  id: 'parent-001',
  name: 'Jane Doe',
  wardStudentIds: ['student-001'],
  email: 'jane.doe@email.com',
  phone: '9876543211',
  role: 'PARENT',
};

describe('Task 7 - Student Login, First-time Setup, and Role-based Redirection', () => {
  afterEach(cleanup);

  describe('Login Page', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated.mockReturnValue(false);
      mockAuthContext.user.mockReturnValue(null);
    });

    it('renders login form for students', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('validates email format', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);
      
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    it('validates password strength', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);
      
      const passwordInput = screen.getByLabelText(/Password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak123' } });

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('shows error for invalid credentials', async () => {
      mockAuthContext.login.mockRejectedValue(new Error('Invalid credentials'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'student@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('redirects to Student Dashboard on successful login', async () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'student@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockAuthContext.login).toHaveBeenCalled();
        expect(window.location.pathname).toBe('/dashboard/student');
      });
    });
  });

  describe('First-time Password Change', () => {
    it('detects first-time login and shows password change screen', async () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockRejectedValue(new Error('First-time login required'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
        expect(screen.getByText(/must change your password/i)).toBeInTheDocument();
        expect(screen.getByText(/Continue/i)).toBeInTheDocument();
      });
    });

    it('validates new password format', () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockRejectedValue(new Error('First-time login required'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const newPassword = screen.getByLabelText(/New Password/i);
      const confirmPassword = screen.getByLabelText(/Confirm Password/i);

      // Weak password - should fail
      fireEvent.change(newPassword, { target: { value: 'weak' } });
      fireEvent.change(confirmPassword, { target: { value: 'weak' } });

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation', () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockRejectedValue(new Error('First-time login required'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const newPassword = screen.getByLabelText(/New Password/i);
      const confirmPassword = screen.getByLabelText(/Confirm Password/i);

      // Passwords don't match
      fireEvent.change(newPassword, { target: { value: 'password123' } });
      fireEvent.change(confirmPassword, { target: { value: 'different' } });

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/do not match/i)).toBeInTheDocument();
      });
    });

    it('shows DPDP consent checkbox', () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockRejectedValue(new Error('First-time login required'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const consentCheckbox = screen.getByLabelText(/I agree to the DPDP terms/i);

      expect(consentCheckbox).toBeInTheDocument();
      expect(consentCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('prevents password change without consent', async () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const newPassword = screen.getByLabelText(/New Password/i);
      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      const consentCheckbox = screen.getByLabelText(/DPDP/i);

      fireEvent.change(newPassword, { target: { value: 'NewPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Consent required/i)).toBeInTheDocument();
      });
    });

    it('requires consent before confirming password change', async () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const newPassword = screen.getByLabelText(/New Password/i);
      const confirmPassword = screen.getByLabelText(/Confirm Password/i);
      const consentCheckbox = screen.getByLabelText(/DPDP/i);

      // Give consent
      fireEvent.click(consentCheckbox);
      // Fill in passwords
      fireEvent.change(newPassword, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPassword, { target: { value: 'NewPass123!' } });

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Redirection', () => {
    const roleRoutes = {
      STUDENT: '/dashboard/student',
      SUPERINTENDENT: '/dashboard/superintendent',
      TRUSTEE: '/dashboard/trustee',
      ACCOUNTS: '/dashboard/accounts',
      PARENT: '/dashboard/parent',
    };

    it('redirects to Student Dashboard', () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'student@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(roleRoutes.STUDENT);
      });
    });

    it('redirects Superintendent to superintendent dashboard', () => {
      const mockSuperintendentUser = {
        ...mockStudentUser,
        role: 'SUPERINTENDENT',
      };

      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockSuperintendentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'superintendent@hostel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(roleRoutes.SUPERINTENDENT);
      });
    });

    it('redirects Trustee to trustee dashboard', () => {
      const mockTrusteeUser = {
        ...mockStudentUser,
        role: 'TRUSTEE',
      };

      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockTrusteeUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'trustee@hostel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(roleRoutes.TRUSTEE);
      });
    });

    it('redirects Accounts to accounts dashboard', () => {
      const mockAccountsUser = {
        ...mockStudentUser,
        role: 'ACCOUNTS',
      };

      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockAccountsUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'accounts@hostel.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(roleRoutes.ACCOUNTS);
      });
    });

    it('shows error for wrong role login', async () => {
      const mockStudentUser = {
        ...mockStudentUser,
      role: 'PARENT',
      };

      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockParentUser);
      mockAuthContext.login.mockRejectedValue(new Error('Invalid role'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'parent@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid role/i)).toBeInTheDocument();
        expect(window.location.pathname).not.toBe('/dashboard/student');
      });
    });

    it('shows error for suspended/expired accounts', async () => {
      const mockSuspendedStudent = {
        ...mockStudentUser,
        status: 'SUSPENDED',
        role: 'STUDENT',
      };

      mockAuthContext.isAuthenticated.mockReturnValue(false);
      mockAuthContext.user.mockReturnValue(null);
      mockAuthContext.login.mockRejectedValue(new Error('Account suspended'));

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'student@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/suspended/i)).toBeInTheDocument();
        expect(screen.getByText(/contact office/i)).toBeInTheDocument();
      });
    });
  });

  describe('Forgot Password Flow', () => {
    it('renders forgot password link', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const forgotLink = screen.getByText(/Forgot password/i);
      expect(forgotLink).toBeInTheDocument();
    });

    it('shows OTP/email reset options', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      expect(screen.getByText(/Send OTP/i)).toBeInTheDocument();
      expect(screen.getByText(/Send Email/i)).toBeInTheDocument();
    });
  });

  describe('Session Handling and Security', () => {
    it('shows vertical context on login success', async () => {
      mockAuthContext.isAuthenticated.mockReturnValue(true);
      mockAuthContext.user.mockReturnValue(mockStudentUser);
      mockAuthContext.login.mockResolvedValue(undefined);

      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'student@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.queryByText(/Boys Hostel/i)).toBeInTheDocument();
        expect(screen.queryByText(/Girls Ashram/i)).toBeNull();
        expect(screen.queryByText(/Dharamshala/i)).toBeNull();
      });
    });

    it('does not expose passwords in front-end', () => {
      // Test that password input type is password
      render(<BrowserRouter><LoginPage /></BrowserRouter>);
      
      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('provides clear institutional messaging about usage', () => {
      render(<BrowserRouter><LoginPage /></BrowserRouter>);

      expect(screen.getByText(/institutional usage/i)).toBeInTheDocument();
    });
  });
});
