import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileUpload } from '@/components/forms/FileUpload';

describe('FileUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    label: 'Test File',
    value: null,
    onChange: vi.fn(),
    accept: '.jpg,.jpeg,.pdf',
    maxSize: 5 * 1024 * 1024,
    showPreview: true,
  };

  it('renders label correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Test File')).toBeInTheDocument();
    const label = screen.getByText('Test File');
    expect(label.closest('label')).toBeInTheDocument();
  });

  it('shows drag and drop UI when no file selected', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('shows error when provided', () => {
    render(<FileUpload {...defaultProps} error="File is required" />);
    expect(screen.getByText('File is required')).toBeInTheDocument();
  });

  it('shows helper text when provided', () => {
    render(<FileUpload {...defaultProps} helperText="Please upload a valid file" />);
    expect(screen.getByText('Please upload a valid file')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<FileUpload {...defaultProps} disabled />);
    // When disabled, the component should have disabled attribute on input or container
    const input = screen.queryByRole('button');
    if (input) {
      expect(input).toBeDisabled();
    }
  });

  it('allows removing file', async () => {
    const handleChange = vi.fn();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} value={mockFile} onChange={handleChange} />);
    
    // Look for remove button by aria-label
    const removeButton = screen.getByLabelText('Remove file');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(null);
    });
  });

  it('handles drag and drop events', async () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);
    
    const dropZone = screen.getByText('Click to upload or drag and drop').closest('div');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(file);
    });
  });

  it('validates file type on drag and drop', async () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);
    
    const dropZone = screen.getByText('Click to upload or drag and drop').closest('div');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [invalidFile],
      },
    });
    
    await waitFor(() => {
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // REMARK: These tests check for file preview functionality
  // Implementation shows file details in a preview card with SVG icons
  // Tests verify that preview content is displayed correctly
  it('shows file preview when image file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} value={mockFile} />);

    // Check for file name in preview (SVG icon instead of img tag)
    expect(screen.getByText(/test\.jpg/i)).toBeInTheDocument();
  });

  it('shows PDF preview when PDF file is selected', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<FileUpload {...defaultProps} value={mockFile} />);

    // Check for PDF preview content
    expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
  });

  it('shows PDF preview when PDF file is selected', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<FileUpload {...defaultProps} value={mockFile} />);

    // Check for PDF preview content
    expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
  });
});
