import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentExitPage from '../src/app/dashboard/student/exit/page';
import { ExitRequestForm } from '../src/components/exit/ExitRequestForm';
import { ExitStatusBadge } from '../src/components/exit/ExitStatusBadge';
import { AuditTrailPanel } from '../src/components/exit/AuditTrailPanel';
import { ExitImplicationsBanner } from '../src/components/exit/ExitImplicationsBanner';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock fetch
global.fetch = vi.fn();

describe('Task 20.1 - Student Exit Request Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Exit Request Form - Basic Rendering', () => {
    it('should render all required form fields', () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      expect(screen.getByLabelText(/Desired Exit Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Reason for Exit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pincode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });

    it('should display submit and save draft buttons in DRAFT status', () => {
      const mockSubmit = vi.fn();
      const mockSaveDraft = vi.fn();
      render(
        <ExitRequestForm
          currentStatus="DRAFT"
          onSubmit={mockSubmit}
          onSaveDraft={mockSaveDraft}
        />
      );

      expect(screen.getByText('Submit Exit Request')).toBeInTheDocument();
      expect(screen.getByText('Save as Draft')).toBeInTheDocument();
    });

    it('should disable form fields when status is not DRAFT', () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="SUBMITTED" onSubmit={mockSubmit} />);

      const exitDateInput = screen.getByLabelText(/Desired Exit Date/i);
      expect(exitDateInput).toBeDisabled();
    });
  });

  describe('Exit Request Form - Validation', () => {
    it('should validate required fields on submit', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Exit date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Reason is required/i)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it.skip('should validate minimum notice period (30 days)', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      const today = new Date();
      const tomorrowStr = new Date(today.setDate(today.getDate() + 1))
        .toISOString()
        .split('T')[0];

      // Fill all required fields except the date should be invalid
      fireEvent.change(screen.getByLabelText(/Desired Exit Date/i), {
        target: { value: tomorrowStr },
      });
      fireEvent.change(screen.getByLabelText(/Reason for Exit/i), {
        target: { value: 'Valid reason for exit request' },
      });
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/City/i), {
        target: { value: 'Mumbai' },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Maharashtra' },
      });
      fireEvent.change(screen.getByLabelText(/Pincode/i), {
        target: { value: '400001' },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'valid@example.com' },
      });

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 30 days from today/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid phone number format/i)).toBeInTheDocument();
      });
    });

    it.skip('should validate email format', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      // Fill all required fields except email should be invalid
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 35);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      fireEvent.change(screen.getByLabelText(/Desired Exit Date/i), {
        target: { value: futureDateStr },
      });
      fireEvent.change(screen.getByLabelText(/Reason for Exit/i), {
        target: { value: 'Valid reason for exit request' },
      });
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/City/i), {
        target: { value: 'Mumbai' },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Maharashtra' },
      });
      fireEvent.change(screen.getByLabelText(/Pincode/i), {
        target: { value: '400001' },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'invalidemail' },
      });

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate pincode format (6 digits)', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      const pincodeInput = screen.getByLabelText(/Pincode/i);
      fireEvent.change(pincodeInput, { target: { value: '123' } });

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid pincode format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Exit Request Flow - Draft Creation and Editing', () => {
    it('should save draft with partial data', async () => {
      const mockSaveDraft = vi.fn();
      render(
        <ExitRequestForm
          currentStatus="DRAFT"
          onSubmit={vi.fn()}
          onSaveDraft={mockSaveDraft}
        />
      );

      const reasonInput = screen.getByLabelText(/Reason for Exit/i);
      fireEvent.change(reasonInput, {
        target: { value: 'Completing my studies and relocating' },
      });

      const saveDraftButton = screen.getByText('Save as Draft');
      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(mockSaveDraft).toHaveBeenCalled();
      });
    });

    it('should allow editing draft before submission', () => {
      const initialData = {
        reason: 'Initial reason',
        desiredExitDate: '2025-02-15',
      };

      render(
        <ExitRequestForm
          currentStatus="DRAFT"
          initialData={initialData}
          onSubmit={vi.fn()}
        />
      );

      const reasonInput = screen.getByLabelText(/Reason for Exit/i);
      expect(reasonInput).toHaveValue('Initial reason');
      expect(reasonInput).not.toBeDisabled();

      fireEvent.change(reasonInput, { target: { value: 'Updated reason' } });
      expect(reasonInput).toHaveValue('Updated reason');
    });

    it('should submit valid form data', async () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="DRAFT" onSubmit={mockSubmit} />);

      // Fill valid exit date (30+ days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 35);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      fireEvent.change(screen.getByLabelText(/Desired Exit Date/i), {
        target: { value: futureDateStr },
      });

      fireEvent.change(screen.getByLabelText(/Reason for Exit/i), {
        target: { value: 'Completing studies and moving back home' },
      });

      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '123 Main St' },
      });

      fireEvent.change(screen.getByLabelText(/City/i), {
        target: { value: 'Mumbai' },
      });

      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Maharashtra' },
      });

      fireEvent.change(screen.getByLabelText(/Pincode/i), {
        target: { value: '400001' },
      });

      fireEvent.change(screen.getByLabelText(/Phone Number/i), {
        target: { value: '9876543210' },
      });

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'student@example.com' },
      });

      const submitButton = screen.getByText('Submit Exit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Status Badge Component', () => {
    it('should render DRAFT status badge', () => {
      render(<ExitStatusBadge status="DRAFT" />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render SUBMITTED status badge', () => {
      render(<ExitStatusBadge status="SUBMITTED" />);
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    it('should render UNDER_CLEARANCE status badge', () => {
      render(<ExitStatusBadge status="UNDER_CLEARANCE" />);
      expect(screen.getByText('Under Clearance')).toBeInTheDocument();
    });

    it('should render APPROVED status badge', () => {
      render(<ExitStatusBadge status="APPROVED" />);
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('should render REJECTED status badge', () => {
      render(<ExitStatusBadge status="REJECTED" />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  describe('Implications Banner', () => {
    it('should display exit implications', () => {
      render(<ExitImplicationsBanner />);

      expect(screen.getByText(/Exit Process Implications/i)).toBeInTheDocument();
      expect(screen.getByText(/Deposit & Fees/i)).toBeInTheDocument();
      expect(screen.getByText(/Notice Period/i)).toBeInTheDocument();
      expect(screen.getByText(/Room Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Clearance Required/i)).toBeInTheDocument();
    });

    it('should warn about irreversibility after submission', () => {
      render(<ExitImplicationsBanner />);

      expect(
        screen.getByText(/cannot be cancelled after the clearance process begins/i)
      ).toBeInTheDocument();
    });
  });

  describe('Audit Trail Panel', () => {
    it('should display audit entries', () => {
      const entries = [
        {
          id: '1',
          action: 'CREATED' as const,
          description: 'Exit request draft created',
          actor: 'John Doe',
          actorRole: 'Student',
          timestamp: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          action: 'EDITED' as const,
          description: 'Exit request draft updated',
          actor: 'John Doe',
          actorRole: 'Student',
          timestamp: '2025-01-02T11:00:00Z',
        },
      ];

      render(<AuditTrailPanel entries={entries} />);

      expect(screen.getByText('Audit Trail')).toBeInTheDocument();
      expect(screen.getByText('Exit request draft created')).toBeInTheDocument();
      expect(screen.getByText('Exit request draft updated')).toBeInTheDocument();
      expect(screen.getAllByText('John Doe')).toHaveLength(2);
    });

    it('should show empty state when no entries', () => {
      render(<AuditTrailPanel entries={[]} />);

      expect(screen.getByText(/No activity recorded yet/i)).toBeInTheDocument();
    });

    it('should display actor role badges', () => {
      const entries = [
        {
          id: '1',
          action: 'SUBMITTED' as const,
          description: 'Exit request submitted',
          actor: 'Jane Doe',
          actorRole: 'Student',
          timestamp: '2025-01-01T10:00:00Z',
        },
      ];

      render(<AuditTrailPanel entries={entries} />);

      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });

  describe('Student Exit Page - Full Flow', () => {
    it('should render the exit request page', async () => {
      render(<StudentExitPage />);

      await waitFor(() => {
        expect(screen.getByText(/Exit Request/i)).toBeInTheDocument();
      });
    });

    it('should show implications banner in DRAFT status', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'DRAFT',
          exitRequest: null,
          auditTrail: [],
        }),
      });

      render(<StudentExitPage />);

      await waitFor(() => {
        expect(screen.getByText(/Exit Process Implications/i)).toBeInTheDocument();
      });
    });

    it('should display status-specific banner for SUBMITTED state', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'SUBMITTED',
          exitRequest: {},
          auditTrail: [],
        }),
      });

      render(<StudentExitPage />);

      await waitFor(() => {
        expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument();
      });
    });

    it('should allow withdrawal in SUBMITTED state', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'SUBMITTED',
          exitRequest: {},
          auditTrail: [],
        }),
      });

      render(<StudentExitPage />);

      await waitFor(() => {
        const withdrawButton = screen.getByText(/Withdraw Request/i);
        expect(withdrawButton).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog before withdrawal', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'SUBMITTED',
          exitRequest: {},
          auditTrail: [],
        }),
      });

      render(<StudentExitPage />);

      await waitFor(() => {
        const withdrawButton = screen.getByText(/Withdraw Request/i);
        fireEvent.click(withdrawButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Confirm Withdrawal/i)).toBeInTheDocument();
      });
    });
  });

  describe('Irreversible State Transitions', () => {
    it('should prevent editing in UNDER_CLEARANCE status', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'UNDER_CLEARANCE',
          exitRequest: {
            desiredExitDate: '2025-02-15',
            reason: 'Test reason',
          },
          auditTrail: [],
        }),
      });

      render(<StudentExitPage />);

      await waitFor(() => {
        expect(screen.getByText(/Clearance In Progress/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        const reasonInput = screen.getByLabelText(/Reason for Exit/i);
        expect(reasonInput).toBeDisabled();
      });
    });

    it('should show form locked message for non-editable states', () => {
      const mockSubmit = vi.fn();
      render(<ExitRequestForm currentStatus="APPROVED" onSubmit={mockSubmit} />);

      expect(screen.getByText(/Form Locked/i)).toBeInTheDocument();
    });
  });
});
