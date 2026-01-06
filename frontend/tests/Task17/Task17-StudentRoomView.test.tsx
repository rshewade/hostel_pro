import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StudentRoomPage from '@/app/dashboard/student/room/page';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('Task 17 - Student Room View', () => {
  const mockAllocations = [
    {
      id: 'alloc1',
      student_id: 'u1',
      room_id: 'room1',
      allocated_at: '2024-01-15T10:00:00Z',
      status: 'ACTIVE',
      check_in_confirmed: false,
      notes: 'Special request: ground floor',
    },
  ];

  const mockRooms = [
    {
      id: 'room1',
      room_number: 'BH-101',
      vertical: 'BOYS_HOSTEL',
      floor: 1,
      capacity: 3,
      current_occupancy: 2,
      amenities: ['Bed', 'Study Table', 'Cupboard', 'Chair', 'Ceiling Fan'],
    },
  ];

  const mockRoommates = [
    {
      id: 'student2',
      full_name: 'Roommate One',
      email: 'roommate1@example.com',
      mobile_no: '9876543210',
    },
  ];

  const mockOtherAllocations = [
    {
      id: 'alloc2',
      student_id: 'student2',
      room_id: 'room1',
      allocated_at: '2024-01-10T10:00:00Z',
      status: 'ACTIVE',
      check_in_confirmed: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [...mockAllocations, ...mockOtherAllocations],
          }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/users/profile?user_id=student2')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ profile: { full_name: 'Roommate One' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  it('17.27 - should render student room view page', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('My Room')).toBeInTheDocument();
    });

    expect(screen.getByText('View your room details and check-in status')).toBeInTheDocument();
  });

  it('17.28 - should show check-in required banner when not checked in', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Check-in Required')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/You have been allocated a room/)
    ).toBeInTheDocument();
    expect(screen.getByText('Check In Now')).toBeInTheDocument();
  });

  it('17.29 - should show check-in confirmed banner when checked in', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                ...mockAllocations[0],
                check_in_confirmed: true,
                check_in_confirmed_at: '2024-01-16T10:00:00Z',
              },
              ...mockOtherAllocations,
            ],
          }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ profile: { full_name: 'Roommate One' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Check-in Confirmed')).toBeInTheDocument();
    });

    expect(screen.getByText(/You checked in on/)).toBeInTheDocument();
  });

  it('17.30 - should display room details correctly', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    expect(screen.getByText('Room Details')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Floor
    expect(screen.getByText('BOYS HOSTEL')).toBeInTheDocument();
    expect(screen.getByText('3 beds')).toBeInTheDocument();
  });

  it('17.31 - should display room amenities', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Room Amenities')).toBeInTheDocument();
    });

    expect(screen.getByText('Bed')).toBeInTheDocument();
    expect(screen.getByText('Study Table')).toBeInTheDocument();
    expect(screen.getByText('Cupboard')).toBeInTheDocument();
    expect(screen.getByText('Chair')).toBeInTheDocument();
    expect(screen.getByText('Ceiling Fan')).toBeInTheDocument();
  });

  it('17.32 - should display special notes if present', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Special Notes')).toBeInTheDocument();
    });

    expect(screen.getByText('Special request: ground floor')).toBeInTheDocument();
  });

  it('17.33 - should display roommates list', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Roommates')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Roommate One')).toBeInTheDocument();
    });

    expect(screen.getByText('Bed 2')).toBeInTheDocument();
  });

  it('17.34 - should show roommate check-in status', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Roommate One')).toBeInTheDocument();
    });

    expect(screen.getByText('Checked In')).toBeInTheDocument();
  });

  it('17.35 - should show "No other roommates yet" when room is empty', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/allocations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: mockAllocations, // Only student1, no roommates
          }),
        });
      }
      if (url.includes('/api/rooms')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRooms }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('No other roommates yet')).toBeInTheDocument();
    });
  });

  it('17.36 - should display room occupancy progress', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Room Occupancy')).toBeInTheDocument();
    });

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('17.37 - should navigate to check-in page when button clicked', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Check In Now')).toBeInTheDocument();
    });

    const checkInButton = screen.getByText('Check In Now');
    fireEvent.click(checkInButton);

    expect(window.location.href).toBe('/dashboard/student/room/check-in');
  });

  it('17.38 - should show "Complete Check-in" button in actions', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Complete Check-in')).toBeInTheDocument();
    });
  });

  it('17.39 - should have Refresh Data button', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Data');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/allocations');
    });
  });

  it('17.40 - should show error when no allocation found', async () => {
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

    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Room Information')).toBeInTheDocument();
    });

    expect(
      screen.getByText('No room allocation found. Please contact the administrator.')
    ).toBeInTheDocument();
  });

  it('17.41 - should show loading state initially', () => {
    render(<StudentRoomPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Fetching your room details')).toBeInTheDocument();
  });

  it('17.42 - should handle API errors gracefully', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load room information. Please try again.')
      ).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  it('17.43 - should display allocated date', async () => {
    render(<StudentRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Allocated On')).toBeInTheDocument();
    });

    expect(screen.getByText(/15 January 2024/)).toBeInTheDocument();
  });
});
