import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../FileUpload';

describe('FileUpload Component', () => {
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
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
  });

  it('shows drag and drop UI when no file selected', () => {
    render(<FileUpload {...defaultProps} />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText(/JPG, JPEG or PDF.*5MB/)).toBeInTheDocument();
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
    const uploadZone = screen.getByText('Click to upload or drag and drop').closest('div');
    expect(uploadZone).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls onChange when file is selected via input', async () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Test File/).querySelector('input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(file);
    });
  });

  it('rejects files larger than max size', async () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);

    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Test File/).querySelector('input');
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  it('rejects invalid file types', async () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Test File/).querySelector('input');
    
    fireEvent.change(input, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  it('shows file preview when image file is selected', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} value={mockFile} />);

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });

  it('shows PDF preview when PDF file is selected', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<FileUpload {...defaultProps} value={mockFile} />);

    expect(screen.getByText('PDF Document')).toBeInTheDocument();
  });

  it('allows removing file', () => {
    const handleChange = vi.fn();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} value={mockFile} onChange={handleChange} />);

    const removeButton = screen.getByLabelText('Remove file');
    fireEvent.click(removeButton);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('handles drag and drop events', () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);

    const dropZone = screen.getByText('Click to upload or drag and drop').closest('div');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it('validates file type on drag and drop', () => {
    const handleChange = vi.fn();
    render(<FileUpload {...defaultProps} onChange={handleChange} />);

    const dropZone = screen.getByText('Click to upload or drag and drop').closest('div');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [invalidFile],
      },
    });

    expect(handleChange).not.toHaveBeenCalled();
  });
});
