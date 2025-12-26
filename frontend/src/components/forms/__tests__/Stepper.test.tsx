import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Stepper } from '../Stepper';

describe('Stepper Component', () => {
  const defaultProps = {
    steps: [
      { id: '1', title: 'Personal Details', status: 'completed' as const },
      { id: '2', title: 'Academic Info', status: 'in-progress' as const },
      { id: '3', title: 'Hostel Preferences', status: 'pending' as const },
      { id: '4', title: 'Documents', status: 'pending' as const },
    ],
    currentStep: 1,
  };

  it('renders all steps', () => {
    render(<Stepper {...defaultProps} />);
    
    expect(screen.getByText('Personal Details')).toBeInTheDocument();
    expect(screen.getByText('Academic Info')).toBeInTheDocument();
    expect(screen.getByText('Hostel Preferences')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('shows correct status indicators for each step', () => {
    render(<Stepper {...defaultProps} />);

    // Step 1 is completed - should show checkmark
    const step1Circle = screen.getByText('1').closest('div');
    expect(step1Circle).toHaveClass('bg-green-500', 'border-green-500');

    // Step 2 is in-progress - should show active state
    const step2Circle = screen.getByText('2').closest('div');
    expect(step2Circle).toHaveClass('bg-gold-500', 'border-gold-500');

    // Step 3 & 4 are pending - should show default gray
    const step3Circle = screen.getByText('3').closest('div');
    expect(step3Circle).toHaveClass('bg-white', 'border-gray-300');
  });

  it('renders horizontal orientation by default', () => {
    render(<Stepper {...defaultProps} />);
    
    // Check that steps are rendered horizontally
    const container = screen.getByRole('list');
    expect(container).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('renders vertical orientation when specified', () => {
    render(<Stepper {...defaultProps} orientation="vertical" />);
    
    // Check that steps are rendered vertically
    const container = screen.getByRole('list');
    expect(container).toHaveClass('space-y-4');
  });

  it('calls onStepClick when clicking a completed step', () => {
    const handleClick = vi.fn();
    render(<Stepper {...defaultProps} onStepClick={handleClick} />);

    fireEvent.click(screen.getByText('Personal Details'));
    
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('calls onStepClick when clicking an earlier step', () => {
    const handleClick = vi.fn();
    render(<Stepper {...defaultProps} currentStep={2} onStepClick={handleClick} />);

    fireEvent.click(screen.getByText('Personal Details'));
    
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('does not call onStepClick when clicking a future step', () => {
    const handleClick = vi.fn();
    render(<Stepper {...defaultProps} currentStep={1} onStepClick={handleClick} />);

    fireEvent.click(screen.getByText('Documents'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows error status when step has error status', () => {
    const errorProps = {
      ...defaultProps,
      steps: [
        { id: '1', title: 'Step 1', status: 'error' as const },
        { id: '2', title: 'Step 2', status: 'pending' as const },
      ],
    };
    
    render(<Stepper {...errorProps} />);
    
    const step1Circle = screen.getByText('1').closest('div');
    expect(step1Circle).toHaveClass('bg-red-500', 'border-red-500');
  });

  it('renders step description when provided', () => {
    const propsWithDesc = {
      ...defaultProps,
      steps: [
        { id: '1', title: 'Step 1', description: 'Enter your details', status: 'completed' as const },
        { id: '2', title: 'Step 2', description: 'Academic info', status: 'pending' as const },
      ],
    };
    
    render(<Stepper {...propsWithDesc} />);
    
    expect(screen.getByText('Enter your details')).toBeInTheDocument();
    expect(screen.getByText('Academic info')).toBeInTheDocument();
  });
});
