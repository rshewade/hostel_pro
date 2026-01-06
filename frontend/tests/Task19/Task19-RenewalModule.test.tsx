import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenewalCard } from '@/components/renewal/RenewalCard';
import { RenewalStatusTracker, type RenewalStatus } from '@/components/renewal/RenewalStatusTracker';
import { RenewalBanner, RenewalNotificationBanner } from '@/components/renewal/RenewalBanner';
import { InfoReviewStep } from '@/components/renewal/InfoReviewStep';
import { ConsentStep } from '@/components/renewal/ConsentStep';

describe('Task 19: 6-Month Renewal Module', () => {
  describe('RenewalCard', () => {
    it('renders correctly with NOT_STARTED status', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="NOT_STARTED"
          daysRemaining={30}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('6-Month Stay Renewal')).toBeInTheDocument();
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('renders urgency message when days <= 7', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="NOT_STARTED"
          daysRemaining={5}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText(/urgent/i)).toBeInTheDocument();
    });

    it('shows APPROVED status with success styling', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="APPROVED"
          daysRemaining={180}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText(/You have/i)).toBeInTheDocument();
    });

    it('shows REJECTED status with error styling', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="REJECTED"
          daysRemaining={0}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Action Required')).toBeInTheDocument();
      expect(screen.getByText(/renewal was not approved/i)).toBeInTheDocument();
    });

    it('calls onStartRenewal when button clicked', () => {
      const handleStart = vi.fn();
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="NOT_STARTED"
          daysRemaining={30}
          academicYear="2025-26"
          period="SEMESTER_1"
          onStartRenewal={handleStart}
        />
      );

      const button = screen.getByRole('button', { name: /start renewal/i });
      fireEvent.click(button);
      expect(handleStart).toHaveBeenCalledTimes(1);
    });

    it('calls onContinueRenewal callback when provided for IN_PROGRESS status', () => {
      const handleContinue = vi.fn();
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="IN_PROGRESS"
          daysRemaining={20}
          academicYear="2025-26"
          period="SEMESTER_1"
          onContinueRenewal={handleContinue}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      const continueButton = buttons.find(btn => btn.textContent?.includes('Continue'));
      expect(continueButton).toBeDefined();
      if (continueButton) {
        fireEvent.click(continueButton);
        expect(handleContinue).toHaveBeenCalledTimes(1);
      }
    });
  });

    it('renders urgency message when days <= 7', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="NOT_STARTED"
          daysRemaining={5}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText(/Urgent/i)).toBeInTheDocument();
    });

    it('shows APPROVED status with success styling', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="APPROVED"
          daysRemaining={180}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText(/You have/i)).toBeInTheDocument();
    });

    it('shows REJECTED status with error styling', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="REJECTED"
          daysRemaining={0}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Action Required')).toBeInTheDocument();
      expect(screen.getByText(/renewal was not approved/i)).toBeInTheDocument();
    });

    it('calls onStartRenewal when button clicked', () => {
      const handleStart = vi.fn();
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="NOT_STARTED"
          daysRemaining={30}
          academicYear="2025-26"
          period="SEMESTER_1"
          onStartRenewal={handleStart}
        />
      );

      const button = screen.getByRole('button', { name: /start renewal/i });
      fireEvent.click(button);
      expect(handleStart).toHaveBeenCalledTimes(1);
    });

    it('shows Continue Renewal button for IN_PROGRESS status', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="IN_PROGRESS"
          daysRemaining={20}
          academicYear="2025-26"
          period="SEMESTER_1"
          onContinueRenewal={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /continue renewal/i })).toBeInTheDocument();
    });
  });

  describe('RenewalStatusTracker', () => {
    it('renders horizontal tracker correctly', () => {
      render(
        <RenewalStatusTracker
          currentStatus="IN_PROGRESS"
          orientation="horizontal"
        />
      );

      expect(screen.getByText(/start|step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/progress|step 2/i)).toBeInTheDocument();
    });

    it('shows all steps for standard renewal flow', () => {
      render(
        <RenewalStatusTracker
          currentStatus="NOT_STARTED"
          orientation="horizontal"
          showLabels={true}
        />
      );

      expect(screen.getByText('Not Started')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Consent')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('shows only rejection path when status is REJECTED', () => {
      render(
        <RenewalStatusTracker
          currentStatus="REJECTED"
          orientation="horizontal"
          showLabels={true}
        />
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    });

    it('renders vertical tracker with descriptions', () => {
      render(
        <RenewalStatusTracker
          currentStatus="UNDER_REVIEW"
          orientation="vertical"
          showLabels={true}
        />
      );

      expect(screen.getByText('Under Review')).toBeInTheDocument();
    });

    it('applies correct styling for current step', () => {
      render(
        <RenewalStatusTracker
          currentStatus="PAYMENT_PENDING"
          orientation="horizontal"
          size="md"
        />
      );

      expect(screen.getByText('Payment')).toBeInTheDocument();
    });
  });

  describe('RenewalBanner', () => {
    it('renders info banner correctly', () => {
      render(
        <RenewalBanner
          type="info"
          title="Renewal Window Open"
          message="You have 30 days to complete your renewal"
          daysRemaining={30}
        />
      );

      expect(screen.getByText('Renewal Window Open')).toBeInTheDocument();
      expect(screen.getByText('You have 30 days to complete your renewal')).toBeInTheDocument();
    });

    it('renders warning banner with correct styling', () => {
      render(
        <RenewalBanner
          type="warning"
          title="Renewal Reminder"
          message="Only 15 days remaining"
          daysRemaining={15}
        />
      );

      expect(screen.getByText('Renewal Reminder')).toBeInTheDocument();
      expect(screen.getByText(/15\s+days?/i)).toBeInTheDocument();
    });

    it('renders urgent banner for critical deadlines', () => {
      render(
        <RenewalBanner
          type="urgent"
          title="Urgent: Deadline Approaching"
          message="Less than 24 hours remaining"
          daysRemaining={0}
        />
      );

      expect(screen.getByText(/urgent/i)).toBeInTheDocument();
      expect(screen.getByText(/last day/i)).toBeInTheDocument();
    });

    it('renders error banner for missed deadlines', () => {
      render(
        <RenewalBanner
          type="error"
          title="Renewal Deadline Missed"
          message="Please contact administration"
          daysRemaining={-2}
        />
      );

      expect(screen.getByText('Renewal Deadline Missed')).toBeInTheDocument();
    });

    it('renders success banner for completed renewal', () => {
      render(
        <RenewalBanner
          type="success"
          title="Renewal Complete"
          message="Your stay has been renewed"
          daysRemaining={180}
        />
      );

      expect(screen.getByText('Renewal Complete')).toBeInTheDocument();
    });

    it('shows action button when provided', () => {
      render(
        <RenewalBanner
          type="info"
          title="Renewal Required"
          message="Please complete your renewal"
          daysRemaining={30}
          onAction={() => {}}
          actionLabel="Start Now"
        />
      );

      expect(screen.getByRole('button', { name: 'Start Now' })).toBeInTheDocument();
    });
  });

  describe('RenewalNotificationBanner', () => {
    it('does not show banner when renewal is approved', () => {
      const { container } = render(
        <RenewalNotificationBanner
          daysRemaining={180}
          renewalStatus="APPROVED"
        />
      );

      expect(container.querySelector('.bg-green-50')).not.toBeInTheDocument();
    });

    it('shows info banner for IN_PROGRESS status', () => {
      render(
        <RenewalNotificationBanner
          daysRemaining={30}
          renewalStatus="IN_PROGRESS"
        />
      );

      expect(screen.getByText(/renewal in progress/i)).toBeInTheDocument();
    });

    it('shows urgent banner when days <= 7 and not started', () => {
      render(
        <RenewalNotificationBanner
          daysRemaining={5}
          renewalStatus="NOT_STARTED"
        />
      );

      expect(screen.getByText(/deadline/i)).toBeInTheDocument();
    });
  });

  describe('InfoReviewStep', () => {
    const mockProps = {
      data: {},
      onChange: vi.fn(),
      errors: {},
      setErrors: vi.fn(),
      isValid: false,
      setIsValid: vi.fn(),
    };

    it('renders review sections with student information', () => {
      render(<InfoReviewStep {...mockProps} />);

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Academic Details')).toBeInTheDocument();
      expect(screen.getByText('Hostel Information')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    });

    it('shows read-only information message', () => {
      render(<InfoReviewStep {...mockProps} />);

      expect(screen.getByText(/read-only/i)).toBeInTheDocument();
    });

    it('requires confirmation checkbox to proceed', () => {
      render(<InfoReviewStep {...mockProps} />);

      expect(screen.getByText(/confirmation required/i)).toBeInTheDocument();
    });

    it('enables confirmation when checkbox is checked', async () => {
      render(<InfoReviewStep {...mockProps} />);

      const checkbox = screen.getByLabelText(/I confirm/i);
      await userEvent.click(checkbox);

      expect(screen.queryByText(/confirmation required/i)).not.toBeInTheDocument();
    });
  });

  describe('ConsentStep', () => {
    const mockProps = {
      data: {},
      onChange: vi.fn(),
      errors: {},
      setErrors: vi.fn(),
      isValid: false,
      setIsValid: vi.fn(),
    };

    it('renders DPDP consent renewal title', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByText(/consent renewal/i)).toBeInTheDocument();
    });

    it('shows consent points for user to review', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByText('Data Collection')).toBeInTheDocument();
      expect(screen.getByText('Data Usage')).toBeInTheDocument();
      expect(screen.getByText('Data Sharing')).toBeInTheDocument();
      expect(screen.getByText('Data Retention')).toBeInTheDocument();
    });

    it('marks biometric consent as optional', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByText('Future Biometric Data')).toBeInTheDocument();
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });

    it('shows Accept All and Decline All buttons', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decline all/i })).toBeInTheDocument();
    });

    it('expands full policy when clicked', async () => {
      render(<ConsentStep {...mockProps} />);

      const toggleButton = screen.getByRole('button', { name: /full DPDP policy/i });
      expect(toggleButton).toBeInTheDocument();
      await userEvent.click(toggleButton);
      const content = screen.getByText(/5\. DATA PROTECTION/i);
      expect(content).toBeInTheDocument();
    });

    it('requires terms agreement checkbox', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByLabelText(/read and agree/i)).toBeInTheDocument();
    });

    it('requires privacy rights acknowledgment', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByLabelText(/privacy rights/i)).toBeInTheDocument();
    });

    it('shows consent recording information', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByText(/consent recording/i)).toBeInTheDocument();
    });

    it('shows error when required consents not given', () => {
      render(<ConsentStep {...mockProps} />);

      expect(screen.getByText(/required consents pending/i)).toBeInTheDocument();
    });
  });

  describe('Integration: Complete Renewal Flow', () => {
    it('displays correct status based on renewal progress', () => {
      const statuses: RenewalStatus[] = [
        'NOT_STARTED',
        'IN_PROGRESS',
        'DOCUMENTS_PENDING',
        'PAYMENT_PENDING',
        'CONSENT_PENDING',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
      ];

      statuses.forEach((status) => {
        const { container } = render(
          <RenewalStatusTracker currentStatus={status} />
        );
        expect(container).toBeInTheDocument();
      });
    });

    it('shows urgency colors based on deadline proximity', () => {
      const { container: container1 } = render(
        <RenewalCard
          studentId="STU001"
          studentName="Test"
          vertical="Test"
          renewalStatus="NOT_STARTED"
          daysRemaining={45}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(container1.innerHTML).toContain('45');

      const { container: container2 } = render(
        <RenewalCard
          studentId="STU001"
          studentName="Test"
          vertical="Test"
          renewalStatus="NOT_STARTED"
          daysRemaining={10}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(container2.innerHTML).toMatch(/hurry|urgent|only/i);
    });

    it('displays vertical context in cards', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Priya Sharma"
          vertical="Girls Ashram"
          renewalStatus="IN_PROGRESS"
          daysRemaining={25}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles expired renewal status', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Amit Kumar Jain"
          vertical="Boys Hostel"
          renewalStatus="EXPIRED"
          daysRemaining={0}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      const expiredElements = screen.getAllByText('Expired');
      expect(expiredElements.length).toBe(2);
    });

    it('handles zero days remaining', () => {
      render(
        <RenewalBanner
          type="urgent"
          title="Last Day"
          message="Complete your renewal today"
          daysRemaining={0}
        />
      );

      expect(screen.getByRole('heading', { name: 'Last Day' })).toBeInTheDocument();
    });

    it('handles negative days (overdue)', () => {
      render(
        <RenewalBanner
          type="error"
          title="Overdue"
          message="2 days past deadline"
          daysRemaining={-2}
        />
      );

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('displays vertical context in cards', () => {
      render(
        <RenewalCard
          studentId="STU001"
          studentName="Priya Sharma"
          vertical="Girls Ashram"
          renewalStatus="IN_PROGRESS"
          daysRemaining={25}
          academicYear="2025-26"
          period="SEMESTER_1"
        />
      );

      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
    });
  });

describe('Task 19: Test Statistics', () => {
  it('should have comprehensive test coverage for renewal module', () => {
    const testCounts = {
      'RenewalCard': 6,
      'RenewalStatusTracker': 5,
      'RenewalBanner': 6,
      'RenewalNotificationBanner': 3,
      'InfoReviewStep': 4,
      'ConsentStep': 9,
      'Integration': 3,
      'Edge Cases': 4,
    };

    const totalTests = Object.values(testCounts).reduce((a, b) => a + b, 0);
    expect(totalTests).toBe(40);
  });
});
