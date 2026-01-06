import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ExitCertificateTemplate,
  ExitCertificateViewer,
  CertificateGenerationButton,
} from '../../src/components/exit';
import type { CertificateData } from '../../src/components/exit';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock certificate data
const mockCertificateData: CertificateData = {
  certificateId: 'CERT-2025-001',
  version: 1,
  studentName: 'John Doe',
  studentId: 'STU001',
  fatherName: 'Richard Doe',
  vertical: 'Boys Hostel',
  roomNumber: 'B-201',
  admissionDate: '2023-07-01T00:00:00Z',
  exitDate: '2025-01-15T00:00:00Z',
  stayDuration: '18 months',
  approvalDate: '2025-01-10T00:00:00Z',
  approvedBy: 'Trustee Name',
  approvedByRole: 'TRUSTEE',
  generatedAt: '2025-01-15T10:00:00Z',
  generatedBy: 'Admin User',
  versionHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
};

const mockCertificateWithConduct: CertificateData = {
  ...mockCertificateData,
  conductStatement: {
    rating: 'EXCELLENT',
    remarks: 'Outstanding behavior and adherence to hostel rules.',
    issuedBy: 'Superintendent Name',
    issuedByRole: 'SUPERINTENDENT',
  },
};

const mockReissuedCertificate: CertificateData = {
  ...mockCertificateData,
  version: 2,
  previousVersionId: 'CERT-2025-001-V1',
  reissueReason: 'Correction in father\'s name',
};

