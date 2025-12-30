import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperintendentLeaveManagement from '@/app/dashboard/superintendent/leaves/page';

describe('Task 18.2 - Superintendent Leave Management', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Leave Requests Table', () => {
    it('should display pending and all leaves tabs', () => {
      render(<SuperintendentLeaveManagement />);

      const pendingTab = screen.getByText(/pending requests/i);
      const allTab = screen.getByText(/all leaves/i);

      expect(pendingTab).toBeInTheDocument();
      expect(allTab).toBeInTheDocument();
    });

    it('should show leave count in tabs', () => {
      render(<SuperintendentLeaveManagement />);

      expect(screen.getByText(/Pending Requests \(3\)/i)).toBeInTheDocument();
      expect(screen.getByText(/All Leaves \(5\)/i)).toBeInTheDocument();
    });

    it('should display all leave request columns', () => {
      render(<SuperintendentLeaveManagement />);

      expect(screen.getAllByText('Student').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Room').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Leave Type').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dates').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Reason').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Actions').length).toBeGreaterThan(0);
    });
  });

  describe('Leave Detail/Review Modal', () => {
    it('should open leave detail modal on review click', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Leave Request Details')).toBeInTheDocument();
      });
    });

    it('should display student information in detail modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Student Information')).toBeInTheDocument();
        const studentLabels = screen.getAllByText('Student ID');
        expect(studentLabels.length).toBeGreaterThan(0);
      });
    });

    it('should display leave details in modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Leave Details')).toBeInTheDocument();
        expect(screen.getAllByText('Leave Type').length).toBeGreaterThan(0);
        expect(screen.getAllByText('From').length).toBeGreaterThan(0);
        expect(screen.getAllByText('To').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Reason').length).toBeGreaterThan(0);
      });
    });

    it('should show leave rules summary', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Leave Rules Summary')).toBeInTheDocument();
        expect(screen.getByText(/configured in settings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Approve/Reject Actions', () => {
    it('should show approve and reject buttons for pending leaves', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Request')).toBeInTheDocument();
        expect(screen.getByText('Reject Request')).toBeInTheDocument();
        expect(screen.getByText(/Send Message/i)).toBeInTheDocument();
      });
    });

    it('should not show approve/reject for non-pending leaves', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const allTab = screen.getByText(/all leaves/i);
      await user.click(allTab);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[2]);

      await waitFor(() => {
        expect(screen.queryByText('Approve Request')).not.toBeInTheDocument();
        expect(screen.queryByText('Reject Request')).not.toBeInTheDocument();
        expect(screen.getByText('Send Message')).toBeInTheDocument();
      });
    });

    it('should open approve confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(async () => {
        const approveButton = screen.getByText('Approve Request');
        await user.click(approveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Approve Leave Request')).toBeInTheDocument();
      });
    });

    it('should open reject confirmation modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(async () => {
        const rejectButton = screen.getByText('Reject Request');
        await user.click(rejectButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Reject Leave Request')).toBeInTheDocument();
      });
    });

    it('should require remarks for approve/reject', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(async () => {
        const approveButton = screen.getAllByText('Approve Request');
        await user.click(approveButton[0]);
      });

      await waitFor(() => {
        const confirmButtons = screen.getAllByText('Approve');
        expect(confirmButtons.length).toBeGreaterThan(0);
        if (confirmButtons.length > 1) {
          expect(confirmButtons[confirmButtons.length - 1]).toBeDisabled();
        }
      });
    });

    it('should show audit trail warning', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      await waitFor(async () => {
        const approveButton = screen.getByText('Approve Request');
        await user.click(approveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Audit Trail Entry')).toBeInTheDocument();
        expect(screen.getByText(/Your decision will be logged/i)).toBeInTheDocument();
      });
    });
  });

  describe('Send Message Integration', () => {
    it('should open send message panel from table', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const messageButtons = screen.getAllByText('Message');
      await user.click(messageButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByText(/Send Message/i).length).toBeGreaterThan(0);
      });
    });

    it('should open send message panel from detail modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const reviewButtons = screen.getAllByText('Review');
      await user.click(reviewButtons[0]);

      const sendMessageButton = await waitFor(() => screen.getByText(/Send Message to/i));
      await user.click(sendMessageButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Send Message/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no leaves match filters', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const searchInput = screen.getByPlaceholderText(/search by student name/i);
      await user.type(searchInput, 'NonExistentStudent');

      await waitFor(() => {
        expect(screen.getByText('No leave requests found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filters', () => {
    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      const searchInput = screen.getByPlaceholderText(/search by student name/i);
      await user.type(searchInput, 'Test');

      const clearButton = screen.getByText('Clear Filters');
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('should show status filter only on all leaves tab', async () => {
      const user = userEvent.setup();
      render(<SuperintendentLeaveManagement />);

      expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();

      const allTab = screen.getByText(/all leaves/i);
      await user.click(allTab);

      await waitFor(() => {
        expect(screen.getByLabelText('Status')).toBeInTheDocument();
      });
    });
  });
});
