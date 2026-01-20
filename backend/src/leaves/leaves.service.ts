import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  LeaveRequest,
  LeaveStatus,
  LeaveListResult,
  LeaveStats,
} from './leaves.types';
import {
  CreateLeaveRequestDto,
  UpdateLeaveStatusDto,
  RecordCheckoutDto,
  RecordReturnDto,
  CancelLeaveDto,
  ListLeavesDto,
} from './dto/leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Create a new leave request
   */
  async createLeaveRequest(
    dto: CreateLeaveRequestDto,
    studentUserId: string,
  ): Promise<LeaveRequest> {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping leave requests
    const { data: existingLeaves } = await this.supabase
      .from('leave_requests')
      .select('id')
      .eq('student_user_id', studentUserId)
      .in('status', ['PENDING', 'APPROVED', 'CHECKED_OUT'])
      .or(`start_date.lte.${dto.endDate},end_date.gte.${dto.startDate}`);

    if (existingLeaves && existingLeaves.length > 0) {
      throw new BadRequestException(
        'You have an overlapping leave request for these dates',
      );
    }

    const leaveRecord = {
      student_user_id: studentUserId,
      leave_type: dto.leaveType,
      reason: dto.reason,
      start_date: dto.startDate,
      end_date: dto.endDate,
      destination: dto.destination,
      destination_address: dto.destinationAddress || null,
      emergency_contact: dto.emergencyContact,
      status: 'PENDING' as LeaveStatus,
      applied_at: new Date().toISOString(),
      parent_notified: false,
      notes: dto.notes || null,
    };

    const { data, error } = await this.supabase
      .from('leave_requests')
      .insert(leaveRecord)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create leave request: ${error.message}`,
      );
    }

    // Log the leave request
    await this.logAudit('LEAVE_REQUEST', data.id, 'CREATE', studentUserId, {
      leave_type: dto.leaveType,
      start_date: dto.startDate,
      end_date: dto.endDate,
    });

    return data;
  }

  /**
   * Get leave request by ID
   */
  async getLeaveById(leaveId: string): Promise<LeaveRequest> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Leave request not found: ${leaveId}`);
    }

    return data;
  }

  /**
   * List leave requests with filters
   */
  async listLeaves(
    filters: ListLeavesDto,
    userId: string,
    userRole: string,
  ): Promise<LeaveListResult> {
    let query = this.supabase.from('leave_requests').select('*', { count: 'exact' });

    // Role-based filtering
    if (userRole === 'STUDENT') {
      query = query.eq('student_user_id', userId);
    } else if (filters.studentUserId) {
      query = query.eq('student_user_id', filters.studentUserId);
    }

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.leaveType) {
      query = query.eq('leave_type', filters.leaveType);
    }
    if (filters.startDateFrom) {
      query = query.gte('start_date', filters.startDateFrom);
    }
    if (filters.startDateTo) {
      query = query.lte('start_date', filters.startDateTo);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('applied_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list leave requests: ${error.message}`,
      );
    }

    return {
      leaves: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Update leave request status (approve/reject)
   */
  async updateLeaveStatus(
    leaveId: string,
    dto: UpdateLeaveStatusDto,
    updatedBy: string,
    userRole: string,
  ): Promise<LeaveRequest> {
    const leave = await this.getLeaveById(leaveId);

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Can only approve/reject pending leave requests');
    }

    if (dto.status === 'REJECTED' && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const updateData: Partial<LeaveRequest> = {
      status: dto.status,
    };

    if (dto.status === 'APPROVED') {
      updateData.approved_by = updatedBy;
      updateData.approved_at = new Date().toISOString();
    } else {
      updateData.rejected_by = updatedBy;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = dto.rejectionReason;
    }

    const { data, error } = await this.supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update leave status: ${error.message}`,
      );
    }

    // Log the status change
    await this.logAudit('LEAVE_REQUEST', leaveId, 'STATUS_CHANGE', updatedBy, {
      new_status: dto.status,
      actor_role: userRole,
    });

    // TODO: Trigger parent notification if approved

    return data;
  }

  /**
   * Record checkout for approved leave
   */
  async recordCheckout(
    leaveId: string,
    dto: RecordCheckoutDto,
    recordedBy: string,
  ): Promise<LeaveRequest> {
    const leave = await this.getLeaveById(leaveId);

    if (leave.status !== 'APPROVED') {
      throw new BadRequestException('Can only checkout for approved leave requests');
    }

    const updateData: Partial<LeaveRequest> = {
      status: 'CHECKED_OUT',
      checkout_at: new Date().toISOString(),
    };

    if (dto.notes) {
      updateData.notes = leave.notes
        ? `${leave.notes}\nCheckout: ${dto.notes}`
        : `Checkout: ${dto.notes}`;
    }

    const { data, error } = await this.supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to record checkout: ${error.message}`,
      );
    }

    await this.logAudit('LEAVE_REQUEST', leaveId, 'CHECKOUT', recordedBy, {});

    return data;
  }

  /**
   * Record return from leave
   */
  async recordReturn(
    leaveId: string,
    dto: RecordReturnDto,
    recordedBy: string,
  ): Promise<LeaveRequest> {
    const leave = await this.getLeaveById(leaveId);

    if (leave.status !== 'CHECKED_OUT') {
      throw new BadRequestException('Can only record return for checked-out leave requests');
    }

    const updateData: Partial<LeaveRequest> = {
      status: 'RETURNED',
      return_at: new Date().toISOString(),
    };

    if (dto.notes) {
      updateData.notes = leave.notes
        ? `${leave.notes}\nReturn: ${dto.notes}`
        : `Return: ${dto.notes}`;
    }

    const { data, error } = await this.supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to record return: ${error.message}`,
      );
    }

    await this.logAudit('LEAVE_REQUEST', leaveId, 'RETURN', recordedBy, {});

    return data;
  }

  /**
   * Cancel a leave request
   */
  async cancelLeave(
    leaveId: string,
    dto: CancelLeaveDto,
    cancelledBy: string,
    userRole: string,
  ): Promise<LeaveRequest> {
    const leave = await this.getLeaveById(leaveId);

    // Students can only cancel their own pending/approved leaves
    if (userRole === 'STUDENT') {
      if (leave.student_user_id !== cancelledBy) {
        throw new ForbiddenException('You can only cancel your own leave requests');
      }
      if (!['PENDING', 'APPROVED'].includes(leave.status)) {
        throw new BadRequestException('Cannot cancel leave request in current status');
      }
    }

    const updateData: Partial<LeaveRequest> = {
      status: 'CANCELLED',
      notes: leave.notes
        ? `${leave.notes}\nCancelled: ${dto.reason}`
        : `Cancelled: ${dto.reason}`,
    };

    const { data, error } = await this.supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to cancel leave request: ${error.message}`,
      );
    }

    await this.logAudit('LEAVE_REQUEST', leaveId, 'CANCEL', cancelledBy, {
      reason: dto.reason,
    });

    return data;
  }

  /**
   * Get student's leave requests
   */
  async getStudentLeaves(studentUserId: string): Promise<LeaveRequest[]> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('student_user_id', studentUserId)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get student leaves: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Get leave statistics for dashboard
   */
  async getLeaveStats(_userRole: string): Promise<LeaveStats> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('status, applied_at');

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get leave stats: ${error.message}`,
      );
    }

    const stats: LeaveStats = {
      pending: 0,
      approved: 0,
      checkedOut: 0,
      returned: 0,
      totalThisMonth: 0,
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    data?.forEach((leave) => {
      switch (leave.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'APPROVED':
          stats.approved++;
          break;
        case 'CHECKED_OUT':
          stats.checkedOut++;
          break;
        case 'RETURNED':
          stats.returned++;
          break;
      }

      if (new Date(leave.applied_at) >= startOfMonth) {
        stats.totalThisMonth++;
      }
    });

    return stats;
  }

  /**
   * Get pending leaves for superintendent dashboard
   */
  async getPendingLeaves(): Promise<LeaveRequest[]> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('applied_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get pending leaves: ${error.message}`,
      );
    }

    return data || [];
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
