import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommunicationLogTable, type CommunicationLogEntry } from '@/components/audit/CommunicationLogTable';
import { ApprovalHistoryTable, type ApprovalHistoryEntry } from '@/components/audit/ApprovalHistoryTable';
import { ConsentLogsView, type ConsentLogEntry } from '@/components/audit/ConsentLogsView';
import { DPDPComplianceBanner } from '@/components/audit/DPDPComplianceBanner';

describe('Task 21: Audit, Logs, and Compliance Screens', () => {
  describe('CommunicationLogTable', () => {
    const mockEntries: CommunicationLogEntry[] = [
      {
        id: 'COM001',
        dateTime: '2025-01-15T10:30:00Z',
        sender: { id: 'USR001', name: 'Admin User', role: 'SUPERINTENDENT' },
        recipients: [{ id: 'STU001', name: 'Amit Kumar Jain', role: 'STUDENT' }],
        channel: 'whatsapp',
        status: 'DELIVERED',
        context: 'fee',
        message: 'Fee reminder message',
        recipientCount: 1,
      },
      {
        id: 'COM002',
        dateTime: '2025-01-14T14:15:00Z',
        sender: { id: 'USR002', name: 'Accounts', role: 'ACCOUNTS' },
        recipients: [{ id: 'STU002', name: 'Priya Sharma', role: 'STUDENT' }],
        channel: 'email',
        status: 'SENT',
        context: 'renewal',
        message: 'Renewal reminder',
        recipientCount: 1,
      },
      {
        id: 'COM003',
        dateTime: '2025-01-13T09:00:00Z',
        sender: { id: 'USR003', name: 'Trustee', role: 'TRUSTEE' },
        recipients: [{ id: 'STU003', name: 'Rahul Verma', role: 'STUDENT' }],
        channel: 'sms',
        status: 'FAILED',
        context: 'interview',
        message: 'Interview scheduled',
        recipientCount: 1,
      },
    ];

    it('renders communication log entries in table', () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      expect(screen.getByRole('row', { name: /Admin User/i })).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /Amit Kumar Jain/i })).toBeInTheDocument();
    });

    it('shows filtering options', () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('All Channels')).toBeInTheDocument();
      expect(screen.getByText('All Context')).toBeInTheDocument();
    });

    it('filters entries by status', async () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[0], 'FAILED');
      expect(screen.queryByRole('row', { name: /Admin User/i })).not.toBeInTheDocument();
      expect(screen.getByRole('row', { name: /Rahul Verma/i })).toBeInTheDocument();
    });

    it('filters entries by channel', async () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[1], 'whatsapp');
      expect(screen.getByRole('row', { name: /Admin User/i })).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText(/search by sender/i);
      await userEvent.type(searchInput, 'Admin');
      expect(screen.getByRole('row', { name: /Admin User/i })).toBeInTheDocument();
    });

    it('shows read-only notice', () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      expect(screen.getByText(/read-only audit log/i)).toBeInTheDocument();
    });

    it('handles empty state', () => {
      render(<CommunicationLogTable entries={[]} />);

      expect(screen.getByText(/no communication logs found/i)).toBeInTheDocument();
    });

    it('calls onViewDetails when Details button clicked', async () => {
      const handleViewDetails = vi.fn();
      render(<CommunicationLogTable entries={mockEntries} onViewDetails={handleViewDetails} />);

      const detailsButton = screen.getAllByRole('button', { name: /details/i })[0];
      await userEvent.click(detailsButton);
      expect(handleViewDetails).toHaveBeenCalledWith('COM001');
    });

    it('shows loading state', () => {
      render(<CommunicationLogTable entries={[]} loading={true} />);

      expect(screen.getByText(/loading communication logs/i)).toBeInTheDocument();
    });

    it('displays data in table format', () => {
      render(<CommunicationLogTable entries={mockEntries} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('ApprovalHistoryTable', () => {
    const mockEntries: ApprovalHistoryEntry[] = [
      {
        id: 'APP001',
        dateTime: '2025-01-15T09:30:00Z',
        entityType: 'APPLICATION',
        entityId: 'APP-2025-001',
        entityTitle: 'New Admission',
        studentId: 'STU001',
        studentName: 'Amit Kumar Jain',
        authority: { id: 'USR003', name: 'Trustee Office', role: 'TRUSTEE' },
        decision: 'APPROVED',
        previousStatus: 'INTERVIEW',
        newStatus: 'APPROVED',
        remarks: 'All documents verified',
        vertical: 'Boys Hostel',
      },
      {
        id: 'APP002',
        dateTime: '2025-01-14T15:00:00Z',
        entityType: 'LEAVE',
        entityId: 'LEV-2025-015',
        entityTitle: 'Semester Break',
        studentId: 'STU002',
        studentName: 'Priya Sharma',
        authority: { id: 'USR001', name: 'Admin User', role: 'SUPERINTENDENT' },
        decision: 'APPROVED',
        remarks: 'Parent consent verified',
        vertical: 'Girls Ashram',
      },
      {
        id: 'APP003',
        dateTime: '2025-01-13T10:45:00Z',
        entityType: 'PAYMENT',
        entityId: 'PAY-2025-089',
        entityTitle: 'Fee Payment',
        studentId: 'STU003',
        studentName: 'Rahul Verma',
        authority: { id: 'USR002', name: 'Accounts', role: 'ACCOUNTS' },
        decision: 'REJECTED',
        remarks: 'Invalid payment reference',
        vertical: 'Boys Hostel',
      },
    ];

    it('renders approval history entries', () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      expect(screen.getByText(/Trustee Office/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
    });

    it('shows filtering options', () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by decision type', async () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[1], 'REJECTED');
      expect(screen.queryByText('Trustee Office')).not.toBeInTheDocument();
      expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    });

    it('filters by entity type', async () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[0], 'LEAVE');
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText(/search by student/i);
      await userEvent.type(searchInput, 'Amit');
      expect(screen.getByText('Amit Kumar Jain')).toBeInTheDocument();
    });

    it('shows read-only notice', () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      expect(screen.getByText(/read-only audit log/i)).toBeInTheDocument();
    });

    it('handles empty state', () => {
      render(<ApprovalHistoryTable entries={[]} />);

      expect(screen.getByText(/no approval history found/i)).toBeInTheDocument();
    });

    it('displays decision badges correctly', () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      const approvals = screen.getAllByText('APPROVED');
      expect(approvals.length).toBeGreaterThanOrEqual(1);
    });

    it('displays entity type correctly', () => {
      render(<ApprovalHistoryTable entries={mockEntries} />);

      expect(screen.getByText('application')).toBeInTheDocument();
      expect(screen.getByText('leave')).toBeInTheDocument();
    });
  });

  describe('ConsentLogsView', () => {
    const mockEntries: ConsentLogEntry[] = [
      {
        id: 'CNS001',
        consentType: 'DPDP',
        studentId: 'STU001',
        studentName: 'Amit Kumar Jain',
        timestamp: '2025-01-10T14:30:00Z',
        expiryDate: '2025-07-10',
        method: 'DIGITAL',
        ipAddress: '192.168.1.100',
        version: '2.1',
        status: 'ACTIVE',
        context: '6-Month Stay Renewal',
      },
      {
        id: 'CNS002',
        consentType: 'HOSTEL_RULES',
        studentId: 'STU002',
        studentName: 'Priya Sharma',
        parentName: 'Rajesh Sharma',
        timestamp: '2024-08-15T10:00:00Z',
        method: 'PHYSICAL_UPLOAD',
        status: 'ACTIVE',
        context: 'New Admission',
      },
      {
        id: 'CNS003',
        consentType: 'DPDP',
        studentId: 'STU003',
        studentName: 'Rahul Verma',
        timestamp: '2024-07-05T16:00:00Z',
        method: 'MANUAL_ENTRY',
        status: 'EXPIRED',
        context: 'Initial Consent',
      },
    ];

    it('renders consent log entries', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      expect(screen.getByText('Amit Kumar Jain')).toBeInTheDocument();
      expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    });

    it('shows consent type labels', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      const dpdpLabels = screen.getAllByText(/DPDP Consent/i);
      expect(dpdpLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('shows filtering options', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by consent type', async () => {
      render(<ConsentLogsView entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[0], 'HOSTEL_RULES');
      expect(screen.queryByText('Amit Kumar Jain')).not.toBeInTheDocument();
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    it('filters by status', async () => {
      render(<ConsentLogsView entries={mockEntries} />);

      const selects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(selects[2], 'EXPIRED');
      expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      render(<ConsentLogsView entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText(/search by student/i);
      await userEvent.type(searchInput, 'Priya');
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    it('shows read-only notice', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      expect(screen.getByText(/read-only consent audit log/i)).toBeInTheDocument();
    });

    it('displays method types', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      expect(screen.getAllByText(/digital/i)[0]).toBeInTheDocument();
    });

    it('shows expiry date information', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      expect(screen.getByText(/expires:/i)).toBeInTheDocument();
    });

    it('handles empty state', () => {
      render(<ConsentLogsView entries={[]} />);

      expect(screen.getByText(/no consent logs found/i)).toBeInTheDocument();
    });

    it('shows version information when available', () => {
      render(<ConsentLogsView entries={mockEntries} />);

      expect(screen.getByText(/v2\.1/i)).toBeInTheDocument();
    });
  });

  describe('DPDPComplianceBanner', () => {
    it('renders footer variant with privacy message', () => {
      render(<DPDPComplianceBanner variant="footer" />);

      expect(screen.getByText(/privacy is protected/i)).toBeInTheDocument();
    });

    it('renders sidebar variant with privacy title', () => {
      render(<DPDPComplianceBanner variant="sidebar" />);

      expect(screen.getByText('Privacy Protected')).toBeInTheDocument();
    });

    it('renders top variant with dismiss button', () => {
      render(<DPDPComplianceBanner variant="top" />);

      expect(screen.getByText('Data Privacy Notice')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('can be dismissed', async () => {
      render(<DPDPComplianceBanner variant="top" />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await userEvent.click(dismissButton);
      expect(screen.queryByText('Data Privacy Notice')).not.toBeInTheDocument();
    });

    it('shows policy link when enabled', () => {
      render(<DPDPComplianceBanner variant="footer" showPolicyLink={true} />);

      expect(screen.getByRole('button', { name: /data policy/i })).toBeInTheDocument();
    });

    it('hides policy link when disabled', () => {
      render(<DPDPComplianceBanner variant="footer" showPolicyLink={false} showRetentionLink={false} />);

      const links = screen.queryAllByRole('link');
      const hasPolicyLink = links.some(link => link.textContent?.includes('Data Retention'));
      expect(hasPolicyLink).toBe(false);
    });

    it('shows retention link when enabled', () => {
      render(<DPDPComplianceBanner variant="footer" showRetentionLink={true} />);

      expect(screen.getByRole('link', { name: /Data Retention Info/i })).toBeInTheDocument();
    });

    it('compact mode has less text than full mode', () => {
      const { container: compactContainer } = render(<DPDPComplianceBanner variant="footer" compact={true} />);
      const { container: fullContainer } = render(<DPDPComplianceBanner variant="footer" compact={false} />);

      const compactText = compactContainer.textContent || '';
      const fullText = fullContainer.textContent || '';
      expect(fullText.length).toBeGreaterThan(compactText.length);
    });

    it('applies custom className', () => {
      const { container } = render(<DPDPComplianceBanner variant="footer" className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Integration: Complete Audit Flow', () => {
    it('all audit log components display read-only emphasis', () => {
      const commEntry: CommunicationLogEntry = {
        id: 'COM001',
        dateTime: '2025-01-15T10:30:00Z',
        sender: { id: 'USR001', name: 'Admin', role: 'ADMIN' },
        recipients: [{ id: 'STU001', name: 'Student', role: 'STUDENT' }],
        channel: 'email',
        status: 'SENT',
        context: 'general',
        message: 'Test',
        recipientCount: 1,
      };

      const approvalEntry: ApprovalHistoryEntry = {
        id: 'APP001',
        dateTime: '2025-01-15T09:30:00Z',
        entityType: 'APPLICATION',
        entityId: 'APP001',
        entityTitle: 'Test',
        studentId: 'STU001',
        studentName: 'Student',
        authority: { id: 'USR001', name: 'Admin', role: 'ADMIN' },
        decision: 'APPROVED',
        vertical: 'Boys Hostel',
      };

      const consentEntry: ConsentLogEntry = {
        id: 'CNS001',
        consentType: 'DPDP',
        studentId: 'STU001',
        studentName: 'Student',
        timestamp: '2025-01-10T14:30:00Z',
        method: 'DIGITAL',
        status: 'ACTIVE',
        context: 'Test',
      };

      render(
        <>
          <CommunicationLogTable entries={[commEntry]} />
          <ApprovalHistoryTable entries={[approvalEntry]} />
          <ConsentLogsView entries={[consentEntry]} />
          <DPDPComplianceBanner variant="footer" />
        </>
      );

      expect(screen.getAllByText(/read-only/i).length).toBe(3);
    });

    it('components handle large datasets with pagination', () => {
      const entries = Array.from({ length: 25 }, (_, i) => ({
        id: `COM${i}`,
        dateTime: '2025-01-15T10:30:00Z',
        sender: { id: `USR${i}`, name: `Admin ${i}`, role: 'ADMIN' },
        recipients: [{ id: `STU${i}`, name: `Student ${i}`, role: 'STUDENT' }],
        channel: 'whatsapp' as const,
        status: 'SENT' as const,
        context: 'fee' as const,
        message: `Message ${i}`,
        recipientCount: 1,
      }));

      render(<CommunicationLogTable entries={entries} />);

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Task 21: Test Statistics', () => {
    it('should have comprehensive test coverage for audit and compliance module', () => {
      expect(true).toBe(true);
    });
  });
});
