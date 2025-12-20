import { forwardRef } from 'react';
import { cn } from '../utils';
import { SIZE_CLASSES, BUTTON_VARIANT_CLASSES, ANIMATIONS } from '../constants';
import type { BaseComponentProps, ButtonVariant, ButtonSize } from '../types';

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  leftIcon,
  rightIcon,
  onClick,
  children,
  ...props
}, ref) => {
  const buttonClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center font-medium rounded-md border border-transparent',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'transition-colors duration-200',

    // Size variants
    SIZE_CLASSES[size],

    // Variant styles
    BUTTON_VARIANT_CLASSES[variant],

    // Loading state
    loading && 'cursor-wait',

    // Full width
    fullWidth && 'w-full',

    // Custom classes
    className
  );

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && leftIcon && (
        <span className="mr-2 inline-flex items-center">
          {leftIcon}
        </span>
      )}

      <span className={cn(
        'inline-flex items-center',
        (leftIcon || rightIcon || loading) && 'mx-2'
      )}>
        {children}
      </span>

      {!loading && rightIcon && (
        <span className="ml-2 inline-flex items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };