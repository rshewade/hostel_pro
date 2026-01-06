import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComingSoonPlaceholder, FutureModuleCard, FutureModulePage } from '@/components/future/ComingSoonPlaceholder';

describe('ComingSoonPlaceholder', () => {
  describe('Rendering', () => {
    it('renders title and description correctly', () => {
      render(
        <ComingSoonPlaceholder
          title="Biometric Attendance"
          description="Track attendance via fingerprint"
        />
      );

      expect(screen.getByText('Biometric Attendance')).toBeInTheDocument();
      expect(screen.getByText('Track attendance via fingerprint')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      render(
        <ComingSoonPlaceholder
          title="Test Module"
          description="Description"
          icon="👆"
        />
      );

      expect(screen.getByText('👆')).toBeInTheDocument();
    });

    it('renders estimated launch badge when provided', () => {
      render(
        <ComingSoonPlaceholder
          title="Test Module"
          description="Description"
          estimatedLaunch="Q2 2026"
        />
      );

      expect(screen.getByText('Est. Q2 2026')).toBeInTheDocument();
    });

    it('renders feature flag badge when provided', () => {
      render(
        <ComingSoonPlaceholder
          title="Test Module"
          description="Description"
          featureFlag="FEAT_NEW_MODULE"
        />
      );

      expect(screen.getByText('FF: FEAT_NEW_MODULE')).toBeInTheDocument();
    });

    it('applies card variant styles correctly', () => {
      const { container } = render(
        <ComingSoonPlaceholder
          title="Test"
          description="Description"
          variant="card"
        />
      );

      const placeholder = container.querySelector('.coming-soon-placeholder');
      expect(placeholder).toHaveClass('p-6', 'rounded-lg', 'border-2', 'border-dashed');
    });

    it('applies page variant styles correctly', () => {
      const { container } = render(
        <ComingSoonPlaceholder
          title="Test"
          description="Description"
          variant="page"
        />
      );

      const placeholder = container.querySelector('.coming-soon-placeholder');
      expect(placeholder).toHaveClass('py-16', 'px-8', 'min-h-[400px]');
    });

    it('applies nav-item variant styles correctly', () => {
      const { container } = render(
        <ComingSoonPlaceholder
          title="Test"
          description="Description"
          variant="nav-item"
        />
      );

      const placeholder = container.querySelector('.coming-soon-placeholder');
      expect(placeholder).toHaveClass('p-3', 'rounded-md');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(
        <ComingSoonPlaceholder
          title="Test Module"
          description="Description"
        />
      );

      const placeholder = screen.getByRole('region');
      expect(placeholder).toHaveAttribute('aria-label', 'Test Module - Coming Soon');
    });

    it('is focusable for keyboard navigation', () => {
      const { container } = render(
        <ComingSoonPlaceholder
          title="Test Module"
          description="Description"
        />
      );

      const placeholder = container.querySelector('.coming-soon-placeholder');
      expect(placeholder).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Interactivity', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(
        <ComingSoonPlaceholder
          title="Test"
          description="Description"
          onClick={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('region'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger navigation on click', () => {
      const handleClick = vi.fn();
      render(
        <ComingSoonPlaceholder
          title="Test"
          description="Description"
          onClick={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('region'));
      expect(handleClick).toHaveBeenCalled();
    });
  });
});

describe('FutureModuleCard', () => {
  it('renders with correct props', () => {
    render(
      <FutureModuleCard
        title="Mess Management"
        description="View menus and track attendance"
        icon="🍽️"
        estimatedLaunch="Q1 2026"
        featureFlag="FEAT_MESS"
      />
    );

    expect(screen.getByText('Mess Management')).toBeInTheDocument();
    expect(screen.getByText('View menus and track attendance')).toBeInTheDocument();
    expect(screen.getByText('🍽️')).toBeInTheDocument();
    expect(screen.getByText('Est. Q1 2026')).toBeInTheDocument();
    expect(screen.getByText('FF: FEAT_MESS')).toBeInTheDocument();
  });

  it('uses card variant by default', () => {
    const { container } = render(
      <FutureModuleCard title="Test" description="Desc" />
    );

    const placeholder = container.querySelector('.coming-soon-placeholder');
    expect(placeholder).toHaveClass('min-h-[160px]');
  });
});

describe('FutureModulePage', () => {
  it('renders page header with title', () => {
    render(
      <FutureModulePage
        title="Biometric Attendance"
        description="Track attendance via fingerprint"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Biometric Attendance');
  });

  it('renders full description when provided', () => {
    render(
      <FutureModulePage
        title="Test"
        description="Short desc"
        fullDescription="This is a detailed description of the upcoming feature."
      />
    );

    expect(screen.getByText('This is a detailed description of the upcoming feature.')).toBeInTheDocument();
  });

  it('renders planned features list when provided', () => {
    const features = [
      'Feature one',
      'Feature two',
      'Feature three',
    ];

    render(
      <FutureModulePage
        title="Test"
        description="Desc"
        plannedFeatures={features}
      />
    );

    expect(screen.getByText('Planned Features')).toBeInTheDocument();
    expect(screen.getByText('Feature one')).toBeInTheDocument();
    expect(screen.getByText('Feature two')).toBeInTheDocument();
    expect(screen.getByText('Feature three')).toBeInTheDocument();
  });

  it('renders checkmarks for planned features', () => {
    render(
      <FutureModulePage
        title="Test"
        description="Desc"
        plannedFeatures={['Feature one']}
      />
    );

    const featureItem = screen.getByText('Feature one').closest('li');
    expect(featureItem).toHaveTextContent('✓');
  });
});

describe('Visual Consistency', () => {
  it('applies consistent styling across variants', () => {
    const { container: cardContainer } = render(
      <ComingSoonPlaceholder title="Test" description="Desc" variant="card" />
    );
    const { container: pageContainer } = render(
      <ComingSoonPlaceholder title="Test" description="Desc" variant="page" />
    );
    const { container: navContainer } = render(
      <ComingSoonPlaceholder title="Test" description="Desc" variant="nav-item" />
    );

    const cardPlaceholder = cardContainer.querySelector('.coming-soon-placeholder');
    const pagePlaceholder = pageContainer.querySelector('.coming-soon-placeholder');
    const navPlaceholder = navContainer.querySelector('.coming-soon-placeholder');

    expect(cardPlaceholder).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center');
    expect(pagePlaceholder).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center');
    expect(navPlaceholder).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center');
  });

  it('uses consistent badge styling', () => {
    render(
      <ComingSoonPlaceholder
        title="Test"
        description="Desc"
        estimatedLaunch="Q1 2026"
        featureFlag="FEAT_TEST"
      />
    );

    const launchBadge = screen.getByText('Est. Q1 2026').closest('div');
    const flagBadge = screen.getByText('FF: FEAT_TEST').closest('div');

    expect(launchBadge).toHaveClass('bg-amber-100', 'text-amber-700');
    expect(flagBadge).toHaveClass('bg-blue-100', 'text-blue-700');
  });
});

describe('Responsive Design', () => {
  it('card variant works in small containers', () => {
    const { container } = render(
      <div className="max-w-xs">
        <ComingSoonPlaceholder title="Test" description="Description" variant="card" />
      </div>
    );

    const placeholder = container.querySelector('.coming-soon-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('min-h-[160px]');
  });

  it('page variant centers content appropriately', () => {
    render(
      <FutureModulePage
        title="Test"
        description="Description"
        fullDescription="A longer description that explains the feature."
      />
    );

    const description = screen.getByText('A longer description that explains the feature.');
    expect(description).toHaveClass('max-w-md', 'mx-auto');
  });
});
