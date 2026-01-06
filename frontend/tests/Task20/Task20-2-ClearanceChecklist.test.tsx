import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ClearanceChecklist,
  ClearanceChecklistItem,
  ClearanceItemHistory,
} from '../../src/components/exit';
import type {
  ExitClearanceChecklist,
  ClearanceItem,
  ClearanceItemHistoryEntry,
} from '../../src/components/exit';

const mockClearanceItem: ClearanceItem = {
  id: '1',
  type: 'ROOM_INVENTORY',
  title: 'Room Inventory Check',
  description: 'Verify all room items are intact and in good condition',
  ownerRole: 'SUPERINTENDENT',
  status: 'PENDING',
  isMandatory: true,
  lastUpdatedAt: '2025-01-01T10:00:00Z',
  lastUpdatedBy: 'System',
  remarks: '',
  studentInstructions: 'Please ensure your room is clean and all items are returned',
  history: [],
};

const mockHistoryEntry: ClearanceItemHistoryEntry = {
  id: '1',
  previousStatus: null,
  newStatus: 'PENDING',
  remarks: 'Initial status',
  actor: 'System',
  actorRole: 'Admin',
  timestamp: '2025-01-01T10:00:00Z',
};

const mockChecklist: ExitClearanceChecklist = {
  exitRequestId: 'exit-1',
  items: [
    mockClearanceItem,
    {
      ...mockClearanceItem,
      id: '2',
      type: 'KEY_RETURN',
      title: 'Key Return',
      description: 'Return all hostel keys',
      status: 'COMPLETED',
      lastUpdatedBy: 'John Doe',
    },
    {
      ...mockClearanceItem,
      id: '3',
      type: 'ACCOUNTS_CLEARANCE',
      title: 'Accounts Clearance',
      description: 'Clear all pending dues',
      ownerRole: 'ACCOUNTS',
      status: 'IN_PROGRESS',
      isMandatory: true,
    },
  ],
  allMandatoryCompleted: false,
  blockingItems: ['1', '3'],
};

