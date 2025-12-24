'use client';

import { cn } from '../utils';

export interface StatusBadgeProps {
  text: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

export const StatusBadge = ({
  text,
  variant = 'default',
  size = 'md',
  rounded = false,
  className
}: StatusBadgeProps) => {
  const getBadgeClasses = () => {
    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'font-medium',
      'transition-all duration-200',
      rounded ? 'rounded-full' : 'rounded-md'
    );

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    switch (variant) {
      case 'success':
        return cn(baseClasses, sizeClasses[size], 'bg-state-success-bg text-state-success-text border-state-success-border');
      case 'warning':
        return cn(baseClasses, sizeClasses[size], 'bg-state-warning-bg text-state-warning-text border-state-warning-border');
      case 'error':
        return cn(baseClasses, sizeClasses[size], 'bg-state-error-bg text-state-error-text border-state-error-border');
      case 'info':
        return cn(baseClasses, sizeClasses[size], 'bg-state-info-bg text-state-info-text border-state-info-border');
      default:
        return cn(baseClasses, sizeClasses[size], 'bg-gray-100 text-gray-800 border-gray-200');
    }
  };

    switch (variant) {
      case 'success':
        return cn(baseClasses, sizeClasses[size], 'bg-green-100 text-green-800 border border-green-200');
      case 'warning':
        return cn(baseClasses, sizeClasses[size], 'bg-yellow-100 text-yellow-800 border border-yellow-200');
      case 'error':
        return cn(baseClasses, sizeClasses[size], 'bg-red-100 text-red-800 border border-red-200');
      case 'info':
        return cn(baseClasses, sizeClasses[size], 'bg-sky-100 text-sky-800 border border-sky-200');
      default:
        return cn(baseClasses, sizeClasses[size], 'bg-gray-100 text-gray-800 border border-gray-200');
    }
  };

  return (
    <span className={cn(getBadgeClasses(), className)}>
      {text}
    </span>
  );
};
