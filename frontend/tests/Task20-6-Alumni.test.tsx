import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  AlumniStatusBadge,
  AlumniStayHistory,
  AlumniContactEditor,
  AlumniProfilePage,
} from '../src/components/exit';
import type { AlumniData, StayHistorySummary, AlumniContactInfo } from '../src/components/exit';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockStayHistory: StayHistorySummary = {
  vertical: 'Boys Hostel',
  admissionDate: '2023-07-01T00:00:00Z',
  exitDate: '2025-01-15T00:00:00Z',
  totalDuration: '18 months',
  roomAllocations: [
    {
      roomNumber: 'B-201',
      fromDate: '2023-07-01T00:00:00Z',
      toDate: '2024-01-15T00:00:00Z',
    },
    {
      roomNumber: 'B-305',
      fromDate: '2024-01-16T00:00:00Z',
      toDate: '2025-01-15T00:00:00Z',
    },
  ],
  renewalCount: 2,
};

const mockContactInfo: AlumniContactInfo = {
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  permanentAddress: {
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
  },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Mother',
    phone: '+91 98765 43211',
  },
  lastUpdated: '2025-01-15T10:00:00Z',
  updateHistory: [
    {
      logId: 'LOG001',
      field: 'phone',
      oldValue: '+91 98765 00000',
      newValue: '+91 98765 43210',
      updatedBy: 'Admin User',
      updatedByRole: 'ADMIN',
      timestamp: '2025-01-15T10:00:00Z',
      reason: 'Updated phone number as requested',
    },
  ],
};

const mockAlumniData: AlumniData = {
  alumniId: 'ALU-2025-001',
  studentId: 'STU001',
  studentName: 'John Doe',
  fatherName: 'Richard Doe',
  dateOfBirth: '2000-05-15T00:00:00Z',
  status: 'ALUMNI',
  transitionDate: '2025-01-15T00:00:00Z',
  transitionTriggeredBy: 'System Auto-transition',
  stayHistory: mockStayHistory,
  contactInfo: mockContactInfo,
  financialSummary: {
    totalFeePaid: 50000,
    securityDepositPaid: 10000,
    securityDepositRefunded: 10000,
    finalDuesSettled: true,
    settlementDate: '2025-01-15T00:00:00Z',
    outstandingAmount: 0,
  },
  exitCertificateId: 'CERT-2025-001',
  communicationHistoryLink: '/admin/communications/STU001',
  financialRecordsLink: '/admin/financial/STU001',
  dataRetentionUntil: '2030-01-15T00:00:00Z',
  canBeDeleted: false,
};

