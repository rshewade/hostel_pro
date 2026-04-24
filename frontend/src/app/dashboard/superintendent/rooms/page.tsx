'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components';
import { Select } from '@/components/forms/Select';
import { SearchField } from '@/components/forms/SearchField';
import AllocationModal from '@/components/AllocationModal';
import { useLanguage } from '@/contexts/LanguageContext';

// Types
type RoomStatus = 'AVAILABLE' | 'PARTIAL' | 'FULL' | 'MAINTENANCE' | 'CLOSED';
type Vertical = 'BOYS_HOSTEL' | 'GIRLS_ASHRAM' | 'DHARAMSHALA';

type Room = {
  id: string;
  room_number: string;
  vertical: Vertical;
  floor: number;
  capacity: number;
  occupied_count: number;
  status: RoomStatus;
};

type Allocation = {
  id: string;
  student_id: string;
  room_id: string;
  allocated_at: string;
  status: string;
};

type Student = {
  id: string;
  full_name: string;
  bed_number?: number;
};

export default function RoomAllocationPage() {
  const { t } = useLanguage();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Filters
  const [occupancyFilter, setOccupancyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchAllocations();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/allocations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      setAllocations(data.data || []);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  // Calculate room status
  const getRoomStatus = (room: Room): RoomStatus => {
    if (room.status === 'MAINTENANCE') return 'MAINTENANCE';
    if (room.occupied_count === 0) return 'AVAILABLE';
    if (room.occupied_count >= room.capacity) return 'FULL';
    return 'PARTIAL';
  };

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    // Occupancy filter
    const status = getRoomStatus(room);
    if (occupancyFilter !== 'ALL') {
      if (occupancyFilter === 'EMPTY' && status !== 'AVAILABLE') return false;
      if (occupancyFilter === 'PARTIAL' && status !== 'PARTIAL') return false;
      if (occupancyFilter === 'FULL' && status !== 'FULL') return false;
      if (occupancyFilter === 'BLOCKED' && status !== 'MAINTENANCE') return false;
    }

    // Search filter
    if (searchQuery && !room.room_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Group rooms by floor
  const roomsByFloor = filteredRooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailPanel(true);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('Room Allocation Matrix', 'कमरा आवंटन मैट्रिक्स')}
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('Manage room allocations', 'कमरा आवंटन प्रबंधित करें')}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditingRoom(null); setShowRoomModal(true); }}>
          + {t('Add Room', 'कमरा जोड़ें')}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Occupancy Filter */}
          <Select
            label="Occupancy Status"
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Status' },
              { value: 'EMPTY', label: 'Available' },
              { value: 'PARTIAL', label: 'Partially Occupied' },
              { value: 'FULL', label: 'Full' },
              { value: 'BLOCKED', label: 'Blocked' },
            ]}
          />

          {/* Search */}
          <SearchField
            label="Search Room"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Room number..."
            showClearButton
          />

          {/* Summary */}
          <div className="flex items-end">
            <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredRooms.length}</strong> rooms
            </div>
          </div>
        </div>
      </div>

      {/* Room Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms Grid */}
        <div className={showDetailPanel ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>{t('Loading rooms...', 'कमरे लोड हो रहे हैं...')}</p>
            </div>
          ) : Object.keys(roomsByFloor).length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>{t('No rooms found', 'कोई कमरा नहीं मिला')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(roomsByFloor)
                .sort((a, b) => Number(a) - Number(b))
                .map((floor) => (
                  <div key={floor}>
                    <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
                      Floor {floor}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {roomsByFloor[Number(floor)].map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          status={getRoomStatus(room)}
                          onClick={() => handleRoomClick(room)}
                          isSelected={selectedRoom?.id === room.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {showDetailPanel && selectedRoom && (
          <div className="lg:col-span-1">
            <RoomDetailPanel
              room={selectedRoom}
              allocations={allocations.filter((a) => a.room_id === selectedRoom.id && a.status === 'ACTIVE')}
              onClose={() => {
                setShowDetailPanel(false);
                setSelectedRoom(null);
              }}
              onAllocate={() => {
                setShowAllocationModal(true);
              }}
              onEdit={() => {
                setEditingRoom(selectedRoom);
                setShowRoomModal(true);
              }}
              onRefresh={() => {
                fetchRooms();
                fetchAllocations();
              }}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Room Modal */}
      {showRoomModal && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => { setShowRoomModal(false); setEditingRoom(null); }}
          onSuccess={() => {
            setShowRoomModal(false);
            setEditingRoom(null);
            fetchRooms();
          }}
        />
      )}

      {/* Allocation Modal */}
      {showAllocationModal && selectedRoom && (
        <AllocationModal
          room={selectedRoom}
          onClose={() => setShowAllocationModal(false)}
          onSuccess={() => {
            setShowAllocationModal(false);
            fetchRooms();
            fetchAllocations();
          }}
        />
      )}
    </div>
  );
}

// Room Card Component
function RoomCard({
  room,
  status,
  onClick,
  isSelected,
}: {
  room: Room;
  status: RoomStatus;
  onClick: () => void;
  isSelected: boolean;
}) {
  const statusConfig = {
    AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-700', icon: '🟢' },
    PARTIAL: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
    FULL: { label: 'Full', color: 'bg-red-100 text-red-700', icon: '🔴' },
    MAINTENANCE: { label: 'Blocked', color: 'bg-gray-100 text-gray-700', icon: '⚫' },
    CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-500', icon: '⛔' },
  };

  const config = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        background: 'var(--surface-primary)',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-primary)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-heading-4" style={{ color: 'var(--text-primary)' }}>
            {room.room_number}
          </div>
          <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            {room.vertical.replace('_', ' ')}
          </div>
        </div>
        <span className="text-xl">{config.icon}</span>
      </div>

      <div className="mb-3">
        <div className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {room.occupied_count} / {room.capacity}
        </div>
        <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
          Occupancy
        </div>
      </div>

      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </div>
    </button>
  );
}

