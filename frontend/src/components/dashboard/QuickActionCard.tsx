'use client';

import Link from 'next/link';
import { cn } from '../utils';

export interface ActionBadge {
  text: string;
  variant: 'default' | 'warning' | 'error' | 'success' | 'info';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  enabled: boolean;
  visibility: 'ALWAYS' | 'RENEWAL_WINDOW' | 'EXIT_ALLOWED' | 'PENDING_ITEMS';
  badge?: ActionBadge;
}

export interface QuickActionCardProps {
  action: QuickAction;
  className?: string;
}

export const QuickActionCard = ({ action, className }: QuickActionCardProps) => {
  if (!action.enabled) {
    return null;
  }

  const getBadgeClasses = () => {
    const baseClasses = cn(
      'px-2 py-1 rounded text-xs font-medium',
      'transition-colors duration-200'
    );

    switch (action.badge?.variant) {
      case 'warning':
        return cn(baseClasses, 'bg-state-warning-bg text-state-warning-text border-state-warning-border');
      case 'error':
        return cn(baseClasses, 'bg-state-error-bg text-state-error-text border-state-error-border');
      case 'success':
        return cn(baseClasses, 'bg-state-success-bg text-state-success-text border-state-success-border');
      case 'info':
        return cn(baseClasses, 'bg-state-info-bg text-state-info-text border-state-info-border');
      default:
        return cn(baseClasses, 'bg-gray-100 text-gray-800 border-gray-200');
    }
  };

  const getCardStyles = () => {
    const baseClasses = cn(
      'card p-6 text-center transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-1',
      action.enabled && 'cursor-pointer',
      !action.enabled && 'opacity-50 cursor-not-allowed'
    );

    return baseClasses;
  };

  const handleClick = () => {
    if (action.enabled) {
      window.location.href = action.link;
    }
  };

  return (
    <Link
      href={action.link}
      onClick={handleClick}
      className={cn(getCardStyles(), className)}
      aria-disabled={!action.enabled}
    >
      <div className="text-4xl mb-3">{action.icon}</div>
      <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
        {action.title}
      </h3>
      <p className="text-body-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {action.description}
      </p>
      {action.badge && (
        <div className="inline-flex items-center justify-center">
          <span className={getBadgeClasses()}>
            {action.badge.text}
          </span>
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!action.enabled}
        aria-label={action.title}
      >
        {action.enabled ? (
          <>
            {action.id === 'renew' ? 'Renew Now' : action.title}
          </>
        ) : (
          'Not Available'
        )}
      </button>
    </Link>
  );
};

export interface QuickActionsGridProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActionsGrid = ({ actions, className }: QuickActionsGridProps) => {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      {actions.map((action) => (
        <QuickActionCard
          key={action.id}
          action={action}
        />
      ))}
    </div>
  );
};
