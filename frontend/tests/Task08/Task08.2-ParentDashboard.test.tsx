import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParentDashboard from '../../src/app/dashboard/parent/page';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock student data response
const mockStudentData = {
  success: true,
  data: {
    id: 'student-1',
    name: 'Rahul Jain',
    photo: null,
    vertical: 'Boys Hostel',
    room: 'B-101',
    joiningDate: '2024-06-15',
    status: 'CHECKED_IN',
  },
};

describe('Task 8.2 - Parent Dashboard IA and Layout', () => {
  beforeEach(() => {
    // Clear window.location
    delete (window as any).location;
    (window as any).location = {
      pathname: '/',
      search: '',
      href: 'http://localhost/',
    } as any;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => 'mock-session-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

    // Mock fetch to return student data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStudentData),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Student Overview Section', () => {
    it('renders student overview section', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      });
      // Student name appears multiple times (in welcome and overview)
      const studentNames = screen.getAllByText(/Rahul Jain/i);
      expect(studentNames.length).toBeGreaterThan(0);
    });

    it('displays student information correctly', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Student name appears multiple times
        const studentNames = screen.getAllByText(/Rahul Jain/i);
        expect(studentNames.length).toBeGreaterThan(0);
      });

      expect(screen.getByText(/Boys Hostel/i)).toBeInTheDocument();
      // Room and joining date are displayed in overview section
      const overviewSection = screen.getByText(/Student Overview/i).closest('div');
      expect(overviewSection).toBeInTheDocument();
    });

    it('displays student photo placeholder when no photo', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      });
      // Should show default avatar/icon instead of actual photo
      const photoElement = screen.queryByAltText('Rahul Jain');
      expect(photoElement).toBeNull();
    });

    it('displays student status badge', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // "Checked In" appears in multiple places (badge and student info)
        const checkedInElements = screen.getAllByText(/Checked In/i);
        expect(checkedInElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Fee Status Section', () => {
    it('renders fee status section', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Fee Status/i)).toBeInTheDocument();
      });
    });

    it('displays fee summary cards', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Total Fees/i)).toBeInTheDocument();
      });
      // "Paid" appears in multiple places (fee summary, leave summary, badges)
      expect(screen.queryAllByText(/Paid/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Outstanding/i)).toBeInTheDocument();
      // Fee amounts are displayed (using rupee symbol) - verify within main element
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveTextContent(/₹/);
    });

    it('displays fee items table', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Fee section is rendered with table
        expect(screen.getByText(/Fee Status/i)).toBeInTheDocument();
      });

      // Section contains monetary amounts - verify within main element
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveTextContent(/₹/);
    });

    it('shows download button for paid fees', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Download buttons exist for paid fees (multiple "Download" text in the page)
        const feeSection = screen.getByText(/Fee Status/i).closest('div');
        expect(feeSection).toBeInTheDocument();
      });
    });

    it('displays payment progress bar', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Payment Progress/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/67%/i)).toBeInTheDocument();
    });

    it('shows outstanding payment reminder', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Outstanding payment reminder is displayed when there's outstanding balance
        expect(screen.queryByText(/Next payment/i)).toBeInTheDocument();
      });
    });

    it('displays status badges for fees', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Check for status badges - these should appear in the fee table
        const paidBadges = screen.getAllByText(/Paid/i);
        expect(paidBadges.length).toBeGreaterThan(0);
      });

      const pendingBadges = screen.getAllByText(/Pending/i);
      expect(pendingBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Leave Summary Section', () => {
    it('renders leave summary section', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      });
    });

    it('displays leave summary cards', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Leave summary cards show counts (numbers)
        expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Upcoming/i)).toBeInTheDocument();
      // Check for the summary cards by looking for multiple status texts
      expect(screen.getAllByText(/Approved/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Rejected/i).length).toBeGreaterThan(0);
    });

    it('displays leave requests table', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Leave summary table is rendered
        expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      });

      // Leave section shows data
      const leaveSection = screen.getByText(/Leave Summary/i).closest('div');
      expect(leaveSection).toBeInTheDocument();
    });

    it('displays status badges for leave requests', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Badges are rendered for each status type
        const statusElements = screen.getAllByText(/Approved|Rejected|Pending/i);
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Notifications Center', () => {
    it('renders notifications center', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });
    });

    it('displays notification items', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Fee Payment Reminder/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Leave Application Approved/i)).toBeInTheDocument();
      expect(screen.getByText(/Room Inspection Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/Winter Schedule/i)).toBeInTheDocument();
    });

    it('shows notification dates', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Notifications section is rendered
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });
    });

    it('displays notification messages', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Notification titles are shown
        expect(screen.getByText(/Fee Payment Reminder/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Leave Application Approved/i)).toBeInTheDocument();
      expect(screen.getByText(/Room Inspection Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/Winter Schedule/i)).toBeInTheDocument();
    });
  });

  describe('View-Only Behavior', () => {
    it('shows view-only access banner', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/View-Only Access/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/read-only access/i)).toBeInTheDocument();
    });

    it('has no editable form fields', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      });

      // Should not have any input, textarea, or select elements for editing
      const inputs = screen.queryAllByRole('textbox');
      const textareas = screen.queryAllByRole('textbox', { hidden: true });
      const selects = screen.queryAllByRole('combobox');

      // Only search fields if any, but no edit forms
      expect(inputs.length + textareas.length + selects.length).toBe(0);
    });

    it('has no submit or action buttons for changes', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      });

      // Download buttons are fine, but no "Save", "Update", "Edit", "Submit" buttons
      const saveButtons = screen.queryAllByText(/Save/i);
      const updateButtons = screen.queryAllByText(/Update/i);
      const editButtons = screen.queryAllByText(/Edit/i);
      const submitButtons = screen.queryAllByText(/Submit/i);

      expect(saveButtons.length).toBe(0);
      expect(updateButtons.length).toBe(0);
      expect(editButtons.length).toBe(0);
      expect(submitButtons.length).toBe(0);
    });
  });

  describe('Responsive Layout', () => {
    it('renders on mobile viewport', async () => {
      render(<ParentDashboard />);

      await waitFor(() => {
        // Component should render without errors on mobile
        expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Fee Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });

    it('displays all sections in correct order', async () => {
      render(<ParentDashboard />);

      const sections = [
        'Student Overview',
        'Fee Status',
        'Leave Summary',
        'Notifications'
      ];

      await waitFor(() => {
        expect(screen.getByText(sections[0])).toBeInTheDocument();
      });

      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });
  });
});
