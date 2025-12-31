import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ExitRequestCard,
  ExitDashboard,
  ClearanceDetailModal,
} from '../src/components/exit';
import {
  filterExitRequests,
  sortExitRequests,
  calculateDashboardStats,
  getProgressState,
} from '../src/components/exit/dashboardUtils';
import type {
  ExitRequestSummary,
  DashboardFilters,
  SortOption,
  ExitClearanceChecklist,
  ClearanceItem,
} from '../src/components/exit';

// Mock Next.js modules
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockExitRequest: ExitRequestSummary = {
  id: 'exit-1',
  studentName: 'John Doe',
  studentId: 'STU001',
  roomNumber: 'A-101',
  vertical: 'BOYS',
  requestedExitDate: '2025-02-15T00:00:00Z',
  submittedDate: '2025-01-01T00:00:00Z',
  currentStatus: 'UNDER_CLEARANCE',
  clearanceProgress: {
    total: 5,
    completed: 2,
    pending: 3,
    overdue: 0, // Changed from 1 to 0 for IN_PROGRESS state
  },
  ownedItems: {
    total: 2,
    completed: 1,
    pending: 1,
  },
  agingDays: 30,
  isHighRisk: false,
  lastActivity: {
    timestamp: '2025-01-15T10:00:00Z',
    actor: 'Superintendent',
    action: 'Updated room inventory status',
  },
};

const mockHighRiskRequest: ExitRequestSummary = {
  ...mockExitRequest,
  id: 'exit-2',
  studentName: 'Jane Smith',
  studentId: 'STU002',
  roomNumber: 'B-202', // Changed room number
  agingDays: 45,
  isHighRisk: true,
  clearanceProgress: {
    total: 5,
    completed: 1,
    pending: 3,
    overdue: 2,
  },
};

const mockCompletedRequest: ExitRequestSummary = {
  ...mockExitRequest,
  id: 'exit-3',
  studentName: 'Bob Wilson',
  studentId: 'STU003',
  roomNumber: 'C-303', // Changed room number
  currentStatus: 'APPROVED',
  clearanceProgress: {
    total: 5,
    completed: 5,
    pending: 0,
    overdue: 0,
  },
  ownedItems: {
    total: 2,
    completed: 2,
    pending: 0,
  },
  isHighRisk: false,
  agingDays: 15,
};

const mockClearanceItem: ClearanceItem = {
  id: '1',
  type: 'ROOM_INVENTORY',
  title: 'Room Inventory Check',
  description: 'Verify all room items',
  ownerRole: 'SUPERINTENDENT',
  status: 'PENDING',
  isMandatory: true,
  lastUpdatedAt: '2025-01-01T10:00:00Z',
  lastUpdatedBy: 'System',
  remarks: '',
  studentInstructions: 'Clean your room',
  history: [],
};

const mockChecklist: ExitClearanceChecklist = {
  exitRequestId: 'exit-1',
  items: [
    mockClearanceItem,
    {
      ...mockClearanceItem,
      id: '2',
      type: 'ACCOUNTS_CLEARANCE',
      ownerRole: 'ACCOUNTS',
      status: 'COMPLETED',
    },
  ],
  allMandatoryCompleted: false,
  blockingItems: ['1'],
};

// Mock fetch for modal tests
global.fetch = vi.fn();

