import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboard from '../../src/app/dashboard/student/page';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

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

      expect(screen.getByText(/Welcome, Student/i)).toBeInTheDocument();
    });

    it('renders vertical badge', () => {
      render(<StudentDashboard />);

      const verticalTexts = screen.getAllByText(/Boys Hostel/i);
      expect(verticalTexts.length).toBeGreaterThan(0);
    });

    it('shows status badge', () => {
      render(<StudentDashboard />);

      const statusBadges = screen.getAllByText('Checked-in');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('has navigation links', () => {
      render(<StudentDashboard />);

      // Component uses action cards instead of traditional nav links
      expect(screen.getByText('Pay Fees')).toBeInTheDocument();
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();
      expect(screen.getByText('Download Letters')).toBeInTheDocument();
      expect(screen.getByText('Room Details')).toBeInTheDocument();
    });

    it('has action buttons', () => {
      render(<StudentDashboard />);

      expect(screen.getByText('Go to Fees')).toBeInTheDocument();
      expect(screen.getByText('Apply Leave')).toBeInTheDocument();
      expect(screen.getByText('View Documents')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('shows welcome message', () => {
      render(<StudentDashboard />);

      expect(screen.getByText(/Welcome, Student!/i)).toBeInTheDocument();
    });

    it('displays academic information', () => {
      render(<StudentDashboard />);

      // Multiple elements may contain Academic Year and Current Period (header + profile)
      const academicYearElements = screen.getAllByText(/Academic Year/i);
      expect(academicYearElements.length).toBeGreaterThan(0);
      const currentPeriodElements = screen.getAllByText(/Current Period/i);
      expect(currentPeriodElements.length).toBeGreaterThan(0);
    });
  });

  describe('DPDP Compliance', () => {
    it('shows DPDP consent alert when applicable', () => {
      render(<StudentDashboard />);

      // Component shows DPDP when renewalDaysRemaining <= 30 (default is 30)
      // Multiple elements may match, use getAllByText
      const dpdpElements = screen.getAllByText(/DPDP Consent Renewal Required/i);
      expect(dpdpElements.length).toBeGreaterThan(0);
    });

    it('shows renewal content when applicable', () => {
      render(<StudentDashboard />);

      expect(screen.getByText(/Review Consent/i)).toBeInTheDocument();
      // Multiple "Read Full Policy" links may exist
      const policyLinks = screen.getAllByText(/Read Full Policy/i);
      expect(policyLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Actions', () => {
    it('has action buttons/cards', () => {
      render(<StudentDashboard />);

      expect(screen.getByText('Pay Fees')).toBeInTheDocument();
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();
      expect(screen.getByText('Download Letters')).toBeInTheDocument();
      expect(screen.getByText('Renewal')).toBeInTheDocument();
    });
  });
});
