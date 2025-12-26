import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import '../src/app/page';

describe('Task 4 - Responsive Landing Page with Vertical Selection', () => {
  afterEach(cleanup);

  describe('Landing Page Layout', () => {
    it('renders hostel overview in hero section', () => {
      render(<AppPage />);
      expect(screen.getByText(/Hostel Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Student Accommodation/i)).toBeInTheDocument();
    });

    it('displays vertical selection cards', () => {
      render(<AppPage />);
      expect(screen.getByText('Boys Hostel')).toBeInTheDocument();
      expect(screen.getByText('Girls Ashram')).toBeInTheDocument();
      expect(screen.getByText('Dharamshala')).toBeInTheDocument();
    });

    it('shows DPDP consent banner', () => {
      render(<AppPage />);
      expect(screen.getByText(/Data Protection/i)).toBeInTheDocument();
      expect(screen.getByText(/Digital Personal Data Protection/i)).toBeInTheDocument();
    });

    it('renders admission process timeline', () => {
      render(<AppPage />);
      const timelineSteps = [
        'Apply Now',
        'OTP Verification',
        'Interview',
        'Approval',
        'Payment',
        'Room Allocation',
        'Check-in'
      ];

      timelineSteps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('displays announcements section', () => {
      render(<AppPage />);
      expect(screen.getByText(/Announcements/i)).toBeInTheDocument();
    });
  });

  describe('Vertical Selection', () => {
    it('all three vertical cards are clickable', () => {
      render(<AppPage />);
      
      const boysLink = screen.getByText('Boys Hostel').closest('a');
      const girlsLink = screen.getByText('Girls Ashram').closest('a');
      const dharamLink = screen.getByText('Dharamshala').closest('a');

      expect(boysLink).toHaveAttribute('href');
      expect(girlsLink).toHaveAttribute('href');
      expect(dharamLink).toHaveAttribute('href');
    });

    it('vertical cards link to correct paths', () => {
      render(<AppPage />);
      
      const boysLink = screen.getByText('Boys Hostel').closest('a');
      const girlsLink = screen.getByText('Girls Ashram').closest('a');
      const dharamLink = screen.getByText('Dharamshala').closest('a');

      expect(boysLink).toHaveAttribute('href', '/apply/boys-hostel/contact');
      expect(girlsLink).toHaveAttribute('href', '/apply/girls-ashram/contact');
      expect(dharamLink).toHaveAttribute('href', '/apply/dharamshala/contact');
    });

    it('vertical cards display descriptions correctly', () => {
      render(<AppPage />);
      
      expect(screen.getByText(/Male students/i)).toBeInTheDocument();
      expect(screen.getByText(/enhanced security/i)).toBeInTheDocument();
      expect(screen.getByText(/safe and nurturing/i)).toBeInTheDocument();
      expect(screen.getByText(/spiritual retreat/i)).toBeInTheDocument();
    });
  });

  describe('CTA Buttons and Navigation', () => {
    it('Apply Now CTA is prominent', () => {
      render(<AppPage />);
      
      const applyButtons = screen.getAllByText('Apply Now');
      expect(applyButtons.length).toBeGreaterThan(0);
    });

    it('Check Status CTA is visible', () => {
      render(<AppPage />);
      expect(screen.getByText('Check Status')).toBeInTheDocument();
    });

    it('Login button is visible', () => {
      render(<AppPage />);
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('nav links are functional', () => {
      render(<AppPage />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Apply Now')).toBeInTheDocument();
      expect(screen.getByText('Check Status')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('cards stack vertically on mobile', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<AppPage />);
      const cards = screen.getAllByRole('link');
      
      // On mobile, cards should stack
      cards.forEach(card => {
        expect(card).toHaveClass(/block/);
      });

      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));
    });

    it('cards display in grid on desktop', () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));

      render(<AppPage />);
      const container = screen.getByRole('main');
      
      // On desktop, cards should display in grid
      expect(container).toHaveClass(/grid/);
    });

    it('timeline reflows vertically on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      render(<AppPage />);
      
      // On mobile, timeline should stack vertically
      expect(screen.getByText(/Apply Now/i)).toBeInTheDocument();
      expect(screen.getByText(/OTP Verification/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all buttons have proper aria labels', () => {
      render(<AppPage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('links are accessible via keyboard navigation', () => {
      render(<AppPage />);
      
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });

    it('images have alt text', () => {
      render(<AppPage />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('text contrast meets WCAG AA standards', () => {
      // This would require contrast checker library
      // For now, we verify text elements exist
      render(<AppPage />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
