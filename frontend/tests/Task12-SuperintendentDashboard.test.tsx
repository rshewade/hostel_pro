import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SuperintendentDashboard from '../src/app/dashboard/superintendent/page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'test-id' }),
}));

describe('Task 12.1 - Superintendent Dashboard: Application List and Detail Views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Dashboard Layout', () => {
    it('renders superintendent dashboard', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getByText('Superintendent Dashboard')).toBeInTheDocument();
    });

    it('shows vertical context badge', () => {
      render(<SuperintendentDashboard />);

      // "All Verticals" appears twice (header badge + filter chip)
      // We're checking that it exists, not which one
      const verticalTexts = screen.getAllByText('All Verticals');
      expect(verticalTexts.length).toBeGreaterThan(0);
    });

    it('has logout button', () => {
      render(<SuperintendentDashboard />);

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('has 4 tabs', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Leaves')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('Applications tab is active by default', () => {
      render(<SuperintendentDashboard />);

      const applicationsTab = screen.getByText('Applications');
      expect(applicationsTab.closest('button')).toHaveClass('border-navy-900');
    });

    it('switches to Leaves tab', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);

      // Leaves tab content should appear (use findBy to wait for render)
      expect(await screen.findByText('Leave Types')).toBeInTheDocument();
    });

    it('switches to Communication tab', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);

      // Communication tab content should appear (use findBy to wait for render)
      expect(await screen.findByText('Parent Notification Rules')).toBeInTheDocument();
    });
  });

  describe('Application Filters', () => {
    it('has vertical filter chips', () => {
      render(<SuperintendentDashboard />);

      // "All Verticals" appears twice (header + filter), use getAllByText
      const allVerticalsElements = screen.getAllByText('All Verticals');
      expect(allVerticalsElements.length).toBeGreaterThan(0);

      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
      expect(screen.getByText('Dharamshala')).toBeInTheDocument();
    });

    it('has status filter chips', () => {
      render(<SuperintendentDashboard />);

      // "All Statuses" appears twice (header + filter), use getAllByText
      const allStatusesElements = screen.getAllByText('All Statuses');
      expect(allStatusesElements.length).toBeGreaterThan(0);

      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('has search input', () => {
      render(<SuperintendentDashboard />);

      const searchInput = screen.getByPlaceholderText('Search by name or tracking #');
      expect(searchInput).toBeInTheDocument();
    });

    it('has clear filters button', () => {
      render(<SuperintendentDashboard />);

      const clearButton = screen.getByText('Clear Filters');
      expect(clearButton).toBeInTheDocument();
    });

    it('filters by vertical when clicking Boys Hostel chip', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const boysChip = screen.getByText('Boys Hostel');
      await user.click(boysChip);

      // Chip should be selected (blue background)
      expect(boysChip.closest('button')).toHaveClass('border-blue-600');
    });

    it('filters by status when clicking New chip', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const newChip = screen.getByText('New');
      await user.click(newChip);

      // Chip should be selected (blue background)
      expect(newChip.closest('button')).toHaveClass('border-blue-500');
    });
  });

  describe('Applications Table', () => {
    it('renders applications table', () => {
      render(<SuperintendentDashboard />);

      // Table should be visible with mock data
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      expect(screen.getByText('APP-2024-001')).toBeInTheDocument();
    });

    it('has correct table columns', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getByText('Applicant Name')).toBeInTheDocument();
      expect(screen.getByText('Tracking #')).toBeInTheDocument();
      expect(screen.getByText('Vertical')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Interview')).toBeInTheDocument();
      expect(screen.getByText('Flags')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('shows vertical badges', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('BOYS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GIRLS').length).toBeGreaterThan(0);
    });

    it('shows status badges', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('UNDER REVIEW').length).toBeGreaterThan(0);
      expect(screen.getAllByText('NEW').length).toBeGreaterThan(0);
    });

    it('shows payment status', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('PAID').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });

    it('shows interview status', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Not Scheduled').length).toBeGreaterThan(0);
    });

    it('shows flags as chips', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getByText('Documents Pending')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('has Review and View Details buttons', () => {
      render(<SuperintendentDashboard />);

      const reviewButtons = screen.getAllByText('Review');
      expect(reviewButtons.length).toBeGreaterThan(0);

      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
    });

    it('opens detail modal when clicking Review button', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Modal should open
      expect(screen.getByText('Application Details')).toBeInTheDocument();
    });
  });

  describe('Application Detail Modal', () => {
    it('opens and shows applicant information', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      expect(screen.getByText('Applicant Information')).toBeInTheDocument();
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('APP-2024-001').length).toBeGreaterThan(0);
    });

    it('shows status and payment badges', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      expect(screen.getByText('Application Status')).toBeInTheDocument();
      expect(screen.getByText('Payment Status')).toBeInTheDocument();
    });

    it('shows interview details when scheduled', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
    });

    it('shows uploaded documents section', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
      expect(screen.getByText('Student Declaration')).toBeInTheDocument();
      expect(screen.getByText('Parent Consent')).toBeInTheDocument();
    });

    it('has internal notes textarea', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      const notesTextarea = screen.getByPlaceholderText('Add internal remarks...');
      expect(notesTextarea).toBeInTheDocument();
    });

    it('has action buttons: Approve, Reject, Forward, Send Message', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
      expect(screen.getByText('Forward to Trustees')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });
  });

  describe('Action Confirmation Modal', () => {
    it('opens approve confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Approve" appears multiple times, use getAllByText
      const approveButtons = screen.getAllByText('Approve');
      // Click the one in detail modal (first one)
      const approveButton = approveButtons[0];
      await user.click(approveButton);

      expect(screen.getByText('Approve Application')).toBeInTheDocument();
    });

    it('opens reject confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Reject" appears in table, use getAllByText
      const rejectButtons = screen.getAllByText('Reject');
      // Click the one in detail modal (first one)
      const rejectButton = rejectButtons[0];
      await user.click(rejectButton);

      expect(screen.getByText('Reject Application')).toBeInTheDocument();
    });

    it('opens forward confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Forward to Trustees" appears twice (button + modal title)
      // Click the first one (the button)
      const forwardButtons = screen.getAllByText('Forward to Trustees');
      const forwardButton = forwardButtons[0];
      await user.click(forwardButton);

      // Wait for modal title to appear
      await waitFor(() => {
        expect(screen.getAllByText('Forward to Trustees').length).toBeGreaterThan(1);
      });
    });

    it('has remarks textarea with required validation', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Open confirmation modal
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Approve" appears multiple times, use getAllByText
      const approveButtons = screen.getAllByText('Approve');
      // Find and click the Approve button in detail modal (first one)
      const approveButton = approveButtons.find(btn => {
        const parent = btn.closest('div');
        return parent && !parent.querySelector('.modal-backdrop');
      });
      if (approveButton) {
        await user.click(approveButton);
      }

      const remarksTextarea = screen.getByPlaceholderText(/Enter approval remarks/i);
      expect(remarksTextarea).toBeInTheDocument();
      expect(remarksTextarea).toBeRequired();
    });

    it('shows application summary in confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);
      const approveButton = screen.getByText('Approve');
      await user.click(approveButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText('Approve Application')).toBeInTheDocument();
      });

      // Modal title should be visible
      expect(screen.getByText('Approve Application')).toBeInTheDocument();

      // Use getAllByText as these labels appear in both table and modal
      const applicantLabels = screen.getAllByText('Applicant Name');
      expect(applicantLabels.length).toBeGreaterThan(0);

      const trackingLabels = screen.getAllByText('Tracking Number');
      expect(trackingLabels.length).toBeGreaterThan(0);
    });

    it('has audit trail helper text', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);
      const approveButton = screen.getByText('Approve');
      await user.click(approveButton);

      expect(screen.getByText(/Remarks will be recorded/i)).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('shows pagination controls', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('shows page info', () => {
      render(<SuperintendentDashboard />);

      const pageInfo = screen.getByText(/Showing/);
      expect(pageInfo).toBeInTheDocument();
    });
  });
});