describe('Task 20.5 - Exit Certificate Template and Download', () => {
  describe('ExitCertificateTemplate Component', () => {
    it('should render certificate with all required student details', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('STU001')).toBeInTheDocument();
      expect(screen.getByText('Richard Doe')).toBeInTheDocument();
      expect(screen.getAllByText('Boys Hostel').length).toBeGreaterThan(0);
      expect(screen.getByText('B-201')).toBeInTheDocument();
    });

    it('should display certificate header with institution branding', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      const institutionNames = screen.getAllByText('Jain Hostel & Ashram');
      expect(institutionNames.length).toBeGreaterThan(0);
      expect(screen.getByText('EXIT CERTIFICATE')).toBeInTheDocument();
      expect(screen.getByAltText('Institution Logo')).toBeInTheDocument();
    });

    it('should show certificate ID and version', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      const certIdElements = screen.getAllByText(/CERT-2025-001/);
      expect(certIdElements.length).toBeGreaterThan(0);
    });

    it('should display stay period information', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.getByText('18 months')).toBeInTheDocument();
    });

    it('should show conduct statement when provided', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateWithConduct} />);

      expect(screen.getByText('Conduct & Behavior')).toBeInTheDocument();
      expect(screen.getByText('EXCELLENT')).toBeInTheDocument();
      expect(screen.getByText(/Outstanding behavior/)).toBeInTheDocument();
    });

    it('should not show conduct section when not provided', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.queryByText('Conduct & Behavior')).not.toBeInTheDocument();
    });

    it('should display approval information', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.getByText('Trustee Name')).toBeInTheDocument();
    });

    it('should show signature placeholders', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.getByText('Superintendent')).toBeInTheDocument();
      expect(screen.getByText('Trustee/Authorized Signatory')).toBeInTheDocument();
    });

    it('should display version information in footer', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      const versionElements = screen.getAllByText(/Version: 1/);
      expect(versionElements.length).toBeGreaterThan(0);
    });

    it('should show re-issue notice for re-issued certificates', () => {
      render(<ExitCertificateTemplate certificate={mockReissuedCertificate} />);

      expect(screen.getByText('Certificate Re-issued')).toBeInTheDocument();
      expect(screen.getByText(/Correction in father/)).toBeInTheDocument();
    });

    it('should display version 2 for re-issued certificate', () => {
      render(<ExitCertificateTemplate certificate={mockReissuedCertificate} />);

      const versionElements = screen.getAllByText(/Version 2/);
      expect(versionElements.length).toBeGreaterThan(0);
    });

    it('should show clearance completion statement', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(
        screen.getByText(/All clearance formalities including room inventory/)
      ).toBeInTheDocument();
    });

    it('should display official seal placeholder', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      expect(screen.getByText('Official Seal')).toBeInTheDocument();
    });

    it('should show version hash in footer', () => {
      render(<ExitCertificateTemplate certificate={mockCertificateData} />);

      const hashText = screen.getByText(/Hash: a1b2c3d4e5f6g7h8/);
      expect(hashText).toBeInTheDocument();
    });
  });

  describe('ExitCertificateViewer Component', () => {
    it('should render certificate viewer with controls', () => {
      render(<ExitCertificateViewer certificate={mockCertificateData} />);

      expect(screen.getByText('Exit Certificate - John Doe')).toBeInTheDocument();
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();
    });

    it('should hide controls when showControls is false', () => {
      render(
        <ExitCertificateViewer certificate={mockCertificateData} showControls={false} />
      );

      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
      expect(screen.queryByText('Print')).not.toBeInTheDocument();
    });

    it('should call onDownload when download button clicked', async () => {
      const mockOnDownload = vi.fn();
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          onDownload={mockOnDownload}
        />
      );

      const downloadButton = screen.getByText('Download PDF');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockOnDownload).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onPrint when print button clicked', async () => {
      const mockOnPrint = vi.fn();
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          onPrint={mockOnPrint}
        />
      );

      const printButton = screen.getByText('Print');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(mockOnPrint).toHaveBeenCalledTimes(1);
      });
    });

    it('should show re-issue button when canReissue is true', () => {
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          canReissue={true}
          onReissue={vi.fn()}
        />
      );

      const reissueButtons = screen.getAllByText('Re-issue');
      expect(reissueButtons.length).toBeGreaterThan(0);
    });

    it('should not show re-issue button when canReissue is false', () => {
      render(
        <ExitCertificateViewer certificate={mockCertificateData} canReissue={false} />
      );

      expect(screen.queryByText('Re-issue')).not.toBeInTheDocument();
    });

    it('should open re-issue modal when re-issue button clicked', () => {
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          canReissue={true}
          onReissue={vi.fn()}
        />
      );

      const reissueButton = screen.getAllByText('Re-issue')[0];
      fireEvent.click(reissueButton);

      expect(screen.getByText('Re-issue Certificate')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Explain why this certificate needs/)).toBeInTheDocument();
    });

    it('should require reason for re-issue', () => {
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          canReissue={true}
          onReissue={vi.fn()}
        />
      );

      const reissueButton = screen.getAllByText('Re-issue')[0];
      fireEvent.click(reissueButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Re-issue/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when reason is provided', () => {
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          canReissue={true}
          onReissue={vi.fn()}
        />
      );

      const reissueButton = screen.getAllByText('Re-issue')[0];
      fireEvent.click(reissueButton);

      const reasonTextarea = screen.getByPlaceholderText(/Explain why this certificate needs/);
      fireEvent.change(reasonTextarea, {
        target: { value: 'Correction needed in student name' },
      });

      const confirmButton = screen.getByText('Confirm Re-issue');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should call onReissue with reason when confirmed', async () => {
      const mockOnReissue = vi.fn();
      render(
        <ExitCertificateViewer
          certificate={mockCertificateData}
          canReissue={true}
          onReissue={mockOnReissue}
        />
      );

      const reissueButton = screen.getAllByText('Re-issue')[0];
      fireEvent.click(reissueButton);

      const reasonTextarea = screen.getByPlaceholderText(/Explain why this certificate needs/);
      const reason = 'Correction needed in student name';
      fireEvent.change(reasonTextarea, { target: { value: reason } });

      const confirmButton = screen.getByText('Confirm Re-issue');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnReissue).toHaveBeenCalledWith(reason);
      });
    });

    it('should display certificate version in header', () => {
      render(<ExitCertificateViewer certificate={mockCertificateData} />);

      expect(screen.getByText(/Version 1/)).toBeInTheDocument();
    });
  });

  describe('CertificateGenerationButton Component', () => {
    it('should show disabled state when exit request is not approved', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={false}
          onGenerate={vi.fn()}
        />
      );

      expect(screen.getByText('Certificate Not Available')).toBeInTheDocument();
      expect(
        screen.getByText(/Exit certificate can only be generated after final approval/)
      ).toBeInTheDocument();
    });

    it('should show generate button when approved and no existing certificate', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          hasExistingCertificate={false}
          onGenerate={vi.fn()}
        />
      );

      expect(screen.getByText('Generate Certificate')).toBeInTheDocument();
    });

    it('should show view and re-generate buttons when certificate exists', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          hasExistingCertificate={true}
          existingVersion={1}
          onGenerate={vi.fn()}
          onViewExisting={vi.fn()}
        />
      );

      expect(screen.getByText('View Certificate')).toBeInTheDocument();
      expect(screen.getByText('Re-generate')).toBeInTheDocument();
      expect(screen.getByText('Certificate Version 1 generated')).toBeInTheDocument();
    });

    it('should open generation modal when generate button clicked', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={vi.fn()}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      expect(screen.getByText('Generate Exit Certificate')).toBeInTheDocument();
    });

    it('should show conduct statement option in modal', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={vi.fn()}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      expect(screen.getByText('Include Conduct Statement (Optional)')).toBeInTheDocument();
    });

    it('should show conduct rating options when checkbox is checked', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={vi.fn()}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      const conductCheckbox = screen.getByLabelText(/Include Conduct Statement/);
      fireEvent.click(conductCheckbox);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Satisfactory')).toBeInTheDocument();
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    });

    it('should call onGenerate without conduct data when not included', async () => {
      const mockOnGenerate = vi.fn();
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={mockOnGenerate}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      const confirmButton = screen.getAllByText('Generate Certificate')[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith(undefined);
      });
    });

    it('should call onGenerate with conduct data when included', async () => {
      const mockOnGenerate = vi.fn();
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={mockOnGenerate}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      const conductCheckbox = screen.getByLabelText(/Include Conduct Statement/);
      fireEvent.click(conductCheckbox);

      const excellentRadio = screen.getByLabelText('Excellent');
      fireEvent.click(excellentRadio);

      const remarksTextarea = screen.getByPlaceholderText(/Add any specific remarks/);
      fireEvent.change(remarksTextarea, {
        target: { value: 'Exemplary conduct' },
      });

      const confirmButton = screen.getAllByText('Generate Certificate')[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith({
          rating: 'EXCELLENT',
          remarks: 'Exemplary conduct',
        });
      });
    });

    it('should call onViewExisting when view button clicked', () => {
      const mockOnViewExisting = vi.fn();
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          hasExistingCertificate={true}
          onGenerate={vi.fn()}
          onViewExisting={mockOnViewExisting}
        />
      );

      const viewButton = screen.getByText('View Certificate');
      fireEvent.click(viewButton);

      expect(mockOnViewExisting).toHaveBeenCalledTimes(1);
    });

    it('should show important warnings in modal', () => {
      render(
        <CertificateGenerationButton
          studentName="John Doe"
          exitRequestId="EXIT-001"
          isApproved={true}
          onGenerate={vi.fn()}
        />
      );

      const generateButton = screen.getByText('Generate Certificate');
      fireEvent.click(generateButton);

      expect(
        screen.getByText(/Certificate content will be locked and immutable/)
      ).toBeInTheDocument();
      expect(screen.getByText(/All generation events are logged/)).toBeInTheDocument();
    });
  });
});
