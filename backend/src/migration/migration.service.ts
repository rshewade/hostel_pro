import { Injectable, Inject, Logger } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  DbJson,
  MigrationResult,
  MigrationError,
} from './db-json.types';
import * as crypto from 'crypto';

const BATCH_SIZE = 100;

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Migrate all data from db.json to Supabase
   */
  async migrateData(dbJson: DbJson): Promise<MigrationResult> {
    const startedAt = new Date().toISOString();
    const errors: MigrationError[] = [];
    const recordCounts: Record<string, { attempted: number; inserted: number; failed: number }> = {};
    const migratedTables: string[] = [];

    this.logger.log('Starting data migration...');

    try {
      // Migrate in order to respect foreign key constraints
      // 1. Users (no dependencies)
      await this.migrateUsers(dbJson.users, recordCounts, errors);
      migratedTables.push('users');

      // 2. Rooms (no dependencies)
      await this.migrateRooms(dbJson.rooms, recordCounts, errors);
      migratedTables.push('rooms');

      // 3. Students (depends on users)
      await this.migrateStudents(dbJson.students, recordCounts, errors);
      migratedTables.push('students');

      // 4. Applications (may reference users)
      await this.migrateApplications(dbJson.applications, recordCounts, errors);
      migratedTables.push('applications');

      // 5. Documents (depends on students, applications)
      await this.migrateDocuments(dbJson.documents, recordCounts, errors);
      migratedTables.push('documents');

      // 6. Room Allocations (depends on students, rooms)
      await this.migrateAllocations(dbJson.allocations, recordCounts, errors);
      migratedTables.push('room_allocations');

      // 7. Leave Requests (depends on students)
      await this.migrateLeaves(dbJson.leaves, recordCounts, errors);
      migratedTables.push('leave_requests');

      // 8. Fees/Payments (depends on students)
      await this.migrateFees(dbJson.fees, recordCounts, errors);
      migratedTables.push('payments');

      // 9. Renewals (depends on students)
      await this.migrateRenewals(dbJson.renewals, recordCounts, errors);
      migratedTables.push('renewals');

      // 10. Audit Logs (may reference users)
      await this.migrateAuditLogs(dbJson.auditLogs, recordCounts, errors);
      migratedTables.push('audit_logs');

    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      errors.push({ table: 'general', recordId: 'N/A', error: error.message });
    }

    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

    const result: MigrationResult = {
      success: errors.length === 0,
      migratedTables,
      recordCounts,
      errors,
      startedAt,
      completedAt,
      durationMs,
    };

    this.logger.log(`Migration completed in ${durationMs}ms with ${errors.length} errors`);
    return result;
  }

  /**
   * Migrate users to Supabase
   */
  private async migrateUsers(
    users: DbJson['users'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${users.length} users...`);
    counts['users'] = { attempted: users.length, inserted: 0, failed: 0 };

    const batches = this.chunk(users, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(user => ({
        id: this.ensureUuid(user.id),
        email: user.email,
        mobile: user.mobile_no,
        full_name: user.full_name || null,
        role: user.role.toUpperCase(),
        vertical: user.vertical || null,
        status: user.status || 'ACTIVE',
        photo_url: user.photo_url || null,
        dpdp_consent: user.dpdp_consent || false,
        created_at: user.created_at,
        updated_at: user.created_at,
      }));

      const { error } = await this.supabase
        .from('users')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate users batch: ${error.message}`);
        counts['users'].failed += batch.length;
        batch.forEach(u => errors.push({ table: 'users', recordId: u.id, error: error.message }));
      } else {
        counts['users'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate rooms to Supabase
   */
  private async migrateRooms(
    rooms: DbJson['rooms'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${rooms.length} rooms...`);
    counts['rooms'] = { attempted: rooms.length, inserted: 0, failed: 0 };

    const batches = this.chunk(rooms, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(room => ({
        id: this.ensureUuid(room.id),
        vertical: room.vertical,
        floor: room.floor,
        room_number: room.room_number,
        room_type: room.room_type || 'STANDARD',
        capacity: room.capacity,
        occupied: room.occupied || 0,
        amenities: room.amenities || [],
        status: room.status || 'AVAILABLE',
        base_rent: room.base_rent || 0,
        created_at: room.created_at,
        updated_at: room.created_at,
      }));

      const { error } = await this.supabase
        .from('rooms')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate rooms batch: ${error.message}`);
        counts['rooms'].failed += batch.length;
        batch.forEach(r => errors.push({ table: 'rooms', recordId: r.id, error: error.message }));
      } else {
        counts['rooms'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate students to Supabase users table (students are users with role=STUDENT)
   * And create entries in the students-specific fields
   */
  private async migrateStudents(
    students: DbJson['students'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${students.length} students...`);
    counts['students'] = { attempted: students.length, inserted: 0, failed: 0 };

    const batches = this.chunk(students, BATCH_SIZE);
    for (const batch of batches) {
      // Students are stored in users table with additional student fields
      const records = batch.map(student => ({
        id: this.ensureUuid(student.user_id || student.id),
        email: student.email,
        mobile: student.mobile,
        full_name: student.full_name,
        role: 'STUDENT',
        vertical: student.vertical,
        status: student.status || 'ACTIVE',
        photo_url: student.photo_url || null,
        parent_name: student.parent_name || null,
        parent_mobile: student.parent_mobile || null,
        date_of_birth: student.date_of_birth || null,
        gender: student.gender || null,
        blood_group: student.blood_group || null,
        permanent_address: student.permanent_address || null,
        emergency_contact: student.emergency_contact || null,
        local_guardian_name: student.local_guardian_name || null,
        local_guardian_mobile: student.local_guardian_mobile || null,
        local_guardian_address: student.local_guardian_address || null,
        course: student.course || null,
        institution: student.institution || null,
        year_of_study: student.year_of_study || null,
        admission_date: student.admission_date || null,
        current_session_start: student.current_session_start || null,
        current_session_end: student.current_session_end || null,
        room_id: student.room_id ? this.ensureUuid(student.room_id) : null,
        bed_number: student.bed_number || null,
        dpdp_consent: true,
        created_at: student.created_at,
        updated_at: student.updated_at || student.created_at,
      }));

      const { error } = await this.supabase
        .from('users')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate students batch: ${error.message}`);
        counts['students'].failed += batch.length;
        batch.forEach(s => errors.push({ table: 'students', recordId: s.id, error: error.message }));
      } else {
        counts['students'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate applications to Supabase
   */
  private async migrateApplications(
    applications: DbJson['applications'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${applications.length} applications...`);
    counts['applications'] = { attempted: applications.length, inserted: 0, failed: 0 };

    const batches = this.chunk(applications, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(app => ({
        id: this.ensureUuid(app.id),
        tracking_number: app.tracking_number,
        type: app.type || 'NEW',
        vertical: app.vertical,
        applicant_name: app.applicant_name,
        applicant_mobile: app.applicant_mobile,
        applicant_email: app.applicant_email || null,
        data: app.application_data || {},
        current_status: app.current_status || 'DRAFT',
        status_history: app.status_history || [],
        assigned_superintendent: app.assigned_superintendent ? this.ensureUuid(app.assigned_superintendent) : null,
        student_user_id: app.student_user_id ? this.ensureUuid(app.student_user_id) : null,
        parent_application_id: app.parent_application_id ? this.ensureUuid(app.parent_application_id) : null,
        interview_date: app.interview_schedule?.date || null,
        interview_time: app.interview_schedule?.time || null,
        interview_venue: app.interview_schedule?.venue || null,
        remarks: app.remarks || null,
        created_at: app.created_at,
        updated_at: app.updated_at || app.created_at,
      }));

      const { error } = await this.supabase
        .from('applications')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate applications batch: ${error.message}`);
        counts['applications'].failed += batch.length;
        batch.forEach(a => errors.push({ table: 'applications', recordId: a.id, error: error.message }));
      } else {
        counts['applications'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate documents to Supabase
   */
  private async migrateDocuments(
    documents: DbJson['documents'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${documents.length} documents...`);
    counts['documents'] = { attempted: documents.length, inserted: 0, failed: 0 };

    const batches = this.chunk(documents, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(doc => ({
        id: this.ensureUuid(doc.id),
        student_user_id: doc.student_id ? this.ensureUuid(doc.student_id) : null,
        application_id: doc.application_id ? this.ensureUuid(doc.application_id) : null,
        document_type: doc.type,
        file_name: doc.name,
        storage_url: doc.file_url,
        file_size: doc.file_size || null,
        mime_type: doc.mime_type || 'application/octet-stream',
        verification_status: doc.verification_status || 'PENDING',
        verified_by: doc.verified_by ? this.ensureUuid(doc.verified_by) : null,
        verified_at: doc.verified_at || null,
        rejection_reason: doc.rejection_reason || null,
        uploaded_by: doc.uploaded_by ? this.ensureUuid(doc.uploaded_by) : null,
        created_at: doc.created_at,
        updated_at: doc.created_at,
      }));

      const { error } = await this.supabase
        .from('documents')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate documents batch: ${error.message}`);
        counts['documents'].failed += batch.length;
        batch.forEach(d => errors.push({ table: 'documents', recordId: d.id, error: error.message }));
      } else {
        counts['documents'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate room allocations to Supabase
   */
  private async migrateAllocations(
    allocations: DbJson['allocations'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${allocations.length} room allocations...`);
    counts['room_allocations'] = { attempted: allocations.length, inserted: 0, failed: 0 };

    const batches = this.chunk(allocations, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(alloc => ({
        id: this.ensureUuid(alloc.id),
        student_user_id: this.ensureUuid(alloc.student_id),
        room_id: this.ensureUuid(alloc.room_id),
        bed_number: alloc.bed_number,
        allocated_at: alloc.allocated_at,
        valid_from: alloc.valid_from,
        valid_until: alloc.valid_until || null,
        status: alloc.status || 'ACTIVE',
        allocated_by: alloc.allocated_by ? this.ensureUuid(alloc.allocated_by) : null,
        remarks: alloc.remarks || null,
        created_at: alloc.created_at,
        updated_at: alloc.created_at,
      }));

      const { error } = await this.supabase
        .from('room_allocations')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate allocations batch: ${error.message}`);
        counts['room_allocations'].failed += batch.length;
        batch.forEach(a => errors.push({ table: 'room_allocations', recordId: a.id, error: error.message }));
      } else {
        counts['room_allocations'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate leave requests to Supabase
   */
  private async migrateLeaves(
    leaves: DbJson['leaves'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${leaves.length} leave requests...`);
    counts['leave_requests'] = { attempted: leaves.length, inserted: 0, failed: 0 };

    const batches = this.chunk(leaves, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(leave => ({
        id: this.ensureUuid(leave.id),
        student_user_id: this.ensureUuid(leave.student_id),
        leave_type: leave.leave_type || 'REGULAR',
        start_date: leave.start_date,
        end_date: leave.end_date,
        reason: leave.reason,
        emergency_contact: leave.emergency_contact || null,
        destination: leave.destination || null,
        status: leave.status || 'PENDING',
        applied_at: leave.applied_at || leave.created_at,
        reviewed_by: leave.reviewed_by ? this.ensureUuid(leave.reviewed_by) : null,
        reviewed_at: leave.reviewed_at || null,
        review_remarks: leave.review_remarks || null,
        checkout_at: leave.checkout_at || null,
        checkin_at: leave.checkin_at || null,
        created_at: leave.created_at,
        updated_at: leave.created_at,
      }));

      const { error } = await this.supabase
        .from('leave_requests')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate leaves batch: ${error.message}`);
        counts['leave_requests'].failed += batch.length;
        batch.forEach(l => errors.push({ table: 'leave_requests', recordId: l.id, error: error.message }));
      } else {
        counts['leave_requests'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate fees to Supabase payments table
   */
  private async migrateFees(
    fees: DbJson['fees'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${fees.length} fees/payments...`);
    counts['payments'] = { attempted: fees.length, inserted: 0, failed: 0 };

    const batches = this.chunk(fees, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(fee => ({
        id: this.ensureUuid(fee.id),
        student_user_id: this.ensureUuid(fee.student_id),
        fee_type: fee.fee_type || 'OTHER',
        description: fee.description || '',
        amount: fee.amount,
        due_date: fee.due_date,
        status: fee.status || 'PENDING',
        paid_amount: fee.paid_amount || 0,
        paid_at: fee.paid_at || null,
        transaction_id: fee.transaction_id || null,
        session: fee.session || null,
        created_at: fee.created_at,
        updated_at: fee.created_at,
      }));

      const { error } = await this.supabase
        .from('payments')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate fees batch: ${error.message}`);
        counts['payments'].failed += batch.length;
        batch.forEach(f => errors.push({ table: 'payments', recordId: f.id, error: error.message }));
      } else {
        counts['payments'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate renewals to Supabase
   */
  private async migrateRenewals(
    renewals: DbJson['renewals'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${renewals.length} renewals...`);
    counts['renewals'] = { attempted: renewals.length, inserted: 0, failed: 0 };

    const batches = this.chunk(renewals, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(renewal => ({
        id: this.ensureUuid(renewal.id),
        student_user_id: this.ensureUuid(renewal.student_id),
        session_start: renewal.session_start,
        session_end: renewal.session_end,
        status: renewal.status || 'PENDING',
        application_id: renewal.application_id ? this.ensureUuid(renewal.application_id) : null,
        fee_id: renewal.fee_id ? this.ensureUuid(renewal.fee_id) : null,
        renewed_at: renewal.renewed_at || null,
        reviewed_by: renewal.reviewed_by ? this.ensureUuid(renewal.reviewed_by) : null,
        remarks: renewal.remarks || null,
        created_at: renewal.created_at,
        updated_at: renewal.created_at,
      }));

      const { error } = await this.supabase
        .from('renewals')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate renewals batch: ${error.message}`);
        counts['renewals'].failed += batch.length;
        batch.forEach(r => errors.push({ table: 'renewals', recordId: r.id, error: error.message }));
      } else {
        counts['renewals'].inserted += batch.length;
      }
    }
  }

  /**
   * Migrate audit logs to Supabase
   */
  private async migrateAuditLogs(
    auditLogs: DbJson['auditLogs'],
    counts: Record<string, { attempted: number; inserted: number; failed: number }>,
    errors: MigrationError[],
  ): Promise<void> {
    this.logger.log(`Migrating ${auditLogs.length} audit logs...`);
    counts['audit_logs'] = { attempted: auditLogs.length, inserted: 0, failed: 0 };

    const batches = this.chunk(auditLogs, BATCH_SIZE);
    for (const batch of batches) {
      const records = batch.map(log => ({
        id: this.ensureUuid(log.id),
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        action: log.action,
        actor_id: log.actor_id ? this.ensureUuid(log.actor_id) : null,
        actor_role: log.actor_role || null,
        metadata: log.metadata || {},
        ip_address: log.ip_address || null,
        created_at: log.created_at,
      }));

      const { error } = await this.supabase
        .from('audit_logs')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        this.logger.error(`Failed to migrate audit logs batch: ${error.message}`);
        counts['audit_logs'].failed += batch.length;
        batch.forEach(l => errors.push({ table: 'audit_logs', recordId: l.id, error: error.message }));
      } else {
        counts['audit_logs'].inserted += batch.length;
      }
    }
  }

  /**
   * Convert string ID to UUID format
   * For IDs that are already UUIDs, return as-is
   * For other IDs (like "u1", "STU001"), generate a deterministic UUID
   */
  private ensureUuid(id: string): string {
    // Check if already a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      return id;
    }

    // Generate deterministic UUID from string ID
    const hash = crypto.createHash('md5').update(id).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }

  /**
   * Split array into chunks
   */
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
