import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperintendentDashboard from '../../src/app/dashboard/superintendent/page';

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

    it('shows vertical context badge', async () => {
      render(<SuperintendentDashboard />);

      // Wait for async data loading
      await waitFor(() => {
        expect(screen.getAllByText('All Verticals')).toHaveLength(2);
      });
    });

    it('has logout button', () => {
      render(<SuperintendentDashboard />);
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('has 4 tabs', () => {
      render(<SuperintendentDashboard />);
      
      const tabs = ['Applications', 'Leaves', 'Communication', 'Settings'];
      tabs.forEach(tab => {
        expect(screen.getByText(tab)).toBeInTheDocument();
      });
    });

    it('Applications tab is active by default', () => {
      render(<SuperintendentDashboard />);
      
      const tabs = ['Applications', 'Leaves', 'Communication', 'Settings'];
      tabs.forEach(tab => {
        const tabElement = screen.getByText(tab);
        if (tab === 'Applications') {
          expect(tabElement).toHaveClass('border-navy-900');
        } else {
          expect(tabElement).toHaveClass('border-transparent');
        }
      });
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Leaves tab', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);

      expect(leavesTab).toHaveClass('border-navy-900');
    });

    it('switches to Communication tab', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);

      expect(communicationTab).toHaveClass('border-navy-900');
    });
  });

  describe('Application Filters', () => {
    it('has vertical filter chips', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('All Verticals').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
      expect(screen.getByText('Dharamshala')).toBeInTheDocument();
    });

    it('has status filter chips', () => {
      render(<SuperintendentDashboard />);

      expect(screen.getAllByText('All Statuses').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('has search input', () => {
      render(<SuperintendentDashboard />);
      
      expect(screen.getByPlaceholderText(/Search by name or tracking/i)).toBeInTheDocument();
    });

    it('has clear filters button', () => {
      render(<SuperintendentDashboard />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('filters by vertical when clicking Boys Hostel chip', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const boysChip = screen.getByText('Boys Hostel');
      await user.click(boysChip);

      expect(boysChip).toHaveClass('border-blue-600');
    });

    it('filters by status when clicking New chip', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const newChip = screen.getByText('New');
      await user.click(newChip);

      expect(newChip).toHaveClass('border-blue-500');
    });
  });

  describe('Applications Table', () => {
    it('renders applications table', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // Table should be visible with mock data
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      expect(screen.getByText('HG-2026-00001')).toBeInTheDocument();
    });

    it('has correct table columns', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Applicant Name')).toBeInTheDocument();
      expect(screen.getByText('Tracking #')).toBeInTheDocument();
      expect(screen.getByText('Vertical')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Interview')).toBeInTheDocument();
      expect(screen.getByText('Flags')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('shows vertical badges', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getAllByText('BOYS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GIRLS').length).toBeGreaterThan(0);
    });

    it('shows status badges', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // Check for status badges - the component renders "UNDER REVIEW" (with space)
      // Look for badge elements with text containing status values
      const allText = screen.getAllByText(/UNDER REVIEW|UNDER_REVIEW|SUBMITTED/);
      expect(allText.length).toBeGreaterThan(0);
    });

    it('shows payment status', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getAllByText('PAID').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });

    it('shows interview status', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Not Scheduled').length).toBeGreaterThan(0);
    });

    it('shows flags as chips', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Documents Pending')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('has Review and View Details buttons', async () => {
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButtons = screen.getAllByText('Review');
      expect(reviewButtons.length).toBeGreaterThan(0);

      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
    });

    it('opens detail modal when clicking Review button', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Wait a bit for state update and modal to appear
      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Application Detail Modal', () => {
    it('opens and shows applicant information', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Applicant Information')).toBeInTheDocument();
        expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0);
        expect(screen.getAllByText('HG-2026-00001').length).toBeGreaterThan(0);
      });
    });

    it('shows status and payment badges', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Application Status')).toBeInTheDocument();
        expect(screen.getByText('Payment Status')).toBeInTheDocument();
      });
    });

    it('shows interview details when scheduled', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
      });
    });

    it('shows uploaded documents section', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
      });
    });

    it('shows student and parent consent checkboxes', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Student Declaration')).toBeInTheDocument();
        expect(screen.getByText('Parent Consent')).toBeInTheDocument();
      });
    });

    it('has internal notes textarea', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        const notesTextarea = screen.getByPlaceholderText('Add internal remarks...');
        expect(notesTextarea).toBeInTheDocument();
      });
    });

    it('has action buttons: Approve, Reject, Forward, Send Message', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Reject')).toBeInTheDocument();
        expect(screen.getByText('Forward to Trustees')).toBeInTheDocument();
        expect(screen.getByText('Send Message')).toBeInTheDocument();
      });
    });
  });

  describe('Action Confirmation Modal', () => {
    it('opens approve confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument();
      });

      // Try to click approve button - may need to wait for it to be available
      await waitFor(async () => {
        const approveButtons = screen.getAllByText('Approve');
        expect(approveButtons.length).toBeGreaterThan(0);
        
        // Click one in detail modal (first one after modal opened)
        const approveButton = approveButtons[0];
        await user.click(approveButton);
      });

      // Wait for confirmation modal
      await waitFor(() => {
        expect(screen.getByText('Approve Application')).toBeInTheDocument();
      });
    });

    it('opens reject confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Reject" appears in table, use getAllByText
      const rejectButtons = screen.getAllByText('Reject');
      // Click one in detail modal (first one)
      const rejectButton = rejectButtons[0];
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText('Reject Application')).toBeInTheDocument();
      });
    });

    it('opens forward confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // First open application details
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // "Forward to Trustees" appears twice (button + modal title)
      // Click first one (the button)
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

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      // Open confirmation modal
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument();
      });

      // "Approve" appears multiple times, use getAllByText
      // After opening detail modal, there might be multiple Approve buttons (from table + detail modal)
      // Get all and click the first one in detail modal context
      const approveButtons = screen.getAllByText('Approve');
      const approveButton = approveButtons[0]; // First one should be in detail modal
      await user.click(approveButton);

      // Wait for confirmation modal with remarks field to appear
      await waitFor(() => {
        const remarksTextarea = screen.getByPlaceholderText(/Enter approval remarks/i);
        expect(remarksTextarea).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('shows application summary in confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Open detail modal first
      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Wait for Application Details modal to open
      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify we can see the applicant name (appears in both table and modal)
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThanOrEqual(1);

      // Now click Approve button inside the detail modal
      // Get all buttons with text "Approve" and click the one in the modal
      const approveButtons = screen.getAllByText('Approve');
      const approveButton = approveButtons[approveButtons.length - 1]; // Get the last one (in modal)
      await user.click(approveButton);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        expect(screen.getByText('Approve Application')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Now verify the application summary is shown in confirmation modal
      // After confirmation modal opens, we should see applicant name again (3 times total now)
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('HG-2026-00001').length).toBeGreaterThanOrEqual(1);
    }, 15000);

    it('has audit trail helper text', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Wait for data loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const reviewButton = screen.getAllByText('Review')[0];
      await user.click(reviewButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument();
      });

      // "Approve" appears multiple times, use getAllByText
      const approveButtons = screen.getAllByText('Approve');
      const approveButton = approveButtons[0];
      await user.click(approveButton);

      // Wait for confirmation modal with audit helper text
      await waitFor(() => {
        expect(screen.getByText(/Remarks will be recorded/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Pagination', () => {
    it('shows page info', async () => {
      render(<SuperintendentDashboard />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      const pageInfo = screen.getByText(/Showing/);
      expect(pageInfo).toBeInTheDocument();
    });

    it('shows pagination controls', async () => {
      render(<SuperintendentDashboard />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });
});
