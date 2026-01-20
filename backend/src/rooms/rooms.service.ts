import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Room,
  RoomAllocation,
  RoomStatus,
  RoomListResult,
  RoomWithOccupants,
} from './rooms.types';
import {
  CreateRoomDto,
  UpdateRoomDto,
  AllocateRoomDto,
  EndAllocationDto,
  TransferRoomDto,
  ListRoomsDto,
} from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Create a new room
   */
  async createRoom(dto: CreateRoomDto, createdBy: string): Promise<Room> {
    // Check if room number already exists in the vertical
    const { data: existing } = await this.supabase
      .from('rooms')
      .select('id')
      .eq('room_number', dto.roomNumber)
      .eq('vertical', dto.vertical)
      .single();

    if (existing) {
      throw new ConflictException(
        `Room ${dto.roomNumber} already exists in ${dto.vertical} vertical`,
      );
    }

    const roomRecord = {
      room_number: dto.roomNumber,
      vertical: dto.vertical,
      floor: dto.floor,
      capacity: dto.capacity,
      current_occupancy: 0,
      status: 'AVAILABLE' as RoomStatus,
      amenities: dto.amenities || [],
      notes: dto.notes || null,
    };

    const { data, error } = await this.supabase
      .from('rooms')
      .insert(roomRecord)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create room: ${error.message}`,
      );
    }

    // Log room creation
    await this.logAudit('ROOM', data.id, 'CREATE', createdBy, {
      room_number: dto.roomNumber,
      vertical: dto.vertical,
    });

    return data;
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: string): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    return data;
  }

  /**
   * Get room with current occupants
   */
  async getRoomWithOccupants(roomId: string): Promise<RoomWithOccupants> {
    const room = await this.getRoomById(roomId);

    const { data: allocations, error } = await this.supabase
      .from('room_allocations')
      .select(`
        *,
        student:users!student_user_id(name, mobile)
      `)
      .eq('room_id', roomId)
      .eq('status', 'ACTIVE');

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get room occupants: ${error.message}`,
      );
    }

    return {
      ...room,
      allocations: allocations || [],
    };
  }

  /**
   * Update room
   */
  async updateRoom(
    roomId: string,
    dto: UpdateRoomDto,
    updatedBy: string,
  ): Promise<Room> {
    const room = await this.getRoomById(roomId);

    // Don't allow reducing capacity below current occupancy
    if (dto.capacity !== undefined && dto.capacity < room.current_occupancy) {
      throw new BadRequestException(
        `Cannot reduce capacity below current occupancy (${room.current_occupancy})`,
      );
    }

    const updateData: Partial<Room> = {};
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
    if (dto.status) updateData.status = dto.status;
    if (dto.amenities) updateData.amenities = dto.amenities;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await this.supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update room: ${error.message}`,
      );
    }

    await this.logAudit('ROOM', roomId, 'UPDATE', updatedBy, updateData);

    return data;
  }

  /**
   * List rooms with filters
   */
  async listRooms(
    filters: ListRoomsDto,
    userRole: string,
    userVertical?: string,
  ): Promise<RoomListResult> {
    let query = this.supabase.from('rooms').select('*', { count: 'exact' });

    // Superintendents can only see rooms in their vertical
    if (userRole === 'SUPERINTENDENT' && userVertical) {
      query = query.eq('vertical', userVertical);
    } else if (filters.vertical) {
      query = query.eq('vertical', filters.vertical);
    }

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.floor !== undefined) {
      query = query.eq('floor', filters.floor);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list rooms: ${error.message}`,
      );
    }

    return {
      rooms: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Allocate a room to a student
   */
  async allocateRoom(
    roomId: string,
    dto: AllocateRoomDto,
    allocatedBy: string,
  ): Promise<RoomAllocation> {
    const room = await this.getRoomById(roomId);

    // Check if room has capacity
    if (room.current_occupancy >= room.capacity) {
      throw new BadRequestException('Room is at full capacity');
    }

    // Check if student already has an active allocation
    const { data: existingAllocation } = await this.supabase
      .from('room_allocations')
      .select('id, room_id')
      .eq('student_user_id', dto.studentUserId)
      .eq('status', 'ACTIVE')
      .single();

    if (existingAllocation) {
      throw new ConflictException(
        'Student already has an active room allocation',
      );
    }

    const allocationRecord = {
      room_id: roomId,
      student_user_id: dto.studentUserId,
      bed_number: dto.bedNumber || null,
      allocated_at: new Date().toISOString(),
      allocated_by: allocatedBy,
      status: 'ACTIVE',
    };

    const { data: allocation, error: allocError } = await this.supabase
      .from('room_allocations')
      .insert(allocationRecord)
      .select()
      .single();

    if (allocError) {
      throw new InternalServerErrorException(
        `Failed to allocate room: ${allocError.message}`,
      );
    }

    // Update room occupancy and status
    const newOccupancy = room.current_occupancy + 1;
    const newStatus: RoomStatus =
      newOccupancy >= room.capacity ? 'OCCUPIED' : 'PARTIALLY_OCCUPIED';

    await this.supabase
      .from('rooms')
      .update({
        current_occupancy: newOccupancy,
        status: newStatus,
      })
      .eq('id', roomId);

    await this.logAudit('ROOM_ALLOCATION', allocation.id, 'CREATE', allocatedBy, {
      room_id: roomId,
      student_user_id: dto.studentUserId,
    });

    return allocation;
  }

  /**
   * End a room allocation
   */
  async endAllocation(
    allocationId: string,
    dto: EndAllocationDto,
    endedBy: string,
  ): Promise<RoomAllocation> {
    const { data: allocation, error: fetchError } = await this.supabase
      .from('room_allocations')
      .select('*, room:rooms!room_id(*)')
      .eq('id', allocationId)
      .single();

    if (fetchError || !allocation) {
      throw new NotFoundException(`Allocation not found: ${allocationId}`);
    }

    if (allocation.status !== 'ACTIVE') {
      throw new BadRequestException('Allocation is not active');
    }

    // End the allocation
    const { data: updatedAllocation, error: updateError } = await this.supabase
      .from('room_allocations')
      .update({
        status: 'ENDED',
        ended_at: new Date().toISOString(),
        ended_by: endedBy,
        end_reason: dto.reason,
      })
      .eq('id', allocationId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to end allocation: ${updateError.message}`,
      );
    }

    // Update room occupancy
    const room = allocation.room;
    const newOccupancy = Math.max(0, room.current_occupancy - 1);
    const newStatus: RoomStatus = newOccupancy === 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED';

    await this.supabase
      .from('rooms')
      .update({
        current_occupancy: newOccupancy,
        status: newStatus,
      })
      .eq('id', room.id);

    await this.logAudit('ROOM_ALLOCATION', allocationId, 'END', endedBy, {
      reason: dto.reason,
    });

    return updatedAllocation;
  }

  /**
   * Transfer student to a different room
   */
  async transferRoom(
    allocationId: string,
    dto: TransferRoomDto,
    transferredBy: string,
  ): Promise<RoomAllocation> {
    // End current allocation
    await this.endAllocation(allocationId, { reason: `Transfer: ${dto.reason}` }, transferredBy);

    // Get the student from the old allocation
    const { data: oldAllocation } = await this.supabase
      .from('room_allocations')
      .select('student_user_id')
      .eq('id', allocationId)
      .single();

    if (!oldAllocation) {
      throw new NotFoundException('Original allocation not found');
    }

    // Update the old allocation status to TRANSFERRED
    await this.supabase
      .from('room_allocations')
      .update({ status: 'TRANSFERRED' })
      .eq('id', allocationId);

    // Create new allocation
    const newAllocation = await this.allocateRoom(
      dto.targetRoomId,
      {
        studentUserId: oldAllocation.student_user_id,
        bedNumber: dto.bedNumber,
      },
      transferredBy,
    );

    await this.logAudit('ROOM_ALLOCATION', newAllocation.id, 'TRANSFER', transferredBy, {
      from_allocation_id: allocationId,
      reason: dto.reason,
    });

    return newAllocation;
  }

  /**
   * Get student's current room allocation
   */
  async getStudentAllocation(studentUserId: string): Promise<RoomAllocation & { room: Room } | null> {
    const { data, error } = await this.supabase
      .from('room_allocations')
      .select('*, room:rooms!room_id(*)')
      .eq('student_user_id', studentUserId)
      .eq('status', 'ACTIVE')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No allocation found
      }
      throw new InternalServerErrorException(
        `Failed to get student allocation: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Get room availability summary by vertical
   */
  async getRoomAvailability(
    vertical?: string,
  ): Promise<{ vertical: string; total: number; available: number; occupied: number }[]> {
    let query = this.supabase
      .from('rooms')
      .select('vertical, status');

    if (vertical) {
      query = query.eq('vertical', vertical);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get room availability: ${error.message}`,
      );
    }

    // Group by vertical
    const summary: Record<string, { total: number; available: number; occupied: number }> = {};

    data?.forEach((room) => {
      if (!summary[room.vertical]) {
        summary[room.vertical] = { total: 0, available: 0, occupied: 0 };
      }
      summary[room.vertical].total++;
      if (room.status === 'AVAILABLE') {
        summary[room.vertical].available++;
      } else if (room.status === 'OCCUPIED') {
        summary[room.vertical].occupied++;
      }
    });

    return Object.entries(summary).map(([v, stats]) => ({
      vertical: v,
      ...stats,
    }));
  }

  /**
   * Log audit entry
   */
  private async logAudit(
    entityType: string,
    entityId: string,
    action: string,
    actorId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        action,
        actor_id: actorId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}
