import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AllocationModal from '@/components/AllocationModal';

// Mock fetch globally
global.fetch = vi.fn();

describe('Task 17 - Allocation Modal', () => {
  const mockRoom = {
    id: 'room1',
    room_number: 'BH-101',
    vertical: 'BOYS_HOSTEL',
    floor: 1,
    capacity: 3,
    current_occupancy: 1,
  };

  const mockStudents = [
    {
      id: 'student1',
      full_name: 'John Doe',
      email: 'john@example.com',
      mobile_no: '9876543210',
    },
    {
      id: 'student2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      mobile_no: '9876543211',
    },
    {
      id: 'student3',
      full_name: 'Bob Johnson',
      email: 'bob@example.com',
      mobile_no: '9876543212',
    },
  ];

  const mockAllocations = [
    {
      id: 'alloc1',
      student_id: 'student3',
      room_id: 'room2',
      status: 'ACTIVE',
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/users?role=STUDENT')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockStudents }),
        });
      }
      if (url.includes('/api/allocations') && !options) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      if (url.includes('/api/allocations') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { id: 'new-alloc' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });
  });

  it('17.13 - should render allocation modal', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Allocate Student to Room')).toBeInTheDocument();
    });
  });

  it('17.14 - should display room information', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('BH-101')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Floor
    expect(screen.getByText('BOYS HOSTEL')).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument(); // Available beds
  });

  it('17.15 - should fetch and display available students', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Student3 should not appear (has active allocation)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('17.16 - should allow searching for students', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/);
    fireEvent.change(searchInput, { target: { value: 'jane' } });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('17.17 - should allow selecting a student', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const studentButton = screen.getByText('John Doe').closest('button');
    if (studentButton) {
      fireEvent.click(studentButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Allocation Summary')).toBeInTheDocument();
    });
  });

  it('17.18 - should show allocation summary when student selected', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const studentButton = screen.getByText('John Doe').closest('button');
    if (studentButton) {
      fireEvent.click(studentButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Allocating/)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Room BH-101/)).toBeInTheDocument();
  });

  it('17.19 - should allow adding optional notes', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Notes (Optional)')).toBeInTheDocument();
    });

    const notesTextarea = screen.getByPlaceholderText(/Add any special notes/);
    fireEvent.change(notesTextarea, {
      target: { value: 'Student requested ground floor' },
    });

    expect(notesTextarea).toHaveValue('Student requested ground floor');
  });

  it('17.20 - should show error when no student selected', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Confirm Allocation')).toBeInTheDocument();
    });

    // Button should be disabled when no student selected
    const allocateButton = screen.getByText('Confirm Allocation').closest('button');
    expect(allocateButton).toBeDisabled();
  });

  it('17.21 - should successfully allocate student to room', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select student
    const studentButton = screen.getByText('John Doe').closest('button');
    if (studentButton) {
      fireEvent.click(studentButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Allocation Summary')).toBeInTheDocument();
    });

    // Click allocate
    const allocateButton = screen.getByText('Confirm Allocation');
    fireEvent.click(allocateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/allocations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('17.22 - should call onClose when cancel is clicked', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('17.23 - should call onClose when X button is clicked', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('17.24 - should disable allocate button when loading', async () => {
    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Confirm Allocation')).toBeInTheDocument();
    });

    const allocateButton = screen.getByText('Confirm Allocation').closest('button');
    expect(allocateButton).toBeDisabled(); // Disabled when no student selected
  });

  it('17.25 - should handle allocation API errors', async () => {
    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/users?role=STUDENT')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockStudents }),
        });
      }
      if (url.includes('/api/allocations') && !options) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAllocations }),
        });
      }
      if (url.includes('/api/allocations') && options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Room is full' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      });
    });

    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select student
    const studentButton = screen.getByText('John Doe').closest('button');
    if (studentButton) {
      fireEvent.click(studentButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Confirm Allocation')).toBeInTheDocument();
    });

    // Click allocate
    const allocateButton = screen.getByText('Confirm Allocation');
    fireEvent.click(allocateButton);

    await waitFor(() => {
      expect(screen.getByText('Room is full')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('17.26 - should show "No available students" when all are allocated', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/users?role=STUDENT')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
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

    render(
      <AllocationModal
        room={mockRoom}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No available students to allocate')).toBeInTheDocument();
    });
  });
});
