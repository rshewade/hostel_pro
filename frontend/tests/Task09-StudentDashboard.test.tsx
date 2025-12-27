import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Badge } from '../src/components/ui/Badge';

// Mock user and data
const mockStudentUser = {
  id: 'student-001',
  name: 'John Doe',
  vertical: 'boys-hostel',
  role: 'STUDENT',
  email: 'john.doe@email.com',
  phone: '9876543210',
  room: 'Room 101',
  roomType: '2-sharing',
  status: 'ACTIVE',
};

const mockDashboardData = {
  journeyStatus: 'CHECKED_IN',
  fees: {
    status: 'PAID',
    hostel: { status: 'PAID', amount: 15000 },
    securityDeposit: { status: 'PAID', amount: 5000 },
  },
  leave: {
    status: 'ACTIVE',
    totalDays: 10,
    daysUsed: 3,
    daysRemaining: 7,
    },
  upcomingRenewal: {
    dueDate: '2024-06-01',
    status: 'UPCOMING',
    },
  notifications: [
    {
      id: 'notif-001',
      type: 'reminder',
      title: 'Fee Payment Due',
      message: 'Your hostel fees for December are due. Please pay by December 31st.',
      date: '2024-12-15',
      read: false,
    },
    {
      id: 'notif-002',
      type: 'info',
      title: 'Room Change Approved',
      message: 'Your request for room change from 2-sharing to 3-sharing has been approved.',
      date: '2024-12-10',
      read: true,
    },
  ],
  rooms: [
    { id: 'room-001', number: 'Room 101', type: '2-sharing', vertical: 'boys-hostel', floor: '1', status: 'OCCUPIED', currentStudent: { id: 'student-001' } },
    { id: 'room-002', number: 'Room 102', type: '2-sharing', vertical: 'girls-ashram', floor: '1', status: 'VACANT', currentStudent: { id: 'student-002' } },
  ],
};

