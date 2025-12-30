import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InlineHelp,
  FieldError,
  FormFieldWrapper,
} from '@/components/forms/InlineHelp';
import {
  Skeleton,
  SkeletonCard,
} from '@/components/feedback/Skeleton';
import { HelpCenter } from '@/components/feedback/HelpCenter';
import { Modal } from '@/components/feedback/Modal';

describe('InlineHelp', () => {
  it('renders content correctly', () => {
    render(<InlineHelp content="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<InlineHelp content="Help text" icon={<span data-testid="custom-icon">?</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container: medium } = render(<InlineHelp content="Medium" size="md" />);
    expect(medium.querySelector('p')).toHaveClass('text-sm');
  });

  it('has flex layout', () => {
    const { container } = render(<InlineHelp content="Help text" />);
    expect(container.querySelector('.flex')).toBeInTheDocument();
  });
});

describe('FieldError', () => {
  it('renders error message when provided', () => {
    render(<FieldError message="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('returns null when no message', () => {
    const { container } = render(<FieldError message="" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('has alert role', () => {
    render(<FieldError message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('FormFieldWrapper', () => {
  it('renders label correctly', () => {
    render(
      <FormFieldWrapper label="Email Address">
        <input type="email" />
      </FormFieldWrapper>
    );
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(
      <FormFieldWrapper label="Name" required>
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error with alert role', () => {
    render(
      <FormFieldWrapper label="Email" error="Invalid email">
        <input type="email" />
      </FormFieldWrapper>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(
      <FormFieldWrapper label="Phone" helperText="Enter your mobile number">
        <input type="tel" />
      </FormFieldWrapper>
    );
    expect(screen.getByText('Enter your mobile number')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders with status role', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders skeleton element', () => {
    const { container } = render(<Skeleton />);
    expect(container.innerHTML).toContain('bg-gray-200');
  });

  it('renders multiple elements for lines', () => {
    render(<Skeleton lines={3} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBe(3);
  });
});

describe('SkeletonCard', () => {
  it('renders with border', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.border')).toBeInTheDocument();
  });
});

describe('HelpCenter', () => {
  it('opens when button is clicked', () => {
    render(<HelpCenter />);
    const openButton = screen.getByRole('button', { name: 'Open help center' });
    fireEvent.click(openButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<HelpCenter />);
    const openButton = screen.getByRole('button', { name: 'Open help center' });
    fireEvent.click(openButton);
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<HelpCenter />);
    const openButton = screen.getByRole('button', { name: 'Open help center' });
    fireEvent.click(openButton);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('renders confirmation mode with Cancel and Confirm', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Confirm Action"
        variant="confirmation"
        onConfirm={() => {}}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders destructive mode', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Delete Item"
        variant="destructive"
        onConfirm={() => {}}
        confirmText="Delete"
      />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('Escape key closes modal', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
