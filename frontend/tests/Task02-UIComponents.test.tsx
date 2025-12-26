import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/forms/Input';
import { Select } from '../src/components/forms/Select';
import { Checkbox } from '../src/components/forms/Checkbox';

describe('Task 2 - Reusable Base UI Components Library', () => {
  afterEach(cleanup);

  describe('Button Component', () => {
    it('renders primary button variant', () => {
      render(<Button variant="primary">Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders secondary button variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/bg-white/);
    });

    it('renders ghost button variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/hover:bg-gray-100/);
    });

    it('renders destructive button variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/bg-red-500/);
    });

    it('renders different sizes', () => {
      render(
        <div>
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      );
      
      const xsButton = screen.getByText('Extra Small');
      const mdButton = screen.getByText('Medium');
      expect(xsButton).toHaveClass(/px-2/);
      expect(mdButton).toHaveClass(/px-4/);
    });

    it('handles loading state', () => {
      render(<Button loading={true}>Loading...</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
      render(<Button disabled={true}>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass(/opacity-50/);
    });

    it('renders icon-only button', () => {
      render(<Button iconOnly={true} icon={<span data-testid="test-icon">X</span>} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders left and right icons', () => {
      render(
        <Button leftIcon="←" rightIcon="→">
          Back & Next
        </Button>
      );
      expect(screen.getByText('←')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports fullWidth prop', () => {
      render(<Button fullWidth={true}>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/w-full/);
    });
  });

  describe('Input Component', () => {
    it('renders text input with label', () => {
      render(<Input label="Name" />);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('renders input with error state', () => {
      render(<Input label="Email" error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('renders input with helper text', () => {
      render(<Input label="Password" helperText="Min 8 characters" />);
      expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
    });

    it('handles required field indicator', () => {
      render(<Input label="Phone" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders different input types', () => {
      render(
        <div>
          <Input type="email" label="Email" />
          <Input type="password" label="Password" />
          <Input type="tel" label="Phone" />
        </div>
      );
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const phoneInput = screen.getByLabelText('Phone');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    it('renders input with left and right icons', () => {
      render(
        <Input 
          leftIcon={<span data-testid="left">L</span>}
          rightIcon={<span data-testid="right">R</span>}
          label="With icons"
        />
      );
      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
    });

    it('handles disabled and read-only states', () => {
      render(<Input label="Test" disabled />);
      const input = screen.getByLabelText('Test');
      expect(input).toBeDisabled();
    });

    it('handles onChange event', () => {
      const handleChange = vi.fn();
      render(<Input label="Name" onChange={handleChange} />);
      
      const input = screen.getByLabelText('Name');
      fireEvent.change(input, { target: { value: 'John Doe' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('supports maxLength and minLength constraints', () => {
      render(<Input label="Zip Code" maxLength={6} minLength={6} />);
      const input = screen.getByLabelText('Zip Code');
      expect(input).toHaveAttribute('maxLength', '6');
      expect(input).toHaveAttribute('minLength', '6');
    });

    it('has proper ARIA attributes', () => {
      render(<Input label="Email" required error="Invalid email" />);
      const input = screen.getByLabelText('Email');
      
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Invalid email')).toHaveAttribute('role', 'alert');
    });
  });

  describe('Select Component', () => {
    const mockOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('renders select with label and options', () => {
      render(<Select label="Select an option" options={mockOptions} />);
      expect(screen.getByLabelText('Select an option')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('renders select with error state', () => {
      render(<Select label="Select" options={mockOptions} error="Required" />);
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('renders select with helper text', () => {
      render(<Select label="Select" options={mockOptions} helperText="Choose carefully" />);
      expect(screen.getByText('Choose carefully')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
      render(<Select label="Select" options={mockOptions} disabled />);
      const select = screen.getByLabelText('Select');
      expect(select).toBeDisabled();
    });

    it('supports multiple select', () => {
      render(<Select label="Select" options={mockOptions} multiple />);
      const select = screen.getByLabelText('Select');
      expect(select).toHaveAttribute('multiple');
    });

    it('has proper ARIA attributes', () => {
      render(<Select label="Select" required />);
      const select = screen.getByLabelText('Select');
      expect(select).toHaveAttribute('required');
    });
  });

  describe('Checkbox Component', () => {
    it('renders checkbox with label', () => {
      render(<Checkbox label="I agree to terms" />);
      expect(screen.getByLabelText('I agree to terms')).toBeInTheDocument();
    });

    it('handles checked and unchecked states', () => {
      const { rerender } = render(<Checkbox label="Test" />);
      expect(screen.getByLabelText('Test')).not.toBeChecked();
      
      rerender(<Checkbox label="Test" checked />);
      expect(screen.getByLabelText('Test')).toBeChecked();
    });

    it('handles disabled state', () => {
      render(<Checkbox label="Test" disabled />);
      const checkbox = screen.getByLabelText('Test');
      expect(checkbox).toBeDisabled();
    });

    it('handles onChange event', () => {
      const handleChange = vi.fn();
      render(<Checkbox label="Test" onChange={handleChange} />);
      
      fireEvent.click(screen.getByLabelText('Test'));
      expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it('has proper ARIA attributes', () => {
      render(<Checkbox label="Test" required />);
      const checkbox = screen.getByLabelText('Test');
      expect(checkbox).toHaveAttribute('required');
    });
  });

  describe('Component Composition', () => {
    it('Button and Input work together', () => {
      render(
        <div>
          <Input label="Username" />
          <Button variant="primary">Submit</Button>
        </div>
      );
      
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('multiple form controls maintain consistent styling', () => {
      render(
        <div>
          <Input label="First Name" />
          <Input label="Last Name" />
          <Select label="Gender" options={[{value: 'm', label: 'Male'}, {value: 'f', label: 'Female'}]} />
          <Checkbox label="I agree" />
          <Button variant="primary">Continue</Button>
        </div>
      );
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
  });
});