// Room Detail Panel Component
function RoomDetailPanel({
  room,
  allocations,
  onClose,
  onAllocate,
  onEdit,
  onRefresh,
}: {
  room: Room;
  allocations: Allocation[];
  onClose: () => void;
  onAllocate: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}) {
  const [occupants, setOccupants] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Allocation rows already carry joined user data (`users` field from /api/allocations)
    const students: Student[] = allocations.map((allocation: any, index) => {
      const user = (allocation.users as any) || {};
      const studentId = allocation.student_user_id || allocation.student_id;
      return {
        id: studentId || `occupant-${index}`,
        full_name: user.full_name || user.email || 'Unknown Student',
        bed_number: index + 1,
      };
    });
    setOccupants(students);
    setLoading(false);
  }, [allocations]);

  const availableBeds = room.capacity - room.occupied_count;

  return (
    <div className="sticky top-6 p-6 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-3" style={{ color: 'var(--text-primary)' }}>
          Room {room.room_number}
        </h3>
        <button
          onClick={onClose}
          className="text-body hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          ✕
        </button>
      </div>

      {/* Room Info */}
      <div className="space-y-3 mb-6">
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
            Capacity
          </div>
          <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
            {room.occupied_count} / {room.capacity} beds occupied
          </div>
          {availableBeds > 0 && (
            <div className="text-body-sm text-green-600">
              {availableBeds} bed{availableBeds > 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </div>

      {/* Current Occupants */}
      <div className="mb-6">
        <h4 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>
          Current Occupants
        </h4>
        {loading ? (
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Loading...
          </p>
        ) : occupants.length === 0 ? (
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            No occupants currently
          </p>
        ) : (
          <div className="space-y-2">
            {occupants.map((student, index) => (
              <div
                key={`${student.id}-${index}`}
                className="p-3 rounded-md"
                style={{ background: 'var(--surface-secondary)' }}
              >
                <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {student.full_name}
                </div>
                <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Bed {student.bed_number}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAllocate}
        >
          Manage Allocation
        </Button>

        <Button variant="secondary" size="sm" fullWidth onClick={onEdit}>
          Edit Room
        </Button>

        <Button variant="secondary" size="sm" fullWidth onClick={onRefresh}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
}

// Add/Edit Room Modal
function RoomFormModal({
  room,
  onClose,
  onSuccess,
}: {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!room;
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    floor: room?.floor?.toString() || '',
    capacity: room?.capacity?.toString() || '',
    status: (room?.status || 'AVAILABLE') as string,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.room_number || !formData.floor || !formData.capacity) {
      setError('Room number, floor, and capacity are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const url = '/api/rooms';
      const method = isEdit ? 'PUT' : 'POST';

      // For POST, we need the vertical from the authenticated user's context
      // The API will validate vertical match for superintendent
      const body: any = {
        room_number: formData.room_number,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
        status: formData.status,
      };

      if (isEdit) {
        body.id = room!.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || data.message || 'Failed to save room');
      }
    } catch {
      setError('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Room Number *</label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="e.g., B-401"
              disabled={isEdit}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
              style={{ borderColor: 'var(--border-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Floor *</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1"
                min="1"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="2"
                min="1"
                max="8"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-primary)' }}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} loading={loading} fullWidth>
            {isEdit ? 'Update Room' : 'Add Room'}
          </Button>
        </div>
      </div>
    </div>
  );
}
