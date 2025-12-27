import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes } from 'react-router-dom';
import { Input } from '../src/components/forms/Input';
import { Button } from '../src/components/ui/Button';
import { OtpInput } from '../src/components/forms/OtpInput';

// Mock parent user
const mockParentUser = {
  id: 'parent-001',
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  phone: '9876543210',
  wardStudentId: 'student-001',
  wardStudentNames: ['John Doe', 'Jane Doe'],
  email: 'jane.doe@email.com',
};

// Mock parent auth context
const mockAuthContext = {
  isAuthenticated: vi.fn(() => true),
  parentUser: vi.fn(() => mockParentUser),
  login: vi.fn(),
  logout: vi.fn(),
};

// Mock student data for parent view
const mockStudentData = {
  name: 'John Doe',
  vertical: 'boys-hostel',
  room: 'Room 101',
  roomType: '2-sharing',
  status: 'ACTIVE',
  fees: {
    hostel: { status: 'PAID', amount: 15000, dueDate: '2024-12-31' },
    security: { status: 'PAID', amount: 5000, dueDate: '2024-12-31' },
  },
  leaveSummary: {
    status: 'ACTIVE',
    totalDays: 10,
    daysUsed: 3,
    upcomingLeave: null,
  },
  notifications: [
    {
      id: 'notif-001',
      type: 'reminder',
      title: 'Fee Payment Due',
      message: 'Your hostel fees for December are due. Please pay by December 31st.',
      date: '2024-12-15',
      read: false,
    },
    {
      id: 'notif-002',
      type: 'info',
      title: 'Room Change Request Approved',
      message: 'Your request for room change from 2-sharing to 3-sharing has been approved.',
      date: '2024-12-20',
      read: true,
    },
  ],
};

describe('Task 8 - Parent/Guardian View-only Login', () => {
  beforeEach(() => {
    mockAuthContext.isAuthenticated.mockReturnValue(true);
    mockAuthContext.parentUser.mockReturnValue(mockParentUser);
  });

  afterEach(cleanup);
  mockAuthContext.isAuthenticated.mockReset();
  mockAuthContext.parentUser.mockReset();
  mockAuthContext.login.mockReset();
  mockAuthContext.logout.mockReset();
  });

  describe('Entry Flow and OTP Verification', () => {
    it('renders parent login page', () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);
      expect(screen.getByText(/Parent Login/i)).toBeInTheDocument();
      expect(screen.getByText(/Guardian/i)).toBeInTheDocument();
    });

    it('renders phone and email input options', () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);
      expect(screen.getByText(/Mobile/i)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
    });

    it('validates registered mobile number format', () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);
      
      const phoneInput = screen.getByLabelText(/Mobile/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });

      expect(screen.getByText(/must be 10 digits/i)).toBeInTheDocument();
    });

    it('validates registered email format', () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);
      
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'parent@email.com' } });

      // Email format validation happens, so expect to not see format error
      expect(screen.queryByText(/valid email/i)).toBeNull();
    });

    it('validates mobile format (10 digits, starts with 6-9)', () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);
      
      const phoneInput = screen.getByLabelText(/Mobile/i);
      fireEvent.change(phoneInput, { target: { value: '6234567890' } });

      const errorMessages = screen.queryAllByText(/must start with/i);
      expect(errorMessages.length).toBe(0);
    });

    it('shows OTP screen after verification', async () => {
      // Mock successful OTP verification
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'parent-token-123',
            expiry: 300000
          })
        }) as any
      );

      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);

      const phoneInput = screen.getByLabelText(/Mobile/i);
      const otpInputs = screen.getAllByRole('textbox');
      
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      otpInputs.forEach(input => {
        fireEvent.change(input, { target: { value: '123456' } });
      });

      const verifyButton = screen.getByRole('button', { name: 'Verify' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(window.location.pathname).toBe('/dashboard/parent');
      }, { timeout: 5000 });
    });

    it('handles unregistered mobile number', async () => {
      render(<BrowserRouter><ParentLoginPage /></BrowserRouter>);

      const phoneInput = screen.getByLabelText(/Mobile/i);
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      const verifyButton = screen.getByRole('button', { name: 'Verify' });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/Mobile not registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Parent Dashboard Layout', () => {
    it('renders student overview section', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Boys Hostel/i)).toBeInTheDocument();
      expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
      expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    });

    it('renders fee status section', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      expect(screen.getByText(/Hostel Fees/i)).toBeInTheDocument();
      expect(screen.getByText(/PAID/i)).toBeInTheDocument();
      expect(screen.getByText(/Security Deposit/i)).toBeInTheDocument();
    });

    it('renders leave summary section', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      expect(screen.getByText(/Leave Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Active/i)).toBeInTheDocument();
      expect(screen.getByText(/10 days used/i)).toBeInTheDocument();
      expect(screen.getByText(/3 days remaining/i)).toBeInTheDocument();
    });

    it('renders notifications center', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      const notifications = screen.queryAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);
      
      const firstNotif = notifications[0];
      expect(firstNotif.textContent).toContain('Fee Payment Due');
    });

    it('displays room details for active student', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      const roomDetails = screen.getByText(/Room 101/i);
      expect(roomDetails).toBeInTheDocument();
    });
  });

  describe('Permissions and View-Only Behavior', () => {
    it('all primary actions are view-only', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      const actionButtons = screen.getAllByRole('button');
      
      actionButtons.forEach(button => {
        const buttonText = button.textContent;
        
        // All actions should be view-only
        expect(buttonText).not.toMatch(/Edit/i);
        expect(buttonText).not.toMatch(/Approve/i);
        expect(buttonText).not.toMatch(/Delete/i);
        expect(buttonText).not.toMatch(/Change/i);
      });

      // Submit/acknowledge buttons are allowed
      expect(actionButtons.some(btn => 
        btn.textContent.match(/Submit/) || btn.textContent.match(/Acknowledge/)
      )).toBe(true);
    });

    it('shows data only for associated student', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText(/Jane Doe/i)).toBeNull();
    });

    it('shows tooltips explaining permissions', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      // Hover over a restricted element
      const restrictedElement = screen.getByText(/Room Details/i);
      fireEvent.mouseOver(restrictedElement);
      
      // Tooltip should appear
      const tooltip = screen.queryByText(/View-only/i);
      await waitFor(() => {
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('no edit forms are accessible', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      // Try to find edit forms
      const forms = screen.queryAllByRole('form');
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          expect(input.disabled).toBe(true);
        });
      });
    });

    it('acknowledgement does not mutate data', () => {
      // Test that acknowledgement is a non-mutating action
      // In real implementation, this would test that no API calls are made
      
      const acknowledgeButton = screen.getByText(/Acknowledge/i);
      fireEvent.click(acknowledgeButton);
      
      // Verify button state hasn't changed (no loading, same text)
      expect(acknowledgeButton.textContent).toBe('Acknowledge');
    });
  });

  describe('Compliance and Copy', () => {
    it('shows DPDP informational content', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      expect(screen.getByText(/Data Protection/i)).toBeInTheDocument();
      expect(screen.getByText(/Digital Personal Data Protection/i)).toBeInTheDocument();
    });

    it('all sections have clear labels', () => {
      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);
      
      const labels = screen.getAllByRole('heading');
      labels.forEach(heading => {
        expect(heading.textContent).toBeTruthy();
      });
    });

    it('mobile layout is responsive', () => {
      // Test at mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
      });

      render(<BrowserRouter><ParentDashboard /></BrowserRouter>);

      // Check that notifications display correctly
      const notifications = screen.queryAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});