describe('Task 20.3 - Admin Clearance Dashboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Dashboard Utility Functions', () => {
    describe('getProgressState', () => {
      it('should return OVERDUE when overdue items exist', () => {
        expect(getProgressState(mockHighRiskRequest)).toBe('OVERDUE');
      });

      it('should return COMPLETED when all items completed', () => {
        expect(getProgressState(mockCompletedRequest)).toBe('COMPLETED');
      });

      it('should return IN_PROGRESS when some items completed', () => {
        expect(getProgressState(mockExitRequest)).toBe('IN_PROGRESS');
      });

      it('should return NOT_STARTED when no items completed', () => {
        const notStarted = {
          ...mockExitRequest,
          clearanceProgress: { total: 5, completed: 0, pending: 5, overdue: 0 },
        };
        expect(getProgressState(notStarted)).toBe('NOT_STARTED');
      });
    });

    describe('filterExitRequests', () => {
      const requests = [mockExitRequest, mockHighRiskRequest, mockCompletedRequest];

      it('should filter by vertical', () => {
        const filters: DashboardFilters = { vertical: 'BOYS' };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(3); // All are BOYS
      });

      it('should filter by progress state', () => {
        const filters: DashboardFilters = { progressState: 'COMPLETED' };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('exit-3');
      });

      it('should filter by date range', () => {
        const filters: DashboardFilters = {
          dateRange: {
            from: '2025-02-01',
            to: '2025-02-28',
          },
        };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(3); // All have exit date in Feb
      });

      it('should filter by search query - student name', () => {
        const filters: DashboardFilters = { searchQuery: 'john' };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].studentName).toBe('John Doe');
      });

      it('should filter by search query - student ID', () => {
        const filters: DashboardFilters = { searchQuery: 'STU002' };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].studentId).toBe('STU002');
      });

      it('should filter by search query - room number', () => {
        const filters: DashboardFilters = { searchQuery: 'A-101' };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].roomNumber).toBe('A-101');
      });

      it('should combine multiple filters', () => {
        const filters: DashboardFilters = {
          vertical: 'BOYS',
          progressState: 'OVERDUE',
        };
        const filtered = filterExitRequests(requests, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].isHighRisk).toBe(true);
      });
    });

    describe('sortExitRequests', () => {
      const requests = [mockExitRequest, mockHighRiskRequest, mockCompletedRequest];

      it('should sort by OLDEST_FIRST', () => {
        const sorted = sortExitRequests(requests, 'OLDEST_FIRST');
        expect(sorted[0].id).toBe('exit-1'); // All same submission date
      });

      it('should sort by HIGH_RISK_FIRST', () => {
        const sorted = sortExitRequests(requests, 'HIGH_RISK_FIRST');
        expect(sorted[0].isHighRisk).toBe(true);
        expect(sorted[0].id).toBe('exit-2');
      });

      it('should sort by PROGRESS_ASC', () => {
        const sorted = sortExitRequests(requests, 'PROGRESS_ASC');
        expect(sorted[0].id).toBe('exit-2'); // Least progress (20%)
        expect(sorted[2].id).toBe('exit-3'); // Most progress (100%)
      });

      it('should sort by PROGRESS_DESC', () => {
        const sorted = sortExitRequests(requests, 'PROGRESS_DESC');
        expect(sorted[0].id).toBe('exit-3'); // Most progress (100%)
        expect(sorted[2].id).toBe('exit-2'); // Least progress (20%)
      });
    });

    describe('calculateDashboardStats', () => {
      const requests = [mockExitRequest, mockHighRiskRequest, mockCompletedRequest];

      it('should calculate total requests', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.totalRequests).toBe(3);
      });

      it('should calculate pending clearance count', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.pendingClearance).toBe(2);
      });

      it('should calculate completed clearance count', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.completedClearance).toBe(1);
      });

      it('should calculate high risk count', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.highRiskCount).toBe(1);
      });

      it('should calculate my pending items', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.myPendingItems).toBe(2); // 1 + 1 + 0
      });

      it('should calculate average aging days', () => {
        const stats = calculateDashboardStats(requests);
        expect(stats.averageAgingDays).toBe(30); // (30 + 45 + 15) / 3 = 30
      });
    });
  });

  describe('ExitRequestCard Component', () => {
    it('should render student information', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('STU001')).toBeInTheDocument();
      expect(screen.getByText(/Room A-101/)).toBeInTheDocument();
      expect(screen.getByText('BOYS')).toBeInTheDocument();
    });

    it('should display high risk badge for high risk requests', () => {
      render(
        <ExitRequestCard
          request={mockHighRiskRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });

    it('should show exit date and aging', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('30 days')).toBeInTheDocument();
    });

    it('should display progress bars', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('Overall Clearance Progress')).toBeInTheDocument();
      expect(screen.getByText('2/5')).toBeInTheDocument();
    });

    it('should show owned items progress when user has owned items', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText(/My Items \(SUPERINTENDENT\)/)).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('should call onViewDetails when View Details clicked', () => {
      const mockViewDetails = vi.fn();
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={mockViewDetails}
        />
      );

      fireEvent.click(screen.getByText('View Details'));
      expect(mockViewDetails).toHaveBeenCalledWith('exit-1');
    });

    it('should display last activity', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText(/Updated room inventory status/)).toBeInTheDocument();
      expect(screen.getByText(/Superintendent/)).toBeInTheDocument();
    });
  });

  describe('ExitDashboard Component', () => {
    const mockRequests = [mockExitRequest, mockHighRiskRequest, mockCompletedRequest];

    it('should render dashboard statistics', () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('Pending Clearance')).toBeInTheDocument();
      // Use getAllByText since "High Risk" appears both in stats and in card badges
      const highRiskTexts = screen.getAllByText('High Risk');
      expect(highRiskTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      const sortSelect = screen.getByDisplayValue('High Risk First');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should toggle filter panel when Filters button clicked', async () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      const filterButton = screen.getByText('Filters');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Hostel Vertical')).toBeInTheDocument();
        expect(screen.getByText('Progress State')).toBeInTheDocument();
      });
    });

    it('should filter requests when search query entered', async () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search by name/);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('Exit Requests (1)')).toBeInTheDocument();
      });
    });

    it('should sort requests when sort option changed', async () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      const sortSelect = screen.getByDisplayValue('High Risk First');
      fireEvent.change(sortSelect, { target: { value: 'PROGRESS_DESC' } });

      // The component should re-render with sorted requests
      await waitFor(() => {
        const cards = screen.getAllByText(/View Details/);
        expect(cards.length).toBe(3);
      });
    });

    it('should show empty state when no requests', () => {
      render(
        <ExitDashboard
          requests={[]}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('No exit requests found')).toBeInTheDocument();
      expect(screen.getByText(/No exit requests are currently in the system/)).toBeInTheDocument();
    });

    it('should show filtered empty state with clear button', async () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search by name/);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No exit requests found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
      });
    });

    it('should render all request cards', () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should show bulk action button when requests selected', async () => {
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
          onBulkAction={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText(/Bulk Action \(1\)/)).toBeInTheDocument();
      });
    });

    it('should call onBulkAction when bulk action button clicked', async () => {
      const mockBulkAction = vi.fn();
      render(
        <ExitDashboard
          requests={mockRequests}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
          onBulkAction={mockBulkAction}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        const bulkButton = screen.getByText(/Bulk Action/);
        fireEvent.click(bulkButton);
        expect(mockBulkAction).toHaveBeenCalled();
      });
    });
  });

  describe('ClearanceDetailModal Component', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          checklist: mockChecklist,
          auditTrail: [],
        }),
      });
    });

    it('should render modal with student information', async () => {
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Clearance Details - John Doe/)).toBeInTheDocument();
        expect(screen.getByText('STU001')).toBeInTheDocument();
        expect(screen.getByText(/Room A-101/)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Loading clearance details/)).toBeInTheDocument();
    });

    it('should render tabs', async () => {
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Clearance Checklist')).toBeInTheDocument();
        expect(screen.getByText(/Communication History/)).toBeInTheDocument();
        expect(screen.getByText(/Financial Settlement/)).toBeInTheDocument();
      });
    });

    it('should switch tabs when clicked', async () => {
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={vi.fn()}
        />
      );

      // Wait for modal to load
      await waitFor(() => {
        expect(screen.getByText('Clearance Checklist')).toBeInTheDocument();
      });

      // Click on Communication History tab
      const tabs = screen.getAllByText(/Communication History/);
      fireEvent.click(tabs[0]);

      // Check that communication tab content is visible
      await waitFor(() => {
        expect(screen.getByText('Student Contact Information')).toBeInTheDocument();
      });
    });

    it('should call onClose when close button clicked', async () => {
      const mockClose = vi.fn();
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={mockClose}
        />
      );

      await waitFor(() => {
        const closeButtons = screen.getAllByText('Close');
        fireEvent.click(closeButtons[0]);
        expect(mockClose).toHaveBeenCalled();
      });
    });

    it('should render clearance checklist in clearance tab', async () => {
      render(
        <ClearanceDetailModal
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Exit Clearance Checklist')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should show owned items for superintendent role', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="SUPERINTENDENT"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText(/My Items \(SUPERINTENDENT\)/)).toBeInTheDocument();
    });

    it('should show owned items for accounts role', () => {
      render(
        <ExitRequestCard
          request={mockExitRequest}
          userRole="ACCOUNTS"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText(/My Items \(ACCOUNTS\)/)).toBeInTheDocument();
    });
  });
});