describe('Task 20.6 - Alumni State Transition and Profile', () => {
  describe('AlumniStatusBadge Component', () => {
    it('should render ALUMNI status badge correctly', () => {
      render(<AlumniStatusBadge status="ALUMNI" />);

      expect(screen.getByText('Alumni')).toBeInTheDocument();
    });

    it('should render ARCHIVED status badge correctly', () => {
      render(<AlumniStatusBadge status="ARCHIVED" />);

      expect(screen.getByText('Archived')).toBeInTheDocument();
    });

    it('should show icon when showIcon is true', () => {
      const { container } = render(<AlumniStatusBadge status="ALUMNI" showIcon={true} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(<AlumniStatusBadge status="ALUMNI" showIcon={false} />);

      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should apply correct size classes', () => {
      const { rerender, container } = render(<AlumniStatusBadge status="ALUMNI" size="sm" />);

      let badge = container.querySelector('.text-xs');
      expect(badge).toBeInTheDocument();

      rerender(<AlumniStatusBadge status="ALUMNI" size="lg" />);
      badge = container.querySelector('.text-base');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('AlumniStayHistory Component', () => {
    it('should render stay history with vertical and duration', () => {
      render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
      expect(screen.getByText('18 months')).toBeInTheDocument();
    });

    it('should display admission and exit dates', () => {
      render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      const admissionDates = screen.getAllByText(/01 Jul 2023/);
      const exitDates = screen.getAllByText(/15 Jan 2025/);

      expect(admissionDates.length).toBeGreaterThan(0);
      expect(exitDates.length).toBeGreaterThan(0);
    });

    it('should show renewal count when renewals exist', () => {
      render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      expect(screen.getByText(/2 Renewals/)).toBeInTheDocument();
    });

    it('should display room allocation history', () => {
      render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      expect(screen.getByText('Room B-201')).toBeInTheDocument();
      expect(screen.getByText('Room B-305')).toBeInTheDocument();
    });

    it('should mark initial and final rooms', () => {
      render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      expect(screen.getByText('Initial')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should show summary statistics', () => {
      const { container } = render(<AlumniStayHistory stayHistory={mockStayHistory} />);

      // Check for room count, renewal count, and duration stats
      const stats = container.querySelectorAll('.text-2xl');
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe('AlumniContactEditor Component', () => {
    it('should render contact information in read-only mode', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={false} onSave={vi.fn()} />);

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
      expect(screen.getByText('123 Main Street')).toBeInTheDocument();
    });

    it('should show edit button when canEdit is true', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={true} onSave={vi.fn()} />);

      expect(screen.getByText('Edit Contact Info')).toBeInTheDocument();
    });

    it('should not show edit button when canEdit is false', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={false} onSave={vi.fn()} />);

      expect(screen.queryByText('Edit Contact Info')).not.toBeInTheDocument();
    });

    it('should enable editing mode when edit button clicked', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={true} onSave={vi.fn()} />);

      const editButton = screen.getByText('Edit Contact Info');
      fireEvent.click(editButton);

      // Should now show save and cancel buttons
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show input fields in edit mode', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={true} onSave={vi.fn()} />);

      const editButton = screen.getByText('Edit Contact Info');
      fireEvent.click(editButton);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should require update reason before saving', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={true} onSave={vi.fn()} />);

      const editButton = screen.getByText('Edit Contact Info');
      fireEvent.click(editButton);

      // Make a change
      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } });

      // Save button should be disabled until reason is provided
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when reason is provided', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={true} onSave={vi.fn()} />);

      const editButton = screen.getByText('Edit Contact Info');
      fireEvent.click(editButton);

      // Make a change
      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } });

      // Provide reason
      const reasonTextarea = screen.getByPlaceholderText(/e.g., New phone number/);
      fireEvent.change(reasonTextarea, { target: { value: 'Updated email address' } });

      // Save button should now be enabled
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should show update history button when history exists', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={false} onSave={vi.fn()} />);

      expect(screen.getByText(/History \(1\)/)).toBeInTheDocument();
    });

    it('should toggle history view when history button clicked', () => {
      render(<AlumniContactEditor contactInfo={mockContactInfo} canEdit={false} onSave={vi.fn()} />);

      const historyButton = screen.getByText(/History \(1\)/);
      fireEvent.click(historyButton);

      expect(screen.getByText('Update History')).toBeInTheDocument();
      expect(screen.getByText(/Updated phone number as requested/)).toBeInTheDocument();
    });
  });

  describe('AlumniProfilePage Component', () => {
    it('should render alumni profile with name and IDs', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Student ID: STU001/)).toBeInTheDocument();
      expect(screen.getByText(/Alumni ID: ALU-2025-001/)).toBeInTheDocument();
    });

    it('should show alumni status badge', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Alumni')).toBeInTheDocument();
    });

    it('should display read-only notice', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Read-Only Profile')).toBeInTheDocument();
      expect(screen.getByText('Alumni records are archived')).toBeInTheDocument();
    });

    it('should show irreversible status notice', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Irreversible Alumni Status')).toBeInTheDocument();
      expect(
        screen.getByText(/cannot be reverted to active resident through normal workflows/)
      ).toBeInTheDocument();
    });

    it('should display father name and date of birth', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Richard Doe')).toBeInTheDocument();
      expect(screen.getByText(/15 May 2000/)).toBeInTheDocument();
    });

    it('should show exit certificate link when available', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} canDownloadCertificate={true} />);

      expect(screen.getByText('Exit Certificate')).toBeInTheDocument();
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('should display financial summary', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      expect(screen.getByText(/₹50,000/)).toBeInTheDocument(); // Total fees paid
      expect(screen.getByText('All dues settled')).toBeInTheDocument();
    });

    it('should show outstanding dues when present', () => {
      const alumniWithDues: AlumniData = {
        ...mockAlumniData,
        financialSummary: {
          ...mockAlumniData.financialSummary,
          outstandingAmount: 5000,
          finalDuesSettled: false,
        },
      };

      render(<AlumniProfilePage alumniData={alumniWithDues} />);

      expect(screen.getByText('Outstanding dues pending')).toBeInTheDocument();
    });

    it('should render stay history component', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Stay History Summary')).toBeInTheDocument();
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
    });

    it('should render contact editor component', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should show data retention notice when approaching retention date', () => {
      const nearRetentionAlumni: AlumniData = {
        ...mockAlumniData,
        dataRetentionUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      };

      render(<AlumniProfilePage alumniData={nearRetentionAlumni} />);

      expect(screen.getByText('Data Retention Policy Notice')).toBeInTheDocument();
    });

    it('should provide links to communication and financial records', () => {
      render(<AlumniProfilePage alumniData={mockAlumniData} />);

      const communicationLink = screen.getByText('Communications').closest('a');
      const financialLink = screen.getByText('Financial Records').closest('a');

      expect(communicationLink).toHaveAttribute('href', '/admin/communications/STU001');
      expect(financialLink).toHaveAttribute('href', '/admin/financial/STU001');
    });
  });
});
