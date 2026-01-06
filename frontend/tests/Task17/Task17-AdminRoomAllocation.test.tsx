import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RoomAllocationPage from '@/app/dashboard/admin/room-allocation/page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Task 17 - Admin Room Allocation Matrix', () => {
  const mockRooms = [
    {
      id: 'room1',
      room_number: 'BH-101',
      vertical: 'BOYS_HOSTEL',
      floor: 1,
      capacity: 3,
      current_occupancy: 2,
      status: 'AVAILABLE',
    },
    {
      id: 'room2',
      room_number: 'BH-102',
      vertical: 'BOYS_HOSTEL',
      floor: 1,
      capacity: 3,
      current_occupancy: 3,
      status: 'AVAILABLE',
    },
    {
      id: 'room3',
      room_number: 'GA-201',
      vertical: 'GIRLS_ASHRAM',
      floor: 2,
      capacity: 2,
      current_occupancy: 0,
      status: 'AVAILABLE',
    },
  ];

  const mockAllocations = [
    {
      id: 'alloc1',
      student_id: 'student1',
      room_id: 'room1',
      allocated_at: '2024-01-01T00:00:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'alloc2',
      student_id: 'student2',
      room_id: 'room1',
      allocated_at: '2024-01-02T00:00:00Z',
      status: 'ACTIVE',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  it('17.1 - should render room allocation matrix page', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('Room Allocation Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage room allocations across all verticals')).toBeInTheDocument();
  });

  it('17.2 - should display room cards with status badges', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    // Check room numbers are displayed
    expect(screen.getByText('BH-101')).toBeInTheDocument();
    expect(screen.getByText('BH-102')).toBeInTheDocument();
    expect(screen.getByText('GA-201')).toBeInTheDocument();

    // Check occupancy is displayed
    expect(screen.getByText('2 / 3')).toBeInTheDocument(); // BH-101
    expect(screen.getByText('3 / 3')).toBeInTheDocument(); // BH-102
    expect(screen.getByText('0 / 2')).toBeInTheDocument(); // GA-201
  });

  it('17.3 - should have vertical filter working', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    const verticalFilter = screen.getByLabelText('Vertical');

    // Filter to Girls Ashram
    fireEvent.change(verticalFilter, { target: { value: 'GIRLS_ASHRAM' } });

    await waitFor(() => {
      expect(screen.getByText('GA-201')).toBeInTheDocument();
      expect(screen.queryByText('BH-101')).not.toBeInTheDocument();
    });
  });

  it('17.4 - should have occupancy status filter working', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    const occupancyFilter = screen.getByLabelText('Occupancy Status');

    // Filter to Full rooms
    fireEvent.change(occupancyFilter, { target: { value: 'FULL' } });

    await waitFor(() => {
      expect(screen.getByText('BH-102')).toBeInTheDocument(); // 3/3 = full
      expect(screen.queryByText('BH-101')).not.toBeInTheDocument(); // 2/3 = partial
    });
  });

  it('17.5 - should have search filter working', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Room number...');

    fireEvent.change(searchInput, { target: { value: '102' } });

    await waitFor(() => {
      expect(screen.getByText('BH-102')).toBeInTheDocument();
      expect(screen.queryByText('BH-101')).not.toBeInTheDocument();
    });
  });

  it('17.6 - should group rooms by floor', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('Floor 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Floor 1')).toBeInTheDocument();
    expect(screen.getByText('Floor 2')).toBeInTheDocument();
  });

  it('17.7 - should open detail panel when room is clicked', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    const roomCard = screen.getByText('BH-101').closest('button');
    if (roomCard) {
      fireEvent.click(roomCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Room BH-101')).toBeInTheDocument();
    });

    // Check detail panel content
    expect(screen.getByText('Current Occupants')).toBeInTheDocument();
    expect(screen.getByText('Allocate Student')).toBeInTheDocument();
  });

  it('17.8 - should fetch and display room data on mount', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rooms');
      expect(global.fetch).toHaveBeenCalledWith('/api/allocations');
    });
  });

  it('17.9 - should show loading state initially', () => {
    render(<RoomAllocationPage />);

    expect(screen.getByText('Loading rooms...')).toBeInTheDocument();
  });

  it('17.10 - should display correct status badges', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    // Check for status labels (using getAllByText for potential duplicates)
    expect(screen.getAllByText('Partial').length).toBeGreaterThan(0); // BH-101 (2/3)
    expect(screen.getAllByText('Full').length).toBeGreaterThan(0); // BH-102 (3/3)
    expect(screen.getAllByText('Available').length).toBeGreaterThan(0); // GA-201 (0/2)
  });

  it('17.11 - should show correct room count in summary', async () => {
    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    // Check "Showing X rooms" text
    const summaryText = screen.getByText(/Showing/);
    expect(summaryText).toBeInTheDocument();
  });

  it('17.12 - should handle API errors gracefully', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    // Mock console.error to avoid test output noise
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<RoomAllocationPage />);

    await waitFor(() => {
      expect(screen.getByText('Loading rooms...')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
});
