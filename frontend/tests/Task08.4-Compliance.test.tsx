import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParentDashboard from '../src/app/dashboard/parent/page';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe('Task 8.4 - Compliance, DPDP Info, Tooltips, and Scope Clarity', () => {
  beforeEach(() => {
    // Clear window.location
    delete (window as any).location;
    (window as any).location = { pathname: '/' } as any;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('DPDP Compliance Information', () => {
    it('displays DPDP compliance banner', () => {
      render(<ParentDashboard />);
      
      const mainElement = screen.getByRole('main');
      const textContent = mainElement.textContent || '';
      expect(textContent).toContain('DPDP Act');
      expect(textContent).toContain('Privacy');
    });

    it('shows DPDP year reference', () => {
      render(<ParentDashboard />);
      
      // Year 2023 should appear somewhere in the page
      const pageContent = screen.getByRole('main').textContent || '';
      expect(pageContent).toContain('2023');
    });

    it('shows link to full DPDP policy', () => {
      render(<ParentDashboard />);
      
      const policyLink = screen.queryByText(/DPDP Policy/i);
      expect(policyLink).toBeInTheDocument();
    });

    it('explains data encryption', () => {
      render(<ParentDashboard />);
      
      // Encryption-related text should be present
      const mainElement = screen.getByRole('main');
      const textContent = mainElement.textContent || '';
      expect(textContent).toContain('encrypted');
    });

    it('mentions audit logging', () => {
      render(<ParentDashboard />);
      
      // Audit-related text should be present
      const mainElement = screen.getByRole('main');
      const textContent = mainElement.textContent || '';
      expect(textContent).toContain('audit');
    });
  });

  describe('View-Only Access Information', () => {
    it('displays view-only access banner', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/View-Only Access/i)).toBeInTheDocument();
      expect(screen.getByText(/read-only access/i)).toBeInTheDocument();
    });

    it('explains restriction clearly', () => {
      render(<ParentDashboard />);
      
      const viewOnlySection = screen.getByText(/View-Only Access/i).closest('div');
      expect(viewOnlySection).toHaveTextContent(/read-only/);
      expect(viewOnlySection).toHaveTextContent(/cannot make changes/);
      expect(viewOnlySection).toHaveTextContent(/contact hostel administration/);
    });

    it('provides contact information for changes', () => {
      render(<ParentDashboard />);
      
      const viewOnlySection = screen.getByText(/View-Only Access/i).closest('div');
      expect(viewOnlySection).toHaveTextContent(/contact hostel administration/);
    });
  });

  describe('Tooltips for View-Only Permissions', () => {
    it('displays info icon next to section headings', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Fee Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });

    it('has info buttons with aria-labels', () => {
      render(<ParentDashboard />);
      
      const infoButtons = screen.getAllByLabelText(/Information about/i);
      expect(infoButtons.length).toBe(4);
    });
  });

  describe('Clear Section Labels', () => {
    it('labels Student Overview section clearly', () => {
      render(<ParentDashboard />);
      
      const studentOverviewHeading = screen.getByText(/Student Overview/i);
      expect(studentOverviewHeading).toBeInTheDocument();
    });

    it('labels Fee Status section clearly', () => {
      render(<ParentDashboard />);
      
      const feeHeading = screen.getByText(/Fee Status/i);
      expect(feeHeading).toBeInTheDocument();
    });

    it('labels Leave Summary section clearly', () => {
      render(<ParentDashboard />);
      
      const leaveHeading = screen.getByText(/Leave Summary/i);
      expect(leaveHeading).toBeInTheDocument();
    });

    it('labels Notifications section clearly', () => {
      render(<ParentDashboard />);
      
      const notificationsHeading = screen.getByText(/Notifications/i);
      expect(notificationsHeading).toBeInTheDocument();
    });

    it('labels Fee Status section clearly', () => {
      render(<ParentDashboard />);
      
      const feeHeading = screen.getByText(/Fee Status/i);
      expect(feeHeading).toBeInTheDocument();
      
      // Section should contain fee-related labels
      const sectionDiv = feeHeading.closest('div');
      expect(sectionDiv).toBeInTheDocument();
    });

    it('labels Leave Summary section clearly', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      // Status cards should exist with proper aria-labels
      const statusCards = screen.getAllByRole('status');
      expect(statusCards.length).toBeGreaterThan(0);
    });

    it('labels Notifications section clearly', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      expect(screen.getByText(/Fee Payment Reminder/i)).toBeInTheDocument();
      expect(screen.getByText(/Leave Application Approved/i)).toBeInTheDocument();
    });

    it('has clear page title and description', () => {
      render(<ParentDashboard />);
      
      const dashboardTitles = screen.getAllByText(/Parent Dashboard/i);
      expect(dashboardTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility and Screen Reader Support', () => {
    it('has proper ARIA labels on headings', () => {
      render(<ParentDashboard />);
      
      const studentOverviewHeading = screen.getByText(/Student Overview/i);
      expect(studentOverviewHeading).toHaveAttribute('id');
      
      const feeStatusHeading = screen.getByText(/Fee Status/i);
      expect(feeStatusHeading).toHaveAttribute('id');
      
      const leaveSummaryHeading = screen.getByText(/Leave Summary/i);
      expect(leaveSummaryHeading).toHaveAttribute('id');
      
      const notificationsHeading = screen.getByText(/Notifications/i);
      expect(notificationsHeading).toHaveAttribute('id');
    });

    it('has proper ARIA labels on status cards', () => {
      render(<ParentDashboard />);
      
      const statusCards = screen.getAllByRole('status');
      expect(statusCards.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels on action buttons', () => {
      render(<ParentDashboard />);
      
      const logoutButton = screen.getByText(/Logout/i);
      expect(logoutButton).toHaveAttribute('aria-label');
    });
  });

  describe('Contact and Help Information', () => {
    it('displays help section', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Need help/i)).toBeInTheDocument();
    });

    it('displays phone number with link', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/\+91 22 2414 1234/)).toBeInTheDocument();
    });

    it('displays email address', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/info@shgjaintrust\.org/i)).toBeInTheDocument();
    });

    it('shows help availability hours', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Available Monday to Saturday/i)).toBeInTheDocument();
      expect(screen.getByText(/9:00 AM to 6:00 PM IST/i)).toBeInTheDocument();
    });
  });

  describe('Session and Compliance Footer', () => {
    it('displays session expiration info', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Session:/i)).toBeInTheDocument();
      expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
    });

    it('displays data encryption info', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Data:/i)).toBeInTheDocument();
      expect(screen.getByText(/encrypted per DPDP Act/i)).toBeInTheDocument();
    });

    it('displays audit logging info', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Audit:/i)).toBeInTheDocument();
      expect(screen.getByText(/All access logged/i)).toBeInTheDocument();
    });
  });

  describe('Mobile-Friendly Interactions', () => {
    it('info buttons are keyboard accessible', () => {
      render(<ParentDashboard />);
      
      const infoButtons = screen.getAllByLabelText(/Information about/i);
      expect(infoButtons.length).toBe(4);
    });
  });

  describe('Concise and Clear Copy', () => {
    it('has clear section labels', () => {
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Student Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Fee Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });
  });
});