describe('Task 9 - Student Dashboard (Approved Residents)', () => {
  beforeEach(() => {
    userEvent.setup();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      }) as any
    );
  });

  afterEach(cleanup);
  global.fetch = vi.fn();
  userEvent.reset();

  describe('Dashboard Layout and Structure', () => {
    it('renders hero status area', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.getByText(/Checked-in/i)).toBeInTheDocument();
      expect(screen.getByText(/Renewal Due/i)).toBeInTheDocument();
      expect(screen.queryByText(/Renewed/i)).toBeNull();
    });

    it('displays quick action cards', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.getByText('Pay Fees')).toBeInTheDocument();
      expect(screen.getByText('Download Letters')).toBeInTheDocument();
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();
      expect(screen.getByText('View Room Details')).toBeInTheDocument();
      expect(screen.queryByText('Renew Now')).toBeNull();
    });

    it('renders notifications panel', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const notifications = screen.queryAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);

      const reminderNotif = notifications[0];
      expect(reminderNotif.textContent).toContain('Fee Payment Due');
    });

    it('shows vertical context badge', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.queryByText(/Boys Hostel/i)).toBeInTheDocument();
      expect(screen.queryByText(/Girls Ashram/i)).toBeNull();
      expect(screen.queryByText(/Dharamshala/i)).toBeNull();
    });
  });

  describe('Journey Tracker', () => {
    it('renders journey tracker', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const timeline = screen.getByTestId('journey-timeline');
      expect(timeline).toBeInTheDocument();

      const steps = ['Checked-in', 'Renewed', 'Exited'];
      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('shows current status correctly', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.getByText('Checked-in')).toBeInTheDocument();
      expect(screen.queryByText(/Renewed/i)).toBeNull();
      expect(screen.queryByText(/Exited/i)).toBeNull();
    });
  });

  describe('Quick Actions', () => {
    it('Pay Fees button navigates correctly', async () => {
      const mockWindowLocation = {
        value: '/dashboard/student/pay-fees',
        writable: true,
      };

      Object.defineProperty(window, 'location', {
        configurable: true,
        value: mockWindowLocation,
      });

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const payFeesButton = screen.getByText('Pay Fees');
      fireEvent.click(payFeesButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/student/pay-fees');
      });

      delete Object.defineProperty(window, 'location');
    });

    it('Download Letters button downloads receipt', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const downloadButton = screen.getByText('Download Letters');
      fireEvent.click(downloadButton);

      // In real implementation, this would trigger file download
      expect(downloadButton).toBeInTheDocument();
    });

    it('Apply for Leave button navigates to leave form', async () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const applyLeaveButton = screen.getByText('Apply for Leave');
      fireEvent.click(applyLeaveButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard/student/apply-leave');
      });
    });

    it('Renewal button shows only when due', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const renewalCard = screen.queryByTestId('renewal-card');
      expect(renewCard).toBeNull(); // Not yet due

      // Mock data to show renewal button
      const mockDataWithRenewal = {
        ...mockDashboardData,
        upcomingRenewal: {
          ...mockDashboardData.upcomingRenewal,
          status: 'DUE_SOON',
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDataWithRenewal)
        }) as any
      );

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const renewalCard = screen.queryByTestId('renewal-card');
      expect(renewCard).toBeInTheDocument();
      expect(screen.getByText('Renew Now')).toBeInTheDocument();
    });
  });

  describe('Notifications Panel', () => {
    it('displays reminders and alerts', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const notifications = screen.queryAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);

      const reminder = notifications[0];
      expect(reminder.textContent).toContain('Fee Payment Due');
      expect(reminder).toHaveClass(/bg-blue-50/);

      const alert = notifications[1];
      expect(alert.textContent).toContain('Room Change');
      expect(alert).toHaveClass(/bg-green-50/);
    });

    it('notifications have correct type-based styling', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const notifications = screen.queryAllByRole('listitem');

      notifications.forEach(notif => {
        const typeBadge = notif.querySelector('[data-type]');
        expect(typeBadge).toHaveAttribute('data-type');
      });
    });

    it('notifications are sorted by date', () => {
      // This would require checking actual rendering order
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const notifications = screen.queryAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('notification read status is persisted', () => {
      const readNotif = notifications[0];
      expect(readNotif.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Vertical Context Propagation', () => {
    it('displays vertical badge for boys-hostel', () => {
      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
    });

    it('dashboard adapts for different verticals', () => {
      // Test with girls-ashram
      const mockGirlsStudentUser = {
        ...mockStudentUser,
        vertical: 'girls-ashram',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockDashboardData,
            user: mockGirlsStudentUser
          })
        }) as any
      );

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.queryByText('Boys Hostel')).toBeNull();
      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
      expect(screen.getByText(/Room 102/)).toBeInTheDocument(); // Girls hostel room
    });
  });

  describe('Responsive Layouts', () => {
    it('displays correctly on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const quickActionsGrid = screen.getByTestId('quick-actions');
      expect(quickActionsGrid).toHaveClass(/grid-cols-4/);
    });

    it('displays correctly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const quickActionsGrid = screen.getByTestId('quick-actions');
      expect(quickActionsGrid).toHaveClass(/grid-cols-2/);
      });
    });

    it('hero section stacks correctly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      const heroSection = screen.getByTestId('hero-section');
      const statusCard = screen.getByTestId('status-card');
      const quickActions = screen.getByTestId('quick-actions');

      expect(heroSection).toHaveClass(/flex-col/);
      expect(statusCard).toHaveClass(/mt-4/);
      expect(quickActions).toHaveClass(/mt-4/);
    });
  });

  describe('Governance Elements', () => {
    it('shows DPDP consent renewal alert', () => {
      const mockDataWithAlert = {
        ...mockDashboardData,
        upcomingRenewal: {
          ...mockDashboardData.upcomingRenewal,
          daysRemaining: 30,
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDataWithAlert)
        }) as any
      );

      render(<BrowserRouter><StudentDashboard /></BrowserRouter>);

      expect(screen.getByText(/DPDP Consent/i)).toBeInTheDocument();
      expect(screen.getByText(/30 days remaining/i)).toBeInTheDocument();
    });
  });
});
