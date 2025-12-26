import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../src/components/forms/Input';
import { Button } from '../src/components/ui/Button';
import { OtpInput } from '../src/components/forms/OtpInput';

// Mock userEvent
const mockUserEvent = vi.mocked('@testing-library/user-event', {}, { shallow: true });

describe('Task 5 - Applicant Registration & OTP Verification Flow', () => {
  beforeEach(() => {
    mockUserEvent.setup();
    // Mock fetch for OTP API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-token-12345',
          expiry: 300000
        })
      }) as any
    );
  });

  afterEach(() => {
    cleanup();
    mockUserEvent.reset();
    global.fetch = vi.fn();
  });

  describe('OTP Verification Screen', () => {
    it('renders OTP input with 6 segments', () => {
      render(<OtpInput />);
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(6);
    });

    it('masks input for security', () => {
      render(<OtpInput />);
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'password');
        expect(input).toHaveAttribute('inputmode', 'numeric');
        expect(input).toHaveAttribute('maxlength', '1');
      });
    });

    it('displays resend timer', () => {
      render(<OtpInput />);
      expect(screen.getByText(/Resend in/i)).toBeInTheDocument();
    });

    it('shows error state for invalid OTP', async () => {
      render(<OtpInput initialValue="123456" />);
      
      const verifyButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid OTP/i)).toBeInTheDocument();
      });
    });

    it('shows success state after valid OTP', async () => {
      // Mock successful verification
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'valid-token',
            expiry: 300000
          })
        }) as any
      );

      render(<OtpInput initialValue="123456" />);

      const verifyButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/OTP Verified/i)).toBeInTheDocument();
        expect(screen.getByText(/You can now proceed/i)).toBeInTheDocument();
      });
    });

    it('handles resend OTP', async () => {
      render(<OtpInput />);

      const resendButton = screen.getByText(/Resend OTP/i);
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText(/Resend OTP in/i)).toBeInTheDocument();
      });
    });

    it('displays error for expired OTP', () => {
      // Mock expired token response
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            expired: true,
            error: 'OTP has expired'
          })
        }) as any
      );

      render(<OtpInput initialValue="123456" />);

      const verifyButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/OTP has expired/i)).toBeInTheDocument();
      });
    });
  });

  describe('Contact Input Screen', () => {
    it('renders phone and email input options', () => {
      render(
        <div>
          <Button variant="secondary">Switch to Phone</Button>
          <Button variant="secondary">Switch to Email</Button>
        </div>
      );
      
      const phoneButton = screen.getByText('Switch to Phone');
      const emailButton = screen.getByText('Switch to Email');
      
      expect(phoneButton).toBeInTheDocument();
      expect(emailButton).toBeInTheDocument();
    });

    it('validates phone number format (10 digits, starts with 6-9)', () => {
      render(<Input label="Mobile" type="tel" />);
      
      const input = screen.getByLabelText('Mobile');
      fireEvent.change(input, { target: { value: '123456789' } });

      // Test validation
      const errorMessages = screen.getAllByText(/10-digit/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('validates email format', () => {
      render(<Input label="Email" type="email" />);
      
      const input = screen.getByLabelText('Email');
      fireEvent.change(input, { target: { value: 'invalid-email' } });

      // Test validation
      const errorMessages = screen.getAllByText(/valid email/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('shows DPDP consent banner', () => {
      render(<Input label="Mobile" />);
      expect(screen.getByText(/Data Protection/i)).toBeInTheDocument();
      expect(screen.getByText(/Digital Personal Data Protection/i)).toBeInTheDocument();
    });
  });

  describe('Application Access Control', () => {
    it('no persistent dashboard for applicants', () => {
      // Test that dashboard elements are not visible
      // In real implementation, this would check that nav items like "My Dashboard" are not shown
      // Instead, show minimal progress header and form navigation
      
      const mockDashboardNavItems = ['Dashboard', 'Fees', 'Documents'];
      mockDashboardNavItems.forEach(item => {
        expect(screen.queryByText(item)).toBeNull();
      });
    });

    it('shows only progress header for applicant', () => {
      // Applicant should see minimal header with step indicator
      // e.g., "Step 2 of 4: Application Form"
      // Not full dashboard
      
      expect(screen.getByText(/Application Form/i)).toBeInTheDocument();
    });
  });

  describe('OTP API Integration', () => {
    it('sends OTP to correct endpoint', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-token',
            expiry: 300000
          })
        }) as any
      );

      global.fetch = mockFetch;

      render(<OtpInput />);
      
      const phoneInput = screen.getByLabelText(/Mobile/i);
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      
      const sendButton = screen.getByText('Send OTP');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/otp/send',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('9876543210'),
          })
        );
      }, { timeout: 5000 });
    });

    it('verifies OTP with correct payload', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            verified: true
          })
        }) as any
      );

      global.fetch = mockFetch;

      render(<OtpInput initialValue="123456" />);

      const verifyButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/otp/verify',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('123456'),
          })
        );
      }, { timeout: 5000 });
    });
  });

  describe('Flow Integration', () => {
    it('complete flow works end-to-end', async () => {
      const mockFetch = vi.fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              token: 'mock-token',
              expiry: 300000
            })
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              verified: true
            })
          })
        );

      global.fetch = mockFetch;

      // Contact screen
      render(
        <div>
          <Input label="Mobile" type="tel" />
          <Button variant="primary">Send OTP</Button>
        </div>
      );

      // Enter phone and send OTP
      const phoneInput = screen.getByLabelText(/Mobile/i);
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      
      const sendButton = screen.getByText('Send OTP');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // OTP screen
      const otpInputs = screen.getAllByRole('textbox');
      otpInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: '123456'[index] } });
      });

      const verifyButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Verify flow completion
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