describe('Task 20.2 - Clearance Checklist UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('ClearanceItemHistory Component', () => {
    it('should render nothing when history is empty', () => {
      const { container } = render(<ClearanceItemHistory history={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render history toggle button', () => {
      render(<ClearanceItemHistory history={[mockHistoryEntry]} />);
      expect(screen.getByText(/View History \(1 entry\)/i)).toBeInTheDocument();
    });

    it('should expand history when toggle is clicked', async () => {
      render(<ClearanceItemHistory history={[mockHistoryEntry]} />);

      const toggleButton = screen.getByText(/View History/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('System')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
    });

    it('should display status transitions', async () => {
      const historyWithTransition: ClearanceItemHistoryEntry = {
        ...mockHistoryEntry,
        previousStatus: 'PENDING',
        newStatus: 'COMPLETED',
      };

      render(<ClearanceItemHistory history={[historyWithTransition]} />);

      fireEvent.click(screen.getByText(/View History/i));

      await waitFor(() => {
        expect(screen.getByText(/PENDING → COMPLETED/i)).toBeInTheDocument();
      });
    });

    it('should display justification for overrides', async () => {
      const historyWithJustification: ClearanceItemHistoryEntry = {
        ...mockHistoryEntry,
        justification: 'Emergency override by admin',
      };

      render(<ClearanceItemHistory history={[historyWithJustification]} />);

      fireEvent.click(screen.getByText(/View History/i));

      await waitFor(() => {
        const overrideElements = screen.getAllByText(/Override/i);
        expect(overrideElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/Emergency override by admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('ClearanceChecklistItem Component', () => {
    it('should render item title and description', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} />);

      expect(screen.getByText('Room Inventory Check')).toBeInTheDocument();
      expect(screen.getByText(/Verify all room items/i)).toBeInTheDocument();
    });

    it('should display mandatory indicator', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} />);

      const title = screen.getByText('Room Inventory Check').parentElement;
      expect(title?.textContent).toContain('*');
    });

    it('should display current status badge', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display owner role', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} />);

      expect(screen.getByText(/Owner:/i)).toBeInTheDocument();
      expect(screen.getByText('SUPERINTENDENT')).toBeInTheDocument();
    });

    it('should show student instructions for student role', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} userRole="STUDENT" />);

      expect(screen.getByText(/Instructions:/i)).toBeInTheDocument();
      expect(screen.getByText(/Please ensure your room is clean/i)).toBeInTheDocument();
    });

    it('should not show update button for students', () => {
      render(<ClearanceChecklistItem item={mockClearanceItem} userRole="STUDENT" />);

      expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    });

    it('should show update button for owner role', () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    it('should not show update button for non-owner admin', () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="ACCOUNTS"
          onUpdateStatus={vi.fn()}
        />
      );

      expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    });

    it('should open update modal when Update Status is clicked', async () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      const updateButton = screen.getByText('Update Status');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Update Clearance Status')).toBeInTheDocument();
      });
    });

    it.skip('should require remarks for WAIVED status', async () => {
      const mockUpdate = vi.fn();
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={mockUpdate}
        />
      );

      fireEvent.click(screen.getByText('Update Status'));

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'WAIVED' } });
      });

      const updateButton = screen.getAllByText('Update Status')[1];
      expect(updateButton).toBeDisabled();
    });

    it('should call onUpdateStatus with correct params', async () => {
      const mockUpdate = vi.fn();
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={mockUpdate}
        />
      );

      fireEvent.click(screen.getByText('Update Status'));

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'COMPLETED' } });
      });

      const remarksInput = screen.getByPlaceholderText(/Add remarks/i);
      fireEvent.change(remarksInput, { target: { value: 'All items verified' } });

      const updateButton = screen.getAllByText('Update Status')[1];
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('1', 'COMPLETED', 'All items verified');
      });
    });

    it.skip('should disable Update Status button for completed items', () => {
      const completedItem = { ...mockClearanceItem, status: 'COMPLETED' as const };
      render(
        <ClearanceChecklistItem
          item={completedItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      const updateButton = screen.getByText('Update Status');
      expect(updateButton).toBeDisabled();
    });
  });

  describe('ClearanceChecklist Component', () => {
    it('should render checklist title', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText('Exit Clearance Checklist')).toBeInTheDocument();
    });

    it('should display completion summary', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText('1/3')).toBeInTheDocument();
      expect(screen.getByText('items completed')).toBeInTheDocument();
    });

    it('should calculate progress percentage correctly', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it.skip('should display pending mandatory count', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText(/Mandatory Pending/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it.skip('should show blocking items warning', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText(/Clearance In Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Blocking items:/i)).toBeInTheDocument();
      expect(screen.getByText('Room Inventory Check')).toBeInTheDocument();
    });

    it('should show completion message when all mandatory completed', () => {
      const completedChecklist: ExitClearanceChecklist = {
        ...mockChecklist,
        allMandatoryCompleted: true,
        blockingItems: [],
        items: mockChecklist.items.map(item => ({
          ...item,
          status: item.isMandatory ? 'COMPLETED' : item.status,
        })),
      };

      render(<ClearanceChecklist checklist={completedChecklist} />);

      expect(screen.getByText(/All Mandatory Items Completed/i)).toBeInTheDocument();
      expect(screen.getByText(/ready for final approval/i)).toBeInTheDocument();
    });

    it.skip('should render all checklist items', () => {
      render(<ClearanceChecklist checklist={mockChecklist} />);

      expect(screen.getByText('Room Inventory Check')).toBeInTheDocument();
      expect(screen.getByText('Key Return')).toBeInTheDocument();
      expect(screen.getByText('Accounts Clearance')).toBeInTheDocument();
    });

    it('should pass userRole to checklist items', () => {
      render(<ClearanceChecklist checklist={mockChecklist} userRole="STUDENT" />);

      // Students should see instructions
      const instructions = screen.getAllByText(/Instructions:/i);
      expect(instructions.length).toBeGreaterThan(0);
    });

    it('should pass onUpdateItemStatus to items', async () => {
      const mockUpdate = vi.fn();
      render(
        <ClearanceChecklist
          checklist={mockChecklist}
          userRole="SUPERINTENDENT"
          onUpdateItemStatus={mockUpdate}
        />
      );

      // Find first item's update button
      const updateButtons = screen.getAllByText('Update Status');
      expect(updateButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should prevent students from updating items', () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="STUDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    });

    it('should allow owner role to update their items', () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    it('should prevent cross-role updates', () => {
      const accountsItem = { ...mockClearanceItem, ownerRole: 'ACCOUNTS' as const };
      render(
        <ClearanceChecklistItem
          item={accountsItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    });
  });

  describe('Status Transitions and Audit', () => {
    it('should show warning for irreversible COMPLETED status', async () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Update Status'));

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'COMPLETED' } });
      });

      expect(screen.getByText(/irreversible action/i)).toBeInTheDocument();
    });

    it('should require justification for WAIVED status', async () => {
      render(
        <ClearanceChecklistItem
          item={mockClearanceItem}
          userRole="SUPERINTENDENT"
          onUpdateStatus={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Update Status'));

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'WAIVED' } });
      });

      expect(screen.getByText(/Waiving this item requires justification/i)).toBeInTheDocument();
    });
  });
});
