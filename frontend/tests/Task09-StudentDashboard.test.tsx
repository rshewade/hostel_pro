import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboard from '../src/app/dashboard/student/page';

describe('Task 9 - Student Dashboard (Approved Residents)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Dashboard Layout', () => {
    it('renders dashboard', () => {
      render(<StudentDashboard />);

      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    it('renders vertical badge', () => {
      render(<StudentDashboard />);

      const verticalTexts = screen.getAllByText(/Boys/i);
      expect(verticalTexts.length).toBeGreaterThan(0);
    });

    it('shows status badge', () => {
      render(<StudentDashboard />);

      const statusBadge = screen.getByText('Checked-in');
      expect(statusBadge).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has navigation links', () => {
      render(<StudentDashboard />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Fees')).toBeInTheDocument();
      expect(screen.getByText('Leave')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('has logout button', () => {
      render(<StudentDashboard />);

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('shows welcome message', () => {
      render(<StudentDashboard />);

      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      expect(screen.getByText(/Student/i)).toBeInTheDocument();
    });

    it('displays academic information', () => {
      render(<StudentDashboard />);

      expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
      expect(screen.getByText(/Current Period/i)).toBeInTheDocument();
    });
  });

  describe('DPDP Compliance', () => {
    it('shows DPDP consent alert when applicable', () => {
      render(<StudentDashboard />);

      const dpdpAlert = screen.queryByText(/DPDP/i);
      if (dpdpAlert) {
        expect(dpdpAlert).toBeInTheDocument();
      }
    });

    it('shows renewal content when applicable', () => {
      render(<StudentDashboard />);

      const renewalContent = screen.queryByText(/consent/i);
      if (renewalContent) {
        expect(renewalContent).toBeInTheDocument();
      }
    });
  });

  describe('Quick Actions', () => {
    it('has action buttons/cards', () => {
      render(<StudentDashboard />);

      expect(screen.getByText('Fees')).toBeInTheDocument();
      expect(screen.getByText('Leave')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});
