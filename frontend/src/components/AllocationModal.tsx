'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components';

type Student = {
  id: string;
  full_name: string;
  email: string;
  mobile_no: string;
};

type Room = {
  id: string;
  room_number: string;
  vertical: string;
  floor: number;
  capacity: number;
  occupied_count: number;
};

type AllocationModalProps = {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
};

type CurrentOccupant = {
  allocation_id: string;
  student_id: string;
  full_name: string;
  email?: string;
  mobile?: string;
  allocated_at?: string;
};

export default function AllocationModal({ room, onClose, onSuccess }: AllocationModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentOccupants, setCurrentOccupants] = useState<CurrentOccupant[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [unallocatingId, setUnallocatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [occupancy, setOccupancy] = useState(room.occupied_count);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

      const [usersResponse, allocationsResponse] = await Promise.all([
        fetch('/api/users?role=STUDENT', { headers }),
        fetch('/api/allocations', { headers }),
      ]);
      if (!usersResponse.ok || !allocationsResponse.ok) {
        setError('Failed to fetch data');
        return;
      }
      const usersData = await usersResponse.json();
      const allocationsData = await allocationsResponse.json();
      const allAllocations = allocationsData.data || [];
      const allUsers = usersData.data || [];

      // Current active occupants of this room
      const occupants: CurrentOccupant[] = (Array.isArray(allAllocations) ? allAllocations : [])
        .filter((a: any) => a.status === 'ACTIVE' && a.room_id === room.id)
        .map((a: any) => {
          const user = (a.users as any) || allUsers.find((u: any) => u.id === a.student_id) || {};
          return {
            allocation_id: a.id,
            student_id: a.student_id,
            full_name: user.full_name || user.email || 'Unknown',
            email: user.email,
            mobile: user.mobile || user.mobile_no,
            allocated_at: a.allocated_at,
          };
        });
      setCurrentOccupants(occupants);
      setOccupancy(occupants.length);

      // Students without any active allocation
      const activeAllocations = new Set(
        (Array.isArray(allAllocations) ? allAllocations : [])
          .filter((a: any) => a.status === 'ACTIVE')
          .map((a: any) => a.student_id)
      );
      const availableStudents = (Array.isArray(allUsers) ? allUsers : []).filter(
        (user: any) => !activeAllocations.has(user.id)
      );
      setStudents(availableStudents);
    } catch {
      setError('Failed to fetch data');
    }
  };

  const handleUnallocate = async (allocationId: string, studentName: string) => {
    if (!confirm(`Unallocate ${studentName} from Room ${room.room_number}?`)) return;
    setUnallocatingId(allocationId);
    setError(null);
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const response = await fetch(`/api/allocations/vacate/${allocationId}`, {
        method: 'PUT',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to unallocate');
      }
      // Refresh list and notify parent
      await fetchData();
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to unallocate');
    } finally {
      setUnallocatingId(null);
    }
  };

  const handleAllocate = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({
          student_id: selectedStudent,
          room_id: room.id,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh list so new occupant shows up and user can continue
        setSelectedStudent('');
        setNotes('');
        setSearchQuery('');
        await fetchData();
        onSuccess();
      } else {
        setError(data.error || data.message || 'Failed to allocate room');
      }
    } catch (error) {
      setError('Failed to allocate room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      (student.mobile || student.mobile_no || '').includes(query)
    );
  });

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const availableBeds = room.capacity - occupancy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6"
        style={{ background: 'var(--surface-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>
            Allocate Room
          </h2>
          <button
            onClick={onClose}
            className="text-body hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Room Info */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Room Number
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.room_number}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Floor
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.floor}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Vertical
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.vertical.replace('_', ' ')}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Available Beds
              </div>
              <div className="text-body font-medium text-green-600">
                {availableBeds} / {room.capacity}
              </div>
            </div>
          </div>
        </div>

        {/* Current Occupants */}
        <div className="mb-6">
          <h3 className="text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Current Occupants ({currentOccupants.length})
          </h3>
          {currentOccupants.length === 0 ? (
            <div
              className="p-3 rounded text-body-sm text-center"
              style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
            >
              No students currently allocated to this room
            </div>
          ) : (
            <div
              className="border rounded-md divide-y"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              {currentOccupants.map((occ) => (
                <div
                  key={occ.allocation_id}
                  className="flex items-center justify-between p-3"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-body font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {occ.full_name}
                    </div>
                    <div className="text-body-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {occ.email || ''}{occ.email && occ.mobile ? ' • ' : ''}{occ.mobile || ''}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={unallocatingId === occ.allocation_id}
                    disabled={unallocatingId === occ.allocation_id}
                    onClick={() => handleUnallocate(occ.allocation_id, occ.full_name)}
                  >
                    Unallocate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Selection */}
        <div className="mb-4">
          <label className="block text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Allocate New Student {availableBeds === 0 && <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>(room is full — unallocate someone to add)</span>}
          </label>
          <Input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
            disabled={availableBeds === 0}
          />

          <div
            className="border rounded-md max-h-64 overflow-y-auto"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {students.length === 0
                  ? 'No available students to allocate'
                  : 'No students found matching your search'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full p-3 text-left border-b hover:bg-opacity-50 ${
                    selectedStudent === student.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    background: selectedStudent === student.id ? 'var(--surface-secondary)' : 'transparent',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {student.full_name || student.email}
                  </div>
                  <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {(student as any).email || ''} • {(student as any).mobile || (student as any).mobile_no || ''}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special notes or instructions..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              borderColor: 'var(--border-primary)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Confirmation Summary */}
        {selectedStudentData && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-blue-500" style={{ background: 'var(--surface-secondary)' }}>
            <div className="text-body-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Allocation Summary
            </div>
            <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Allocating <strong style={{ color: 'var(--text-primary)' }}>{selectedStudentData.full_name}</strong> to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Room {room.room_number}</strong> (Floor {room.floor})
            </div>
            <div className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              After allocation: {occupancy + 1} / {room.capacity} beds occupied
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-body-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} fullWidth disabled={loading}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAllocate}
            fullWidth
            loading={loading}
            disabled={!selectedStudent || loading || availableBeds === 0}
          >
            {loading ? 'Allocating...' : 'Confirm Allocation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
