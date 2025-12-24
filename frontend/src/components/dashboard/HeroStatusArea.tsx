'use client';

import { cn } from '../utils';

export interface StatusBadge {
  text: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

export interface HeroStatusAreaProps {
  title: string;
  message: string;
  badge: StatusBadge;
  helperText?: string;
  variant?: 'default' | 'warning' | 'info';
  className?: string;
}

export const HeroStatusArea = ({
  title,
  message,
  badge,
  helperText,
  variant = 'default',
  className
}: HeroStatusAreaProps) => {
  const getContainerClasses = () => {
    const baseClasses = cn(
      'mb-8 p-8 rounded-lg',
      'transition-all duration-300'
    );

    switch (variant) {
      case 'warning':
        return cn(baseClasses, 'bg-state-warning-bg border-2 border-state-warning-border');
      case 'info':
        return cn(baseClasses, 'bg-state-info-bg border-2 border-state-info-border');
      default:
        return cn(baseClasses, 'bg-white border-gray-200');
    }
  };

  const getBadgeClasses = () => {
    const baseClasses = cn(
      'px-4 py-2 rounded-lg text-sm font-semibold',
      'inline-block'
    );

    switch (badge.variant) {
      case 'success':
        return cn(baseClasses, 'bg-state-success-bg text-state-success-text');
      case 'warning':
        return cn(baseClasses, 'bg-state-warning-bg text-state-warning-text');
      case 'error':
        return cn(baseClasses, 'bg-state-error-bg text-state-error-text');
      case 'info':
        return cn(baseClasses, 'bg-state-info-bg text-state-info-text');
      default:
        return cn(baseClasses, 'bg-state-error-bg text-state-error-text');
    }
  };

  const getBadgeClasses = () => {
    const baseClasses = cn(
      'px-4 py-2 rounded-lg text-sm font-semibold',
      'inline-block'
    );

    switch (badge.variant) {
      case 'success':
        return cn(baseClasses, 'bg-green-600 text-white');
      case 'warning':
        return cn(baseClasses, 'bg-yellow-600 text-white');
      case 'error':
        return cn(baseClasses, 'bg-red-600 text-white');
      case 'info':
        return cn(baseClasses, 'bg-sky-600 text-white');
      default:
        return cn(baseClasses, 'bg-gray-600 text-white');
    }
  };

  return (
    <div className={cn(getContainerClasses(), className)}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
            <span className={getBadgeClasses()}>
              {badge.text}
            </span>
          </div>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
          {helperText && (
            <p className="text-sm mt-3 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="mr-2">💡</span>
              {helperText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
