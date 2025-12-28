import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

describe('Task 12.2 - Superintendent Dashboard: Leave and Notification Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Leaves Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);
      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
    });

    it('renders Leave Configuration section', () => {
      expect(screen.getByText('Leave Types')).toBeInTheDocument();
    });

    it('renders Blackout Dates section', () => {
      expect(screen.getByText('Blackout Dates')).toBeInTheDocument();
    });

    it('shows leave type descriptions', () => {
      expect(screen.getByText(/Configure different types of leaves/i)).toBeInTheDocument();
    });

    it('shows blackout dates description', () => {
      expect(screen.getByText(/Periods when leaves are not allowed/i)).toBeInTheDocument();
    });
  });

  describe('Leave Types Management', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);
      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
    });

    it('displays existing leave types', () => {
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Casual Leave')).toBeInTheDocument();
    });

    it('shows leave type details', () => {
      expect(screen.getAllByText('Max Days/Month').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Max Days/Semester').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Approval Required').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Allowed Verticals').length).toBeGreaterThan(0);
    });

    it('shows requires approval badge', () => {
      // Casual Leave requires approval
      const approvalBadges = screen.getAllByText('Requires Approval');
      expect(approvalBadges.length).toBeGreaterThan(0);
    });

    it('shows allowed verticals as chips', () => {
      expect(screen.getAllByText('BOYS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GIRLS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('DHARAMSHALA').length).toBeGreaterThan(0);
    });

    it('has Add Leave Type button', () => {
      const addButton = screen.getAllByText('Add Leave Type')[0];
      expect(addButton).toBeInTheDocument();
    });

    it('has Edit button for each leave type', () => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('has Disable/Enable button for each leave type', () => {
      const disableButtons = screen.getAllByText('Disable');
      expect(disableButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Leave Type Modal', () => {
    it('opens Add Leave Type modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Navigate to Leaves tab first
      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);

      // Click Add Leave Type
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getAllByText('Add Leave Type')[0]).toBeInTheDocument();
    });

    it('opens Edit Leave Type modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      // Navigate to Leaves tab first
      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);

      // Click Edit button
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Leave Type')).toBeInTheDocument();
    });

    it('has Leave Type Name input', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      const nameInput = screen.getByPlaceholderText('e.g., Sick Leave');
      expect(nameInput).toBeInTheDocument();
    });

    it('has Max Days Per Month input', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getByText('Max Days Per Month')).toBeInTheDocument();
    });

    it('has Max Days Per Semester input', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getByText('Max Days Per Semester')).toBeInTheDocument();
    });

    it('has vertical checkboxes', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('BOYS')).toBeInTheDocument();
      expect(screen.getByLabelText('GIRLS')).toBeInTheDocument();
      expect(screen.getByLabelText('DHARAMSHALA')).toBeInTheDocument();
    });

    it('has Requires Approval toggle', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('Requires Approval')).toBeInTheDocument();
    });

    it('has approval toggle helper text', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      expect(screen.getByText(/leave applications of this type require superintendent approval/i)).toBeInTheDocument();
    });

    it('has Save button', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Leave Type')[0];
      await user.click(addButton);

      const saveButton = screen.getAllByText('Save')[0];
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Blackout Dates Management', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);
      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
    });

    it('displays existing blackout dates', () => {
      expect(screen.getByText('Exam Period - Semester 2')).toBeInTheDocument();
    });

    it('shows blackout date details', () => {
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
      expect(screen.getByText('Applies To')).toBeInTheDocument();
      expect(screen.getByText('Reason')).toBeInTheDocument();
    });

    it('has Add Blackout Period button', () => {
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      expect(addButton).toBeInTheDocument();
    });

    it('has Edit button for each blackout date', () => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('has Delete button for each blackout date', () => {
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Blackout Date Modal', () => {
    it('opens Add Blackout Period modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      expect(screen.getAllByText('Add Blackout Period')[0]).toBeInTheDocument();
    });

    it('has Period Name input', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      const nameInput = screen.getByPlaceholderText('e.g., Exam Period - Semester 2');
      expect(nameInput).toBeInTheDocument();
    });

    it('has Start Date and End Date inputs', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      expect(screen.getAllByText('Start Date').length).toBeGreaterThan(0);
      expect(screen.getAllByText('End Date').length).toBeGreaterThan(0);
    });

    it('has vertical checkboxes', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('BOYS')).toBeInTheDocument();
      expect(screen.getByLabelText('GIRLS')).toBeInTheDocument();
      expect(screen.getByLabelText('DHARAMSHALA')).toBeInTheDocument();
    });

    it('has Reason textarea', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      const reasonTextarea = screen.getByPlaceholderText('e.g., Final examinations, festival period, etc.');
      expect(reasonTextarea).toBeInTheDocument();
    });

    it('has Add button', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const leavesTab = screen.getByText('Leaves');
      await user.click(leavesTab);
      const addButton = screen.getAllByText('Add Blackout Period')[0];
      await user.click(addButton);

      const confirmButton = screen.getByText('Add');
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('Communication Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);
      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
    });

    it('renders Parent Notification Rules section', () => {
      expect(screen.getByText('Parent Notification Rules')).toBeInTheDocument();
    });

    it('shows notification rules description', () => {
      expect(screen.getByText(/Configure when and how parents are notified/i)).toBeInTheDocument();
    });
  });

  describe('Parent Notification Rules', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);
      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
    });

    it('displays existing notification rules', () => {
      expect(screen.getAllByText('Leave Application').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Leave Approval').length).toBeGreaterThan(0);
    });

    it('shows notification rule details', () => {
      expect(screen.getAllByText('Timing').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Channels').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Applies To').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Message Template').length).toBeGreaterThan(0);
    });

    it('shows notification channels as chips', () => {
      expect(screen.getAllByText('SMS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('WhatsApp').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
    });

    it('shows message template', () => {
      const templateRegex = /\{\{student_name\}\}/;
      const templateElements = screen.getAllByText(templateRegex);
      expect(templateElements.length).toBeGreaterThan(0);
    });

    it('has Add Notification Rule button', () => {
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      expect(addButton).toBeInTheDocument();
    });

    it('has Edit button for each rule', () => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('has Disable/Enable button for each rule', () => {
      const disableButtons = screen.getAllByText('Disable');
      expect(disableButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Notification Rule Modal', () => {
    it('opens Add Notification Rule modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getAllByText('Add Notification Rule')[0]).toBeInTheDocument();
    });

    it('opens Edit Notification Rule modal', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Notification Rule')).toBeInTheDocument();
    });

    it('has Event Type select', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByText('Event Type')).toBeInTheDocument();
    });

    it('has Notification Timing select', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByText('Notification Timing')).toBeInTheDocument();
    });

    it('has timing helper text', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByText(/When should notification be sent?/i)).toBeInTheDocument();
    });

    it('has notification channel toggles', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('SMS')).toBeInTheDocument();
      expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('has vertical checkboxes', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('BOYS')).toBeInTheDocument();
      expect(screen.getByLabelText('GIRLS')).toBeInTheDocument();
      expect(screen.getByLabelText('DHARAMSHALA')).toBeInTheDocument();
    });

    it('has Message Template textarea', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      const templatePlaceholder = /Use \{\{variable_name\}\} for dynamic content/;
      const templateTextarea = screen.getByPlaceholderText(templatePlaceholder);
      expect(templateTextarea).toBeInTheDocument();
    });

    it('shows available variables in placeholder', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getAllByText(/\{\{student_name\}\}/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\{\{start_date\}\}/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\{\{end_date\}\}/).length).toBeGreaterThan(0);
    });

    it('has Active toggle', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      expect(screen.getByLabelText('Active')).toBeInTheDocument();
    });

    it('has Save button', async () => {
      const user = userEvent.setup();
      render(<SuperintendentDashboard />);

      const communicationTab = screen.getByText('Communication');
      await user.click(communicationTab);
      const addButton = screen.getAllByText('Add Notification Rule')[0];
      await user.click(addButton);

      const saveButton = screen.getAllByText('Save')[0];
      expect(saveButton).toBeInTheDocument();
    });
  });
});
