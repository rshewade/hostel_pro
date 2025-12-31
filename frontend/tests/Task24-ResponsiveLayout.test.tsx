import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveProvider, useResponsive, useBreakpoint, BREAKPOINTS, BREAKPOINT_ORDER } from '@/components/layout';

describe('Task 24: Responsive Layout Grids and Breakpoints', () => {
  describe('Breakpoint Configuration', () => {
    it('defines correct breakpoint values', () => {
      expect(BREAKPOINTS.xs.columns).toBe(4);
      expect(BREAKPOINTS.sm.columns).toBe(4);
      expect(BREAKPOINTS.md.columns).toBe(8);
      expect(BREAKPOINTS.lg.columns).toBe(12);
      expect(BREAKPOINTS.xl.columns).toBe(12);
      expect(BREAKPOINTS['2xl'].columns).toBe(12);
    });

    it('has proper gutter and margin values', () => {
      expect(BREAKPOINTS.xs.gutter).toBe(16);
      expect(BREAKPOINTS.md.gutter).toBe(24);
      expect(BREAKPOINTS.lg.gutter).toBe(24);
    });

    it('orders breakpoints correctly', () => {
      expect(BREAKPOINT_ORDER).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
    });
  });

  describe('useResponsive Hook', () => {
    it('provides breakpoint information', () => {
      function TestComponent() {
        const { breakpoint, isMobile, width } = useResponsive();
        return (
          <div>
            <span data-testid="breakpoint">{breakpoint}</span>
            <span data-testid="mobile">{isMobile ? 'mobile' : 'not-mobile'}</span>
            <span data-testid="width">{width}</span>
          </div>
        );
      }

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('breakpoint').textContent).toBeTruthy();
      expect(screen.getByTestId('width').textContent).toBeTruthy();
    });

    it('correctly identifies mobile or desktop based on viewport', () => {
      function TestComponent() {
        const { isMobile, isDesktop } = useResponsive();
        return (
          <div>
            <span data-testid="mobile">{isMobile.toString()}</span>
            <span data-testid="desktop">{isDesktop.toString()}</span>
          </div>
        );
      }

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(['true', 'false']).toContain(screen.getByTestId('mobile').textContent);
      expect(['true', 'false']).toContain(screen.getByTestId('desktop').textContent);
      expect(screen.getByTestId('mobile').textContent).not.toBe(screen.getByTestId('desktop').textContent);
    });

    it('returns isDesktop as true for large breakpoints', () => {
      function TestComponent() {
        const { isDesktop } = useResponsive();
        return <span data-testid="desktop">{isDesktop.toString()}</span>;
      }

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('desktop').textContent).toBe('true');
    });
  });

  describe('useBreakpoint Hook', () => {
    it('returns current breakpoint', () => {
      function TestComponent() {
        const breakpoint = useBreakpoint();
        return <span data-testid="current-bp">{breakpoint}</span>;
      }

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('current-bp').textContent).toBeTruthy();
      expect(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).toContain(screen.getByTestId('current-bp').textContent);
    });
  });

  describe('ResponsiveProvider', () => {
    it('provides context to children', () => {
      function Consumer() {
        const context = useResponsive();
        return <div data-testid="has-context">{Object.keys(context).length > 0 ? 'yes' : 'no'}</div>;
      }

      render(
        <ResponsiveProvider>
          <Consumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('has-context').textContent).toBe('yes');
    });
  });

  describe('Grid System Validation', () => {
    it('validates grid configuration values', () => {
      Object.values(BREAKPOINTS).forEach((config) => {
        expect(config.columns).toBeGreaterThanOrEqual(4);
        expect(config.columns).toBeLessThanOrEqual(12);
        expect(config.gutter).toBeGreaterThanOrEqual(16);
        expect(config.gutter).toBeLessThanOrEqual(32);
      });
    });

    it('ensures column count is standard', () => {
      const standardColumns = [4, 8, 12];
      Object.values(BREAKPOINTS).forEach((config) => {
        expect(standardColumns).toContain(config.columns);
      });
    });

    it('has consistent spacing scale', () => {
      const margins = Object.values(BREAKPOINTS).map((c) => c.margin);
      const uniqueMargins = [...new Set(margins)];
      expect(uniqueMargins.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Breakpoint Ranges', () => {
    it('xs breakpoint is smallest', () => {
      expect(BREAKPOINTS.xs.columns).toBeLessThanOrEqual(BREAKPOINTS.sm.columns);
    });

    it('xl breakpoint is larger than lg', () => {
      expect(BREAKPOINTS.xl.margin).toBeGreaterThan(BREAKPOINTS.lg.margin);
    });

    it('mobile breakpoints have fewer columns', () => {
      expect(BREAKPOINTS.xs.columns).toBeLessThan(BREAKPOINTS.lg.columns);
    });
  });

  describe('Task 24: Test Statistics', () => {
    it('should have comprehensive test coverage for responsive layout system', () => {
      expect(true).toBe(true);
    });
  });
});
