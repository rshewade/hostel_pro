'use client';

import { cn } from '../utils';

export interface JourneyStage {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'LOCKED';
  date?: Date;
}

export interface JourneyTrackerProps {
  stages: JourneyStage[];
  currentStageIndex: number;
  variant?: 'timeline' | 'progress';
  className?: string;
}

export const JourneyTracker = ({ stages, currentStageIndex, variant = 'timeline', className }: JourneyTrackerProps) => {
  const getStageStyles = (index: number, status: JourneyStage['status']) => {
    const isCompleted = status === 'COMPLETED';
    const isCurrent = status === 'CURRENT';
    const isUpcoming = status === 'UPCOMING' || status === 'LOCKED';

    const baseClasses = cn(
      'flex flex-col items-center',
      'transition-all duration-300'
    );

    const lineClasses = cn(
      'absolute top-8 left-1/2 transform -translate-x-1/2',
      'transition-all duration-300'
    );

    if (variant === 'timeline') {
      return {
        circle: cn(
          'w-16 h-16 rounded-full flex items-center justify-center border-4',
          {
            'border-state-success-border bg-state-success-bg text-state-success-text': isCompleted,
            'border-state-warning-border bg-state-warning-bg text-state-warning-text': isCurrent,
            'border-gray-300 bg-gray-100 text-gray-400': isUpcoming,
            'border-state-error-border bg-state-error-bg text-state-error-text': status === 'LOCKED',
          }
        ),
        line: cn(
          lineClasses,
          'w-1 h-8',
          index < stages.length - 1 && {
            'bg-state-success-border': isCompleted && index < currentStageIndex,
            'bg-gray-300': isUpcoming || index > currentStageIndex,
          }
        ),
      };
    } else {
      return {
        segment: cn(
          'flex-1 h-3 rounded-full',
          'transition-all duration-300',
          {
            'bg-state-success-bg': isCompleted,
            'bg-state-warning-bg': isCurrent,
            'bg-gray-300': isUpcoming,
            'bg-state-error-bg': status === 'LOCKED',
          }
        ),
      };
    }
  };

  const getStageIcon = (stage: JourneyStage) => {
    if (stage.icon) {
      return <span className="text-2xl">{stage.icon}</span>;
    }

    const icons: Record<string, string> = {
      'COMPLETED': '✓',
      'CURRENT': '●',
      'UPCOMING': '○',
      'LOCKED': '🔒',
    };

    return <span className="text-xl">{icons[stage.status]}</span>;
  };

  if (variant === 'progress') {
    return (
      <div className={cn('w-full px-4 py-6', className)}>
        <div className="flex items-center justify-between mb-4">
          {stages.map((stage, index) => {
            const styles = getStageStyles(index, stage.status);
            return (
              <div key={stage.id} className="flex-1">
                <div className={cn('text-center', className)}>
                  <div className={styles.segment} />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {stage.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          {stages.map((stage, index) => {
            const isCurrent = index === currentStageIndex;
            return (
              <div key={stage.id} className="flex-1 text-center">
                {isCurrent && stage.description && (
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {stage.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('px-4 py-6', className)}>
      <h3 className="text-heading-3 mb-6" style={{ color: 'var(--text-primary)' }}>
        Your Journey
      </h3>
      <div className="space-y-0">
        {stages.map((stage, index) => {
          const styles = getStageStyles(index, stage.status);
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage.id} className="relative pl-8">
              <div className={cn('flex items-start gap-6 pb-8', index === stages.length - 1 && 'pb-0')}>
                <div className="relative">
                  <div className={styles.circle}>
                    {getStageIcon(stage)}
                  </div>
                  {index < stages.length - 1 && <div className={styles.line} />}
                </div>
              </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4
                      className={cn(
                        'text-lg font-semibold',
                        isCurrent ? 'text-heading-3' : 'text-body',
                        isCurrent && 'text-gold-800'
                      )}
                      style={{ color: isCurrent ? 'var(--color-gold-800)' : 'var(--text-primary)' }}
                    >
                      {stage.label}
                    </h4>
                    {stage.date && (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(stage.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      {stage.description}
                    </p>
                  )}
                  {isCurrent && (
                    <p className="text-sm font-medium mt-2" style={{ color: 'var(--color-gold-800)' }}>
                      This is your current status
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
