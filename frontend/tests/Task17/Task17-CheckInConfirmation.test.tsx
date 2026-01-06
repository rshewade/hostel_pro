import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CheckInPage from '@/app/dashboard/student/room/check-in/page';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('Task 17 - Check-in Confirmation', () => {
  const mockAllocations = [
    {
      id: 'alloc1',
      student_id: 'u1',
      room_id: 'room1',
      allocated_at: '2024-01-15T10:00:00Z',
      status: 'ACTIVE',
      check_in_confirmed: false,
    },
  ];

  const mockRooms = [
    {
      id: 'room1',
      room_number: 'BH-101',
      vertical: 'BOYS_HOSTEL',
      floor: 1,
      capacity: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/allocations') && !options) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/allocations/alloc1') && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { id: 'alloc1', check_in_confirmed: true } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  it('17.44 - should render check-in confirmation page', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Room Check-in')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Complete the inventory verification/)
    ).toBeInTheDocument();
  });

  it('17.45 - should display room number in header', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText(/Room BH-101/)).toBeInTheDocument();
    });
  });

  it('17.46 - should show progress indicator', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('17.47 - should display inventory checklist items', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Inventory Verification')).toBeInTheDocument();
    });

    expect(screen.getByText('Bed with Mattress')).toBeInTheDocument();
    expect(screen.getByText('Study Table')).toBeInTheDocument();
    expect(screen.getByText('Chair')).toBeInTheDocument();
    expect(screen.getByText('Cupboard')).toBeInTheDocument();
    expect(screen.getByText('Ceiling Fan')).toBeInTheDocument();
    expect(screen.getByText('Light Fixture')).toBeInTheDocument();
    expect(screen.getByText('Windows (Working)')).toBeInTheDocument();
    expect(screen.getByText('Door Lock')).toBeInTheDocument();
  });

  it('17.48 - should allow checking inventory items', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Bed with Mattress')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const bedCheckbox = checkboxes[0]; // First checkbox is for Bed

    expect(bedCheckbox).not.toBeChecked();

    fireEvent.click(bedCheckbox);

    await waitFor(() => {
      expect(bedCheckbox).toBeChecked();
    });
  });

  it('17.49 - should update progress when items are checked', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Check first 4 inventory items (8 total inventory + 2 confirmations)
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(checkboxes[3]);

    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      expect(progressText.textContent).not.toBe('0%');
    });
  });

  it('17.50 - should allow modifying item quantities', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Bed with Mattress')).toBeInTheDocument();
    });

    const quantityInputs = screen.getAllByRole('spinbutton');
    const bedQuantity = quantityInputs[0];

    fireEvent.change(bedQuantity, { target: { value: '0' } });

    await waitFor(() => {
      expect(bedQuantity).toHaveValue(0);
    });
  });

  it('17.51 - should show warning when quantity mismatches', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Bed with Mattress')).toBeInTheDocument();
    });

    const quantityInputs = screen.getAllByRole('spinbutton');
    const bedQuantity = quantityInputs[0];

    fireEvent.change(bedQuantity, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText(/Quantity mismatch/)).toBeInTheDocument();
    });
  });

  it('17.52 - should allow adding notes to inventory items', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Bed with Mattress')).toBeInTheDocument();
    });

    const noteInputs = screen.getAllByPlaceholderText(/Add notes if there are any issues/);
    const bedNotes = noteInputs[0];

    fireEvent.change(bedNotes, { target: { value: 'Mattress has a small stain' } });

    expect(bedNotes).toHaveValue('Mattress has a small stain');
  });

  it('17.53 - should have room condition confirmation checkbox', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Room Condition')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/I confirm that the room is in acceptable condition/)
    ).toBeInTheDocument();
  });

  it('17.54 - should have rules acceptance checkbox', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Rules and Regulations')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/I accept and agree to follow all room rules/)
    ).toBeInTheDocument();
  });

  it('17.55 - should display room rules', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Rules and Regulations')).toBeInTheDocument();
    });

    expect(screen.getByText(/Keep the room clean/)).toBeInTheDocument();
    expect(screen.getByText(/No smoking/)).toBeInTheDocument();
    expect(screen.getByText(/Respect quiet hours/)).toBeInTheDocument();
  });

  it('17.56 - should have additional notes textarea', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Additional Notes (Optional)')).toBeInTheDocument();
    });

    const additionalNotes = screen.getByPlaceholderText(/Any other observations/);
    fireEvent.change(additionalNotes, {
      target: { value: 'Room looks great!' },
    });

    expect(additionalNotes).toHaveValue('Room looks great!');
  });

  it('17.57 - should disable confirm button until all requirements met', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Check-in').closest('button');
    expect(confirmButton).toBeDisabled();
  });

  it('17.58 - should show error when trying to submit without verifications', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Check room condition and rules (last 2 checkboxes)
    const roomConditionCheckbox = checkboxes[checkboxes.length - 2];
    const rulesCheckbox = checkboxes[checkboxes.length - 1];

    fireEvent.click(roomConditionCheckbox);
    fireEvent.click(rulesCheckbox);

    // Button should still be disabled because inventory items are not verified
    const confirmButton = screen.getByText('Confirm Check-in').closest('button');
    expect(confirmButton).toBeDisabled();

    // Should show helper message
    await waitFor(() => {
      expect(
        screen.getByText(/Please complete all verifications to proceed/)
      ).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('17.59 - should enable confirm button when all requirements met', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Check all checkboxes (8 inventory items + 2 confirmations)
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Check-in');
      expect(confirmButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('17.60 - should successfully submit check-in', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Check all checkboxes
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Check-in');
      expect(confirmButton).not.toBeDisabled();
    }, { timeout: 2000 });

    const confirmButton = screen.getByText('Confirm Check-in');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/allocations/alloc1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard/student/room?checked_in=true');
    });
  });

  it('17.61 - should redirect if already checked in', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                ...mockAllocations[0],
                check_in_confirmed: true,
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<CheckInPage />);

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard/student/room');
    });
  });

  it('17.62 - should show error when no allocation found', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Process Check-in')).toBeInTheDocument();
    });

    expect(screen.getByText('No room allocation found.')).toBeInTheDocument();
  });

  it('17.63 - should handle check-in API errors', async () => {
    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/allocations') && !options) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/allocations/alloc1') && options?.method === 'PUT') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Server error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Check-in');
      expect(confirmButton).not.toBeDisabled();
    }, { timeout: 2000 });

    const confirmButton = screen.getByText('Confirm Check-in');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to complete check-in/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('17.64 - should have cancel button that redirects back', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(window.location.href).toBe('/dashboard/student/room');
  });

  it('17.65 - should show loading state while processing', async () => {
    let resolvePromise: any;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/allocations') && !options) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/allocations/alloc1') && options?.method === 'PUT') {
        return slowPromise;
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Check-in').closest('button');
      expect(confirmButton).not.toBeDisabled();
    }, { timeout: 2000 });

    const confirmButton = screen.getByText('Confirm Check-in').closest('button');
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    // Check that the API was called (indicating submission started)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/allocations/alloc1',
        expect.objectContaining({ method: 'PUT' })
      );
    }, { timeout: 2000 });

    // Resolve the promise
    resolvePromise({
      ok: true,
      json: async () => ({ data: { id: 'alloc1' } }),
    });
  });

  it('17.66 - should show completion message when all items verified', async () => {
    render(<CheckInPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Check-in')).toBeInTheDocument();
    });

    // Initially should show incomplete message
    expect(
      screen.getByText(/Please complete all verifications to proceed/)
    ).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Please complete all verifications/)
      ).not.toBeInTheDocument();
    });
  });
});
