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
  Application,
  ApplicationStatus,
  ApplicationListResult,
} from './applications.types';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
  ScheduleInterviewDto,
  ListApplicationsDto,
} from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Generate a unique tracking number
   * Format: HG-YYYY-NNNNN (e.g., HG-2024-00001)
   */
  private async generateTrackingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `HG-${year}-`;

    // Get the last tracking number for this year
    const { data, error } = await this.supabase
      .from('applications')
      .select('tracking_number')
      .like('tracking_number', `${prefix}%`)
      .order('tracking_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new InternalServerErrorException('Failed to generate tracking number');
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].tracking_number.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new application
   */
  async createApplication(
    dto: CreateApplicationDto,
    userId?: string,
  ): Promise<Application> {
    const trackingNumber = await this.generateTrackingNumber();

    const applicationRecord = {
      tracking_number: trackingNumber,
      type: dto.type,
      vertical: dto.vertical,
      applicant_mobile: dto.applicantMobile,
      student_user_id: userId || null,
      parent_application_id: dto.parentApplicationId || null,
      current_status: 'DRAFT' as ApplicationStatus,
      data: dto.data,
    };

    const { data, error } = await this.supabase
      .from('applications')
      .insert(applicationRecord)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create application: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId: string): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Application not found: ${applicationId}`);
    }

    return data;
  }

  /**
   * Get application by tracking number (for public tracking)
   */
  async getApplicationByTracking(
    trackingNumber: string,
    mobile: string,
  ): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .eq('applicant_mobile', mobile)
      .single();

    if (error || !data) {
      throw new NotFoundException('Application not found or mobile number does not match');
    }

    return data;
  }

  /**
   * Update application (for applicants - limited fields)
   */
  async updateApplication(
    applicationId: string,
    dto: UpdateApplicationDto,
    userId: string,
    userRole: string,
  ): Promise<Application> {
    const application = await this.getApplicationById(applicationId);

    // Check access permissions
    if (userRole === 'STUDENT') {
      if (application.student_user_id !== userId) {
        throw new ForbiddenException('You can only update your own applications');
      }
      if (!['DRAFT', 'SUBMITTED'].includes(application.current_status)) {
        throw new ForbiddenException('Cannot update application after review has started');
      }
    }

    const updateData: Partial<Application> = {};
    if (dto.data) {
      updateData.data = { ...application.data, ...dto.data };
    }
    if (dto.status) {
      updateData.current_status = dto.status;
    }

    const { data, error } = await this.supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update application: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Update application status (for staff)
   */
  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
    userId: string,
    userRole: string,
    userVertical?: string,
  ): Promise<Application> {
    const application = await this.getApplicationById(applicationId);

    // Superintendents can only update applications in their vertical
    if (userRole === 'SUPERINTENDENT' && userVertical !== application.vertical) {
      throw new ForbiddenException('You can only manage applications in your vertical');
    }

    const updateData: Partial<Application> = {
      current_status: dto.status,
    };

    if (dto.status === 'APPROVED') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = userId;
    } else if (dto.status === 'REJECTED') {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejected_by = userId;
      updateData.rejection_reason = dto.rejectionReason;
    }

    if (dto.interviewNotes) {
      updateData.interview_notes = dto.interviewNotes;
    }

    const { data, error } = await this.supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update application status: ${error.message}`,
      );
    }

    // Log the status change to audit_logs
    await this.logStatusChange(applicationId, dto.status, userId, userRole);

    return data;
  }

  /**
   * Schedule interview for application
   */
  async scheduleInterview(
    applicationId: string,
    dto: ScheduleInterviewDto,
    userId: string,
    userRole: string,
    userVertical?: string,
  ): Promise<Application> {
    const application = await this.getApplicationById(applicationId);

    // Superintendents can only schedule interviews for their vertical
    if (userRole === 'SUPERINTENDENT' && userVertical !== application.vertical) {
      throw new ForbiddenException('You can only manage applications in your vertical');
    }

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(application.current_status)) {
      throw new BadRequestException('Cannot schedule interview for this application status');
    }

    const updateData = {
      current_status: 'INTERVIEW_SCHEDULED' as ApplicationStatus,
      interview_scheduled_at: dto.scheduledAt,
      interview_mode: dto.mode,
      interview_notes: dto.notes || application.interview_notes,
    };

    const { data, error } = await this.supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to schedule interview: ${error.message}`,
      );
    }

    // Log the interview scheduling
    await this.logStatusChange(applicationId, 'INTERVIEW_SCHEDULED', userId, userRole);

    return data;
  }

  /**
   * List applications with filters
   */
  async listApplications(
    filters: ListApplicationsDto,
    userId: string,
    userRole: string,
    userVertical?: string,
  ): Promise<ApplicationListResult> {
    let query = this.supabase.from('applications').select('*', { count: 'exact' });

    // Role-based filtering
    if (userRole === 'STUDENT') {
      query = query.eq('student_user_id', userId);
    } else if (userRole === 'SUPERINTENDENT') {
      query = query.eq('vertical', userVertical);
    } else if (userRole === 'PARENT') {
      // Parents need to be handled via applicant_mobile relationship
      // This is a simplified version - in production, use the parent relationship
      query = query.eq('student_user_id', userId);
    }
    // TRUSTEE and ACCOUNTS can see all applications

    // Apply filters
    if (filters.vertical) {
      query = query.eq('vertical', filters.vertical);
    }
    if (filters.status) {
      query = query.eq('current_status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list applications: ${error.message}`,
      );
    }

    return {
      applications: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Get applications by status for dashboard
   */
  async getApplicationStats(
    userRole: string,
    userVertical?: string,
  ): Promise<Record<string, number>> {
    let query = this.supabase.from('applications').select('current_status');

    if (userRole === 'SUPERINTENDENT' && userVertical) {
      query = query.eq('vertical', userVertical);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get application stats: ${error.message}`,
      );
    }

    const stats: Record<string, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      INTERVIEW_SCHEDULED: 0,
      APPROVED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    };

    if (data) {
      data.forEach((app) => {
        if (stats[app.current_status] !== undefined) {
          stats[app.current_status]++;
        }
      });
    }

    return stats;
  }

  /**
   * Log status change to audit logs
   */
  private async logStatusChange(
    applicationId: string,
    newStatus: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        entity_type: 'APPLICATION',
        entity_id: applicationId,
        action: 'STATUS_CHANGE',
        actor_id: actorId,
        actor_role: actorRole,
        metadata: {
          new_status: newStatus,
        },
      });
    } catch (error) {
      // Don't throw on audit log failure
      console.error('Failed to log status change:', error);
    }
  }
}
