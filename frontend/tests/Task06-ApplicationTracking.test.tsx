import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Input } from '../src/components/forms/Input';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';

// Mock userEvent
const mockUserEvent = vi.mocked('@testing-library/user-event', {}, { shallow: true });

// Mock applicant data
const mockApplicantData = {
  trackingNumber: 'HG-2024-00001',
  name: 'John Doe',
  vertical: 'boys-hostel',
  status: 'SUBMITTED',
  appliedDate: '2024-01-15',
  personalDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '9876543210',
  },
  interviewDetails: {
    mode: 'In-Person',
    date: '2024-01-20',
    time: '10:00 AM',
    venue: 'Main Office',
    status: 'upcoming',
  },
};

describe('Task 6 - Application Tracking Page', () => {
  beforeEach(() => {
    mockUserEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApplicantData)
      }) as any
    );
  });

  afterEach(cleanup);
  mockUserEvent.reset();
  global.fetch = vi.fn();

  describe('Entry Flow and Identity Verification', () => {
    it('renders landing CTA link and nav items', () => {
      render(<AppPage />);
      
      expect(screen.getByText('Check Application Status')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('navigates to tracking page from landing CTA', () => {
      render(<AppPage />);
      
      const ctaButton = screen.getByText('Check Application Status');
      expect(ctaButton).toBeInTheDocument();
    });

    it('renders tracking ID and OTP input forms', () => {
      render(<AppPage />);
      
      const trackingInput = screen.getByLabelText(/Tracking/i);
      const phoneInput = screen.getByLabelText(/Mobile/i);
      const emailInput = screen.getByLabelText(/Email/i);
      
      expect(trackingInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });

    it('validates tracking ID format (HG-2024-NNNNN)', () => {
      render(<AppPage />);
      
      const trackingInput = screen.getByLabelText(/Tracking/i);
      fireEvent.change(trackingInput, { target: { value: 'HG-2024-00123' } });
      
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();
      });
    });

    it('validates phone number (10 digits, starts with 6-9)', () => {
      render(<AppPage />);
      
      const phoneInput = screen.getByLabelText(/Mobile/i);
      
      // Test valid formats
      fireEvent.change(phoneInput, { target: { value: '6234567890' } });
      let errorMessages = screen.queryAllByText(/Invalid/i);
      expect(errorMessages).toHaveLength(0);

      // Test invalid: starts with wrong digit
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      errorMessages = screen.queryAllByText(/Invalid/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('validates email format', () => {
      render(<AppPage />);
      
      const emailInput = screen.getByLabelText(/Email/i);
      
      // Valid email
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      let errorMessages = screen.queryAllByText(/Invalid/i);
      expect(errorMessages).toHaveLength(0);

      // Invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      errorMessages = screen.queryAllByText(/Invalid/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('verifies OTP and redirects to tracking page', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-token',
            expiry: 300000
          })
        }) as any
      );

      render(<AppPage />);

      // Enter tracking ID and phone
      const trackingInput = screen.getByLabelText(/Tracking/i);
      const phoneInput = screen.getByLabelText(/Mobile/i);
      const otpInput1 = screen.getAllByRole('textbox')[0];
      const otpInput2 = screen.getAllByRole('textbox')[1];
      const otpInput3 = screen.getAllByRole('textbox')[2];
      const otpInput4 = screen.getAllByRole('textbox')[3];
      const otpInput5 = screen.getAllByRole('textbox')[4];
      const otpInput6 = screen.getAllByRole('textbox')[5];

      userEvent.type(trackingInput, 'HG-2024-00001');
      userEvent.type(phoneInput, '9876543210');
      userEvent.type(otpInput1, '1');
      userEvent.type(otpInput2, '2');
      userEvent.type(otpInput3, '3');
      userEvent.type(otpInput4, '4');
      userEvent.type(otpInput5, '5');
      userEvent.type(otpInput6, '6');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/otp/verify', expect.anything());
        expect(screen.getByText(/HG-2024-00001/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Core Tracking Page Layout', () => {
    it('renders applicant summary section', () => {
      render(<AppPage />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('boys-hostel')).toBeInTheDocument();
      expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
    });

    it('renders visual status timeline', () => {
      render(<AppPage />);
      
      const timeline = screen.getByTestId('status-timeline');
      expect(timeline).toBeInTheDocument();
      
      // Check that all status steps are rendered
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('renders interview details card', () => {
      render(<AppPage />);
      
      expect(screen.getByText(/In-Person/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/Main Office/i)).toBeInTheDocument();
      expect(screen.getByText(/Schedule Meeting/i)).toBeInTheDocument();
    });

    it('renders action buttons based on status', () => {
      // Test with different statuses
      const testCases = [
        { status: 'SUBMITTED', expectedActions: ['No action available'] },
        { status: 'UNDER_REVIEW', expectedActions: ['Upload Documents'] },
        { status: 'INTERVIEW_SCHEDULED', expectedActions: ['Reschedule Interview', 'Cancel'] },
        { status: 'APPROVED', expectedActions: ['Download Letter', 'Confirm Interview'] },
        { status: 'REJECTED', expectedActions: ['Withdraw Application', 'Contact Office'] },
      ];

      testCases.forEach(({ status, expectedActions }) => {
        const mockData = { ...mockApplicantData, status };
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData)
          }) as any
        );

        render(<AppPage />);

        expectedActions.forEach(action => {
          const actionButton = screen.queryByText(action);
          if (action) {
            expect(actionButton).toBeInTheDocument();
          } else {
            // Check if any of the expected actions are present instead
            const allActionButtons = screen.queryAllByRole('button');
            const hasAnyAction = allActionButtons.some(btn => expectedActions.includes(btn.textContent || ''));
            expect(hasAnyAction).toBe(true);
          }
        });
      });
    });

  describe('State Variations', () => {
    it('shows awaiting documents state', () => {
      const mockData = { ...mockApplicantData, status: 'UNDER_REVIEW', documents: [] };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
          }) as any
      );

      render(<AppPage />);

      expect(screen.getByText('Upload Documents')).toBeInTheDocument();
      expect(screen.getByText(/awaiting document re-upload/i)).toBeInTheDocument();
    });

    it('shows interview in-progress state', () => {
      const mockData = {
        ...mockApplicantData,
        status: 'INTERVIEW_SCHEDULED',
        interviewDetails: { ...mockApplicantData.interviewDetails, status: 'in-progress' }
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
          }) as any
      );

      render(<AppPage />);

      expect(screen.getByText(/in-progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Schedule Meeting/i)).toBeDisabled();
    });

    it('shows provisional approval state', () => {
      const mockData = { ...mockApplicantData, status: 'PROVISIONALLY_APPROVED' };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
          }) as any
      );

      render(<AppPage />);

      expect(screen.getByText(/Provisional Approval/i)).toBeInTheDocument();
      expect(screen.getByText(/Download Provisional Letter/i)).toBeInTheDocument();
    });

    it('shows final approved state', () => {
      const mockData = { ...mockApplicantData, status: 'APPROVED' };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        }) as any
      );

      render(<AppPage />);

      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('View Room Details')).toBeInTheDocument();
    });
  });

  describe('Document Re-upload and Action Patterns', () => {
    it('renders re-upload modal for document missing', () => {
      const mockData = { ...mockApplicantData, status: 'UNDER_REVIEW' };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        }) as any
      );

      render(<AppPage />);

      const uploadButton = screen.getByText('Upload Documents');
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/Re-upload/i)).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('handles interview slot confirmation', () => {
      const mockData = {
        ...mockApplicantData,
        status: 'INTERVIEW_SCHEDULED',
        interviewDetails: { ...mockApplicantData.interviewDetails }
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockData.interviewDetails,
            status: 'confirmed'
          })
        }) as any
      );

      render(<AppPage />);

      const confirmButton = screen.getByText('Confirm Interview Slot');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/interviews',
          expect.objectContaining({ method: 'PUT' })
        );
      });
    });

    it('handles provisional letter download', () => {
      const mockData = { ...mockApplicantData, status: 'PROVISIONALLY_APPROVED' };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        }) as any
      );

      render(<AppPage />);

      const downloadButton = screen.getByText('Download Provisional Letter');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/documents/provisional-letter',
          expect.objectContaining({ method: 'GET' })
        );
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('displays correctly on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });

      render(<AppPage />);

      const timeline = screen.getByTestId('status-timeline');
      expect(timeline).toHaveClass(/vertical/);
    });

    it('displays correctly on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });

      render(<AppPage />);

      const timeline = screen.getByTestId('status-timeline');
      expect(timeline).not.toHaveClass(/vertical/);
    });
  });

  describe('Privacy and Compliance', () => {
    it('hides internal remarks from students', () => {
      const mockData = { ...mockApplicantData, internalRemarks: 'Test remark' };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        }) as any
      );

      render(<AppPage />);

      expect(screen.queryByText('Test remark')).toBeNull();
    });

    it('shows only high-level outcomes and instructions', () => {
      const mockData = { ...mockApplicantData };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        }) as any
      );

      render(<AppPage />);

      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      expect(screen.getByText(/Next steps/i)).toBeInTheDocument();
      expect(screen.queryByText('Interview feedback notes')).toBeNull();
    });
  });
});
