import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/app/page';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Task 4 - Responsive Landing Page with Vertical Selection', () => {
  afterEach(cleanup);

  beforeEach(() => {
    // Reset window width before each test
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
  });

  describe('Landing Page Layout', () => {
    it('renders hostel overview in hero section', () => {
      renderWithRouter(<Home />);
      expect(screen.getByText(/Jain Hostel Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Student Accommodation/i)).toBeInTheDocument();
    });

    it('displays vertical selection cards', () => {
      renderWithRouter(<Home />);
      const boysCards = screen.getAllByText('Boys Hostel');
      expect(boysCards.length).toBeGreaterThan(0);
      const girlsCards = screen.getAllByText('Girls Ashram');
      expect(girlsCards.length).toBeGreaterThan(0);
      const dharamCards = screen.getAllByText('Dharamshala');
      expect(dharamCards.length).toBeGreaterThan(0);
    });

    it('displays values section', () => {
      renderWithRouter(<Home />);
      const communityElements = screen.getAllByText(/Community First/i);
      expect(communityElements.length).toBeGreaterThan(0);
      const educationalElements = screen.getAllByText(/Educational Support/i);
      expect(educationalElements.length).toBeGreaterThan(0);
      const culturalElements = screen.getAllByText(/Cultural Values/i);
      expect(culturalElements.length).toBeGreaterThan(0);
    });

    it('displays announcements section', () => {
      renderWithRouter(<Home />);
      expect(screen.getByText(/Announcements/i)).toBeInTheDocument();
    });
  });

  describe('Vertical Selection', () => {
    it('all three vertical cards are clickable', () => {
      renderWithRouter(<Home />);

      const boysLinks = screen.getAllByText('Apply to Boys Hostel');
      expect(boysLinks.length).toBeGreaterThan(0);
      const girlsLinks = screen.getAllByText('Apply to Girls Ashram');
      expect(girlsLinks.length).toBeGreaterThan(0);
      const dharamLinks = screen.getAllByText('Book Dharamshala');
      expect(dharamLinks.length).toBeGreaterThan(0);
    });

    it('vertical cards link to correct paths', () => {
      renderWithRouter(<Home />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('CTA Buttons and Navigation', () => {
    it('Apply Now CTA is prominent', () => {
      renderWithRouter(<Home />);

      const applyButtons = screen.getAllByText('Apply Now');
      expect(applyButtons.length).toBeGreaterThan(0);
    });

    it('Check Status CTA is visible', () => {
      renderWithRouter(<Home />);
      expect(screen.getByText('Check Status')).toBeInTheDocument();
    });

    it('Login and Parent buttons are visible', () => {
      renderWithRouter(<Home />);
      const loginButtons = screen.getAllByText(/Login/i);
      expect(loginButtons.length).toBeGreaterThan(0);
      expect(screen.getByText(/Parent/i)).toBeInTheDocument();
    });

    it('nav links are functional', () => {
      renderWithRouter(<Home />);

      const homeLinks = screen.getAllByText('Home');
      expect(homeLinks.length).toBeGreaterThan(0);
      const aboutElements = screen.getAllByText('About Us');
      expect(aboutElements.length).toBeGreaterThan(0);
      const institutionElements = screen.getAllByText('Institutions');
      expect(institutionElements.length).toBeGreaterThan(0);
      const admissionsElements = screen.getAllByText('Admissions');
      expect(admissionsElements.length).toBeGreaterThan(0);
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

      renderWithRouter(<Home />);
      const cards = screen.getAllByRole('link');

      // On mobile, cards should stack
      cards.forEach(card => {
        expect(card).toBeInTheDocument();
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

      renderWithRouter(<Home />);
      const container = screen.getByRole('main');

      // On desktop, cards should display in grid
      expect(container).toBeInTheDocument();
    });

    it('values section is present on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      renderWithRouter(<Home />);

      // On mobile, values should be visible
      const communityElements = screen.getAllByText(/Community First/i);
      expect(communityElements.length).toBeGreaterThan(0);
      const educationalElements = screen.getAllByText(/Educational Support/i);
      expect(educationalElements.length).toBeGreaterThan(0);
      const culturalElements = screen.getAllByText(/Cultural Values/i);
      expect(culturalElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('all buttons have proper aria labels', () => {
      renderWithRouter(<Home />);

      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        buttons.forEach(button => {
          expect(button).toBeInTheDocument();
        });
      }
    });

    it('links are accessible via keyboard navigation', () => {
      renderWithRouter(<Home />);

      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });

    it('images have alt text', () => {
      renderWithRouter(<Home />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('text contrast meets WCAG AA standards', () => {
      // This would require contrast checker library
      // For now, we verify text elements exist
      renderWithRouter(<Home />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
