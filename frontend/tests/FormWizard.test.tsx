import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormWizard } from '@/components/forms/FormWizard';

const mockSteps = [
  {
    id: 'step1',
    title: 'Step 1',
    component: ({ data, onChange, errors, isValid, setIsValid }: any) => (
      <div>
        <input
          data-testid="step1-input"
          value={data.step1Value || ''}
          onChange={(e) => onChange('step1Value', e.target.value)}
        />
        {errors.step1Value && <div data-testid="step1-error">{errors.step1Value}</div>}
        <button data-testid="step1-next" onClick={() => setIsValid(true)}>
          Next
        </button>
      </div>
    ),
    validate: (data: any) => {
      if (!data.step1Value) {
        return { step1Value: 'This field is required' };
      }
      return null;
    },
  },
  {
    id: 'step2',
    title: 'Step 2',
    component: ({ data, onChange, errors }: any) => (
      <div>
        <input
          data-testid="step2-input"
          value={data.step2Value || ''}
          onChange={(e) => onChange('step2Value', e.target.value)}
        />
        {errors.step2Value && <div data-testid="step2-error">{errors.step2Value}</div>}
        <button data-testid="step2-next" onClick={() => {}}>
          Submit
        </button>
      </div>
    ),
    validate: () => null,
  },
];

describe('FormWizard Component', () => {
  const defaultProps = {
    steps: mockSteps,
    initialData: { step1Value: '' },
  };

  it('renders stepper component', () => {
    render(<FormWizard {...defaultProps} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('renders current step component', () => {
    render(<FormWizard {...defaultProps} />);
    
    expect(screen.getByTestId('step1-input')).toBeInTheDocument();
    expect(screen.getByTestId('step1-next')).toBeInTheDocument();
  });

  it('renders Back button on steps after first step', () => {
    render(<FormWizard {...defaultProps} currentStep={1} />);
    
    const backButton = screen.getByText('Back');
    expect(backButton).toBeInTheDocument();
    });

  it('does not render Back button on first step', () => {
    render(<FormWizard {...defaultProps} currentStep={0} />);
    
    const backButton = screen.queryByText('Back');
    expect(backButton).not.toBeInTheDocument();
  });

  it('calls step validation before navigating to next', () => {
    render(<FormWizard {...defaultProps} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should show error since step1Value is empty
    expect(screen.getByTestId('step1-error')).toBeInTheDocument();
  });

  it('allows navigation to next step after validation passes', async () => {
    const props = {
      ...defaultProps,
      initialData: { step1Value: 'Valid value' },
    };

    render(<FormWizard {...props} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.queryByTestId('step1-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('step2-input')).toBeInTheDocument();
    });
  });

  it('renders Save as Draft button when onSaveDraft is provided', () => {
    const handleSaveDraft = vi.fn();
    render(<FormWizard {...defaultProps} onSaveDraft={handleSaveDraft} />);

    const saveDraftButton = screen.getByText('Save as Draft');
    expect(saveDraftButton).toBeInTheDocument();

    fireEvent.click(saveDraftButton);
    expect(handleSaveDraft).toHaveBeenCalled();
  });

  it('does not render Save as Draft when onSaveDraft is not provided', () => {
    render(<FormWizard {...defaultProps} />);

    const saveDraftButton = screen.queryByText('Save as Draft');
    expect(saveDraftButton).not.toBeInTheDocument();
  });

  it('shows last saved time when draft is saved', async () => {
    const handleSaveDraft = vi.fn().mockResolvedValue(undefined);
    
    render(<FormWizard {...defaultProps} onSaveDraft={handleSaveDraft} />);

    const saveDraftButton = screen.getByText('Save as Draft');
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText(/Saved as draft at/)).toBeInTheDocument();
    });
  });

  it('renders Submit button on last step', () => {
    render(<FormWizard {...defaultProps} currentStep={1} />);

    const submitButton = screen.getByText('Submit Application');
    expect(submitButton).toBeInTheDocument();

    const nextButton = screen.queryByText('Next');
    expect(nextButton).not.toBeInTheDocument();
  });

  it('calls onSubmit when Submit button is clicked', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    
    render(<FormWizard {...defaultProps} currentStep={1} onSubmit={handleSubmit} />);

    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  it('disables Next button when step is invalid', () => {
    render(<FormWizard {...defaultProps} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button when step is valid', () => {
    const props = {
      ...defaultProps,
      initialData: { step1Value: 'Valid value' },
    };

    render(<FormWizard {...props} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('loads initial data correctly', () => {
    const props = {
      ...defaultProps,
      initialData: { step1Value: 'Initial value', step2Value: 'Initial 2' },
    };

    render(<FormWizard {...props} />);

    const step1Input = screen.getByTestId('step1-input') as HTMLInputElement;
    const step2Input = screen.getByTestId('step2-input') as HTMLInputElement;

    expect(step1Input.value).toBe('Initial value');
    expect(step2Input.value).toBe('Initial 2');
  });

  it('handles step click from stepper', () => {
    render(<FormWizard {...defaultProps} currentStep={1} />);

    const step1 = screen.getByText('Step 1');
    fireEvent.click(step1);

    const step1Input = screen.queryByTestId('step1-input');
    expect(step1Input).toBeInTheDocument();
  });

  it('shows loading state in Save as Draft button when saving', () => {
    const handleSaveDraft = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    
    render(<FormWizard {...defaultProps} onSaveDraft={handleSaveDraft} />);

    const saveDraftButton = screen.getByText('Save as Draft');
    fireEvent.click(saveDraftButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows loading state in Submit button when submitting', () => {
    const handleSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    
    render(<FormWizard {...defaultProps} currentStep={1} onSubmit={handleSubmit} />);

    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('disables navigation while submitting', async () => {
    const handleSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<FormWizard {...defaultProps} currentStep={1} onSubmit={handleSubmit} />);

    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });
  });

  it('handles save draft errors gracefully', async () => {
    const handleSaveDraft = vi.fn().mockRejectedValue(new Error('Save failed'));
    
    render(<FormWizard {...defaultProps} onSaveDraft={handleSaveDraft} />);

    const saveDraftButton = screen.getByText('Save as Draft');
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(handleSaveDraft).toHaveBeenCalled();
      // Error should be handled (alert shown)
    });
  });

  it('handles submit errors gracefully', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'));
    
    render(<FormWizard {...defaultProps} currentStep={1} onSubmit={handleSubmit} />);

    const submitButton = screen.getByText('Submit Application');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      // Error should be handled (alert shown)
    });
  });
});
