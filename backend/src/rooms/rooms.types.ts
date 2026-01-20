// Room types and interfaces

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'PARTIALLY_OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export type VerticalType = 'BOYS' | 'GIRLS' | 'DHARAMSHALA';

export type AllocationStatus = 'ACTIVE' | 'ENDED' | 'TRANSFERRED';

export interface Room {
  id: string;
  room_number: string;
  vertical: VerticalType;
  floor: number;
  capacity: number;
  current_occupancy: number;
  status: RoomStatus;
  amenities?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomAllocation {
  id: string;
  room_id: string;
  student_user_id: string;
  bed_number?: number;
  allocated_at: string;
  allocated_by: string;
  ended_at?: string;
  ended_by?: string;
  end_reason?: string;
  status: AllocationStatus;
  created_at: string;
}

export interface RoomListResult {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface RoomWithOccupants extends Room {
  allocations: (RoomAllocation & { student?: { name: string; mobile: string } })[];
}
