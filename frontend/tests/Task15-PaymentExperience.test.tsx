import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentFeesPage from '@/app/dashboard/student/fees/page';
import { PaymentReceipt } from '@/components/fees/PaymentReceipt';

/**
 * Task 15 Test Suite: Fee Payment and Student-Side Payment Experience
 *
 * Categories:
 * 1. Fee Overview Page (Subtask 15.1)
 * 2. Payment History (Subtask 15.3)
 * 3. Receipt Generation (Subtask 15.3)
 * 4. Accessibility and Responsive Design
 * 5. DPDP Compliance
 */

describe('Task 15: Fee Payment and Student Payment Experience', () => {
  /**
   * Category 1: Fee Overview Page (Task 15.1)
   */
  describe('15.1 - Fee Overview Page', () => {
    beforeEach(() => {
      render(<StudentFeesPage />);
    });

    it('should render fees page with correct title', () => {
      expect(screen.getByText('Fee Payments')).toBeInTheDocument();
    });

    it('should display vertical badge', () => {
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
    });

    it('should show fee overview section', () => {
      expect(screen.getByText('Fee Overview')).toBeInTheDocument();
    });

    it('should display total amount card', () => {
      const totalAmountElements = screen.getAllByText('Total Amount');
      expect(totalAmountElements.length).toBeGreaterThan(0);
      // Find the one in fee overview section
      const overviewSection = totalAmountElements.find(el => 
        el.closest('.mb-8')?.textContent?.includes('Fee Overview')
      );
      expect(overviewSection).toBeInTheDocument();
    });

    it('should display amount paid card', () => {
      expect(screen.getByText('Amount Paid')).toBeInTheDocument();
    });

    it('should display outstanding card', () => {
      const outstandingElements = screen.getAllByText('Outstanding');
      expect(outstandingElements.length).toBeGreaterThan(0);
      // Find one in fee overview section
      const overviewSection = outstandingElements.find(el => 
        el.closest('.mb-8')?.textContent?.includes('Fee Overview')
      );
      expect(overviewSection).toBeInTheDocument();
    });

    it('should display next due date card', () => {
      const nextDueDateElements = screen.getAllByText('Next Due Date');
      expect(nextDueDateElements.length).toBeGreaterThan(0);
      // Find one in fee overview section
      const overviewSection = nextDueDateElements.find(el => 
        el.closest('.mb-8')?.textContent?.includes('Fee Overview')
      );
      expect(overviewSection).toBeInTheDocument();
    });

    it('should show correct total amount', () => {
      expect(screen.getByText('₹77,000')).toBeInTheDocument();
    });

    it('should show correct paid amount', () => {
      expect(screen.getByText('₹35,000')).toBeInTheDocument();
    });

    it('should show correct outstanding amount', () => {
      expect(screen.getByText('₹42,000')).toBeInTheDocument();
    });

    it('should display fee details section', () => {
      expect(screen.getByText('Fee Details')).toBeInTheDocument();
    });

    it('should show Processing Fee', () => {
      expect(screen.getByText('Processing Fee')).toBeInTheDocument();
    });

    it('should show Hostel Fees', () => {
      expect(screen.getByText('Hostel Fees')).toBeInTheDocument();
    });

    it('should show Security Deposit', () => {
      expect(screen.getByText('Security Deposit')).toBeInTheDocument();
    });

    it('should show Key Deposit', () => {
      expect(screen.getByText('Key Deposit')).toBeInTheDocument();
    });

    it('should display DPDP and Financial Privacy Notice', () => {
      expect(screen.getByText(/Data Protection and Financial Privacy Notice/i)).toBeInTheDocument();
    });

    it('should show contact information', () => {
      expect(screen.getByText(/accounts@jainhostel.edu/i)).toBeInTheDocument();
      expect(screen.getByText(/\+91 12345 67890/)).toBeInTheDocument();
    });

    it('should show Pay Now buttons', () => {
      const buttons = screen.getAllByText('Pay Now');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  /**
   * Category 2: Payment History (Task 15.3)
   */
  describe('15.3 - Payment History', () => {
    beforeEach(() => {
      render(<StudentFeesPage />);
    });

    it('should display payment history section', () => {
      expect(screen.getByText('Payment History')).toBeInTheDocument();
    });

    it('should show table header', () => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument();
      expect(screen.getByText('Fee Name')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Receipt')).toBeInTheDocument();
    });

    it('should display transaction IDs', () => {
      const transactionIds = screen.getAllByText(/TXN-/i);
      expect(transactionIds.length).toBeGreaterThan(0);
    });

    it('should show Processing Fee payment', () => {
      const processingFees = screen.getAllByText('Processing Fee');
      expect(processingFees.length).toBeGreaterThan(0);
    });

    it('should show Hostel Fees partial payments', () => {
      const hostelFees = screen.getAllByText(/Hostel Fees/i);
      expect(hostelFees.length).toBeGreaterThan(0);
    });

    it('should show payment methods', () => {
      const upiMethods = screen.getAllByText('UPI');
      const qrMethods = screen.getAllByText('QR Code');
      expect(upiMethods.length).toBeGreaterThan(0);
      expect(qrMethods.length).toBeGreaterThan(0);
    });

    it('should show payment statuses', () => {
      const paidBadges = screen.getAllByText('Paid');
      const pendingBadge = screen.getByText('Pending');
      expect(paidBadges.length).toBeGreaterThan(0);
      expect(pendingBadge).toBeInTheDocument();
    });

    it('should have Download buttons', () => {
      const buttons = screen.getAllByText('Download');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show payment amounts', () => {
      expect(screen.getByText('₹5,000')).toBeInTheDocument();
      expect(screen.getAllByText('₹30,000').length).toBeGreaterThan(1);
    });

    it('should show payment dates', () => {
      expect(screen.getByText(/15 Jan 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/20 Jan 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/25 Jan 2024/i)).toBeInTheDocument();
    });
  });

  /**
   * Category 3: Receipt Generation (Task 15.3)
   */
  describe('15.3 - Receipt Generation', () => {
    const mockReceipt = {
      transactionId: 'TXN-1234567890',
      feeId: '2',
      feeName: 'Hostel Fees',
      feeBreakdown: {
        totalAmount: 30000,
        processingFee: 0,
        convenienceFee: 0,
        taxAmount: 5400,
        finalAmount: 30000,
      },
      payerDetails: {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@example.com',
        phone: '+91 98765 43210',
        vertical: 'Boys Hostel',
        academicYear: '2024-25',
      },
      paymentDetails: {
        method: 'UPI' as const,
        paymentDate: new Date('2024-01-20T10:30:00'),
        status: 'PAID' as const,
        referenceNumber: 'REF-ABC123XYZ',
      },
    };

    beforeEach(() => {
      render(<PaymentReceipt receipt={mockReceipt} />);
    });

    it('should render receipt header', () => {
      expect(screen.getByText(/Sheth Hirachand Gumanji Jain/i)).toBeInTheDocument();
      expect(screen.getByText('PAYMENT RECEIPT')).toBeInTheDocument();
    });

    it('should display transaction ID', () => {
      expect(screen.getByText('TXN-1234567890')).toBeInTheDocument();
    });

    it('should display payment status badge', () => {
      expect(screen.getByText('PAID')).toBeInTheDocument();
    });

    it('should show payment date', () => {
      expect(screen.getByText(/20 Jan 2024/i)).toBeInTheDocument();
    });

    it('should show payment method', () => {
      expect(screen.getByText('UPI')).toBeInTheDocument();
    });

    it('should display fee name and ID', () => {
      expect(screen.getByText('Hostel Fees')).toBeInTheDocument();
      expect(screen.getByText('Fee ID: 2')).toBeInTheDocument();
    });

    it('should show payment breakdown', () => {
      expect(screen.getByText(/Total Amount/i)).toBeInTheDocument();
      expect(screen.getByText('₹30,000')).toBeInTheDocument();
      expect(screen.getByText(/Tax \(GST 18%\)/i)).toBeInTheDocument();
      expect(screen.getByText('₹5,400')).toBeInTheDocument();
    });

    it('should show total amount paid prominently', () => {
      const totalElements = screen.getAllByText('₹30,000');
      expect(totalElements.length).toBeGreaterThan(1);
    });

    it('should display payer information', () => {
      expect(screen.getByText('Rahul Kumar')).toBeInTheDocument();
      expect(screen.getByText('rahul.kumar@example.com')).toBeInTheDocument();
      expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
      expect(screen.getByText('2024-25')).toBeInTheDocument();
    });

    it('should display reference number', () => {
      expect(screen.getByText('REF-ABC123XYZ')).toBeInTheDocument();
      expect(screen.getByText(/Reference Number/i)).toBeInTheDocument();
    });

    it('should show terms and conditions', () => {
      expect(screen.getByText(/Terms & Conditions/i)).toBeInTheDocument();
      expect(screen.getByText(/electronically generated receipt/i)).toBeInTheDocument();
    });

    it('should display DPDP compliance notice', () => {
      expect(screen.getByText(/Data Protection & Privacy/i)).toBeInTheDocument();
      expect(screen.getByText(/DPDP/i)).toBeInTheDocument();
      expect(screen.getByText(/encryption/i)).toBeInTheDocument();
    });

    it('should show footer with institution details', () => {
      const institutionNames = screen.getAllByText(/Sheth Hirachand Gumanji Jain/i);
      expect(institutionNames.length).toBeGreaterThan(1);
    });

    it('should have Print Receipt button', () => {
      expect(screen.getByText('Print Receipt')).toBeInTheDocument();
    });

    it('should have Download PDF button', () => {
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  /**
   * Category 4: Accessibility and Responsive Design
   */
  describe('Accessibility and Responsive Design', () => {
    it('should have proper heading hierarchy', () => {
      render(<StudentFeesPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getAllByRole('heading', { level: 2 });
      const h3 = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2.length).toBeGreaterThan(0);
      expect(h3.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(<StudentFeesPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be responsive with grid layout', () => {
      render(<StudentFeesPage />);

      const gridElements = document.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should have proper table structure', () => {
      render(<StudentFeesPage />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  /**
   * Category 5: DPDP Compliance
   */
  describe('DPDP Compliance', () => {
    it('should display DPDP notice on fees page', () => {
      render(<StudentFeesPage />);

      expect(screen.getByText(/Data Protection and Financial Privacy Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/DPDP/i)).toBeInTheDocument();
    });

    it('should display DPDP notice in receipt', () => {
      const mockReceipt = {
        transactionId: 'TXN-123',
        feeId: '2',
        feeName: 'Test Fee',
        feeBreakdown: {
          totalAmount: 1000,
          processingFee: 0,
          convenienceFee: 0,
          taxAmount: 180,
          finalAmount: 1000,
        },
        payerDetails: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+91 12345 67890',
          vertical: 'Boys Hostel',
          academicYear: '2024-25',
        },
        paymentDetails: {
          method: 'UPI' as const,
          paymentDate: new Date(),
          status: 'PAID' as const,
          referenceNumber: 'REF-TEST',
        },
      };

      render(<PaymentReceipt receipt={mockReceipt} />);

      expect(screen.getByText(/Data Protection & Privacy/i)).toBeInTheDocument();
      expect(screen.getByText(/DPDP/i)).toBeInTheDocument();
    });

    it('should show contact information for support', () => {
      render(<StudentFeesPage />);

      expect(screen.getByText(/accounts@jainhostel.edu/i)).toBeInTheDocument();
      expect(screen.getByText(/\+91 12345 67890/i)).toBeInTheDocument();
    });
  });
});
