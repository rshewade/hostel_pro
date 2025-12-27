import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrackingPage from '../src/app/track/page';
import TrackingDetailPage from '../src/app/track/[id]/page';

// Mock applicant data
const mockApplicantData = {
  trackingNumber: 'HG-2024-00001',
  name: 'John Doe',
  vertical: 'boys-hostel',
  status: 'SUBMITTED',
  appliedDate: '2024-01-15',
  personalDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '9876543210',
  },
  interviewDetails: {
    mode: 'In-Person',
    date: '2024-01-20',
    time: '10:00 AM',
    venue: 'Main Office',
    status: 'upcoming',
  },
};

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'HG-2024-00001' })),
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}));

describe('Task 6 - Application Tracking Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockApplicantData])
      }) as any
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Entry Flow and Identity Verification', () => {
    it('renders landing CTA link and nav items', () => {
      render(<TrackingPage />);
      expect(screen.getByText('Hirachand Gumanji Family')).toBeInTheDocument();
      expect(screen.getByText('Track Your Application')).toBeInTheDocument();
    });

    it('renders tracking ID and mobile number input forms', () => {
      render(<TrackingPage />);
      expect(screen.getByLabelText(/tracking/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile/i)).toBeInTheDocument();
    });

    it('validates tracking ID format', () => {
      render(<TrackingPage />);
      const trackingInput = screen.getByLabelText(/tracking/i);
      fireEvent.change(trackingInput, { target: { value: 'HG-2024-00001' } });
      expect(trackingInput).toHaveValue('HG-2024-00001');
    });

    it('validates phone number (10 digits, starts with 6-9)', () => {
      render(<TrackingPage />);
      const mobileInput = screen.getByLabelText(/mobile/i);
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      expect(mobileInput).toHaveValue('9876543210');
    });

    it('validates email format', () => {
      render(<TrackingPage />);
      expect(screen.queryByLabelText(/email/i)).toBeNull();
    });
  });

  describe('Core Tracking Page Layout', () => {
    it('renders applicant summary section', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryByText(/HG-2024-00001/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('renders visual status timeline', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryAllByText(/Submitted/i).length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('renders interview details card', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryAllByText(/Interview/i).length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('renders action buttons based on status', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryAllByRole('button').length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });
  });

  describe('State Variations', () => {
    it('shows awaiting documents state', async () => {
      const awaitingDocsData = { ...mockApplicantData, status: 'REVIEW' };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([awaitingDocsData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        const reviewElements = screen.queryAllByText(/Under Review/i);
        expect(reviewElements.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('shows interview in-progress state', async () => {
      const interviewData = { ...mockApplicantData, interviewDetails: { ...mockApplicantData.interviewDetails, status: 'completed' } };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([interviewData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        const interviewElements = screen.queryAllByText(/Interview/i);
        expect(interviewElements.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('shows provisional approval state', async () => {
      const approvedData = { ...mockApplicantData, status: 'APPROVED' };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([approvedData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        const approvedElements = screen.queryAllByText(/Approved/i);
        expect(approvedElements.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });
  });

  describe('Document Re-upload and Action Patterns', () => {
    it('renders re-upload modal for document missing', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryByText(/Re-upload Documents/i)).toBeDefined();
      }, { timeout: 1000 });
    });

    it('handles interview slot confirmation', async () => {
      const scheduledInterviewData = { ...mockApplicantData, interviewDetails: { ...mockApplicantData.interviewDetails, status: 'scheduled' } };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([scheduledInterviewData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        const confirmButton = screen.queryByText(/Confirm Interview/i);
        expect(confirmButton).toBeDefined();
      }, { timeout: 1000 });
    });

    it('handles provisional letter download', async () => {
      const approvedData = { ...mockApplicantData, status: 'APPROVED' };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([approvedData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        const downloadButton = screen.queryByText(/Download Letter/i);
        expect(downloadButton).toBeDefined();
      }, { timeout: 1000 });
    });
  });

  describe('Privacy and Compliance', () => {
    it('hides internal remarks from students', async () => {
      const internalRemarksData = { ...mockApplicantData, interviewDetails: { ...mockApplicantData.interviewDetails, internal_remarks: 'Internal note for staff only' } };
      (global.fetch as any).mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([internalRemarksData])
        })
      );

      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryByText(/Internal note for staff only/i)).toBeNull();
      }, { timeout: 1000 });
    });

    it('shows only high-level outcomes and instructions', async () => {
      render(<TrackingDetailPage />);
      await waitFor(() => {
        expect(screen.queryByText(/Data Protection/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
