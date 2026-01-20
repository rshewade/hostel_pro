import { Injectable, Logger } from '@nestjs/common';
import {
  DbJson,
  DbJsonUser,
  DbJsonStudent,
  DbJsonApplication,
  DbJsonDocument,
  DbJsonRoom,
  DbJsonAllocation,
  DbJsonLeave,
  DbJsonFee,
  DbJsonTransaction,
  DbJsonRenewal,
  DbJsonExitRequest,
  DbJsonAuditLog,
  ValidationReport,
  ValidationError,
  ValidationWarning,
} from './db-json.types';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  /**
   * Validate entire db.json data before migration
   */
  async validateData(dbJson: DbJson): Promise<ValidationReport> {
    this.logger.log('Starting data validation...');

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const summary: Record<string, { total: number; valid: number; invalid: number }> = {};

    // Validate each collection
    this.validateUsers(dbJson.users, errors, warnings, summary);
    this.validateStudents(dbJson.students, dbJson.users, errors, warnings, summary);
    this.validateApplications(dbJson.applications, errors, warnings, summary);
    this.validateDocuments(dbJson.documents, dbJson.students, dbJson.applications, errors, warnings, summary);
    this.validateRooms(dbJson.rooms, errors, warnings, summary);
    this.validateAllocations(dbJson.allocations, dbJson.students, dbJson.rooms, errors, warnings, summary);
    this.validateLeaves(dbJson.leaves, dbJson.students, errors, warnings, summary);
    this.validateFees(dbJson.fees, dbJson.students, errors, warnings, summary);
    this.validateTransactions(dbJson.transactions, dbJson.fees, errors, warnings, summary);
    this.validateRenewals(dbJson.renewals, dbJson.students, errors, warnings, summary);
    this.validateExitRequests(dbJson.exitRequests, dbJson.students, errors, warnings, summary);
    this.validateAuditLogs(dbJson.auditLogs, errors, warnings, summary);

    // Calculate totals
    let totalRecords = 0;
    let validRecords = 0;
    let invalidRecords = 0;

    for (const table of Object.keys(summary)) {
      totalRecords += summary[table].total;
      validRecords += summary[table].valid;
      invalidRecords += summary[table].invalid;
    }

    const report: ValidationReport = {
      isValid: invalidRecords === 0,
      totalRecords,
      validRecords,
      invalidRecords,
      errors,
      warnings,
      summary,
    };

    this.logger.log(`Validation complete: ${validRecords}/${totalRecords} valid records`);
    if (errors.length > 0) {
      this.logger.warn(`Found ${errors.length} validation errors`);
    }

    return report;
  }

  private validateUsers(
    users: DbJsonUser[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;

    for (const user of users) {
      let isValid = true;

      // Required fields
      if (!user.id) {
        errors.push({ table: 'users', recordId: user.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!user.email) {
        errors.push({ table: 'users', recordId: user.id, field: 'email', message: 'Missing required field' });
        isValid = false;
      }
      if (!user.role) {
        errors.push({ table: 'users', recordId: user.id, field: 'role', message: 'Missing required field' });
        isValid = false;
      }
      if (!user.mobile_no) {
        errors.push({ table: 'users', recordId: user.id, field: 'mobile_no', message: 'Missing required field' });
        isValid = false;
      }

      // Email format validation
      if (user.email && !this.isValidEmail(user.email)) {
        errors.push({ table: 'users', recordId: user.id, field: 'email', message: 'Invalid email format', value: user.email });
        isValid = false;
      }

      // Role validation
      const validRoles = ['student', 'superintendent', 'trustee', 'accounts', 'parent'];
      if (user.role && !validRoles.includes(user.role.toLowerCase())) {
        errors.push({ table: 'users', recordId: user.id, field: 'role', message: 'Invalid role', value: user.role });
        isValid = false;
      }

      // Vertical validation for superintendent
      if (user.role === 'superintendent' && !user.vertical) {
        warnings.push({ table: 'users', recordId: user.id, field: 'vertical', message: 'Superintendent without vertical' });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['users'] = { total: users.length, valid, invalid };
  }

  private validateStudents(
    students: DbJsonStudent[],
    users: DbJsonUser[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const userIds = new Set(users.map(u => u.id));

    for (const student of students) {
      let isValid = true;

      // Required fields
      if (!student.id) {
        errors.push({ table: 'students', recordId: student.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!student.full_name) {
        errors.push({ table: 'students', recordId: student.id, field: 'full_name', message: 'Missing required field' });
        isValid = false;
      }
      if (!student.vertical) {
        errors.push({ table: 'students', recordId: student.id, field: 'vertical', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity - user_id should exist in users
      if (student.user_id && !userIds.has(student.user_id)) {
        warnings.push({ table: 'students', recordId: student.id, field: 'user_id', message: `Referenced user ${student.user_id} not found` });
      }

      // Date validation
      if (student.date_of_birth && !this.isValidDate(student.date_of_birth)) {
        errors.push({ table: 'students', recordId: student.id, field: 'date_of_birth', message: 'Invalid date format', value: student.date_of_birth });
        isValid = false;
      }

      // Vertical validation
      const validVerticals = ['BOYS_HOSTEL', 'GIRLS_ASHRAM', 'DHARAMSHALA'];
      if (student.vertical && !validVerticals.includes(student.vertical)) {
        errors.push({ table: 'students', recordId: student.id, field: 'vertical', message: 'Invalid vertical', value: student.vertical });
        isValid = false;
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['students'] = { total: students.length, valid, invalid };
  }

  private validateApplications(
    applications: DbJsonApplication[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;

    for (const app of applications) {
      let isValid = true;

      // Required fields
      if (!app.id) {
        errors.push({ table: 'applications', recordId: app.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!app.tracking_number) {
        errors.push({ table: 'applications', recordId: app.id, field: 'tracking_number', message: 'Missing required field' });
        isValid = false;
      }
      if (!app.applicant_mobile) {
        errors.push({ table: 'applications', recordId: app.id, field: 'applicant_mobile', message: 'Missing required field' });
        isValid = false;
      }
      if (!app.vertical) {
        errors.push({ table: 'applications', recordId: app.id, field: 'vertical', message: 'Missing required field' });
        isValid = false;
      }

      // Status validation
      const validStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
      if (app.current_status && !validStatuses.includes(app.current_status)) {
        warnings.push({ table: 'applications', recordId: app.id, field: 'current_status', message: `Unusual status: ${app.current_status}` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['applications'] = { total: applications.length, valid, invalid };
  }

  private validateDocuments(
    documents: DbJsonDocument[],
    students: DbJsonStudent[],
    applications: DbJsonApplication[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));
    const applicationIds = new Set(applications.map(a => a.id));

    for (const doc of documents) {
      let isValid = true;

      // Required fields
      if (!doc.id) {
        errors.push({ table: 'documents', recordId: doc.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!doc.type) {
        errors.push({ table: 'documents', recordId: doc.id, field: 'type', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (doc.student_id && !studentIds.has(doc.student_id)) {
        warnings.push({ table: 'documents', recordId: doc.id, field: 'student_id', message: `Referenced student ${doc.student_id} not found` });
      }
      if (doc.application_id && !applicationIds.has(doc.application_id)) {
        warnings.push({ table: 'documents', recordId: doc.id, field: 'application_id', message: `Referenced application ${doc.application_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['documents'] = { total: documents.length, valid, invalid };
  }

  private validateRooms(
    rooms: DbJsonRoom[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;

    for (const room of rooms) {
      let isValid = true;

      // Required fields
      if (!room.id) {
        errors.push({ table: 'rooms', recordId: room.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!room.room_number) {
        errors.push({ table: 'rooms', recordId: room.id, field: 'room_number', message: 'Missing required field' });
        isValid = false;
      }
      if (!room.vertical) {
        errors.push({ table: 'rooms', recordId: room.id, field: 'vertical', message: 'Missing required field' });
        isValid = false;
      }

      // Capacity validation
      if (room.capacity !== undefined && room.capacity < 0) {
        errors.push({ table: 'rooms', recordId: room.id, field: 'capacity', message: 'Capacity cannot be negative', value: room.capacity });
        isValid = false;
      }
      if (room.occupied !== undefined && room.occupied < 0) {
        errors.push({ table: 'rooms', recordId: room.id, field: 'occupied', message: 'Occupied cannot be negative', value: room.occupied });
        isValid = false;
      }
      if (room.occupied !== undefined && room.capacity !== undefined && room.occupied > room.capacity) {
        warnings.push({ table: 'rooms', recordId: room.id, field: 'occupied', message: 'Occupied exceeds capacity' });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['rooms'] = { total: rooms.length, valid, invalid };
  }

  private validateAllocations(
    allocations: DbJsonAllocation[],
    students: DbJsonStudent[],
    rooms: DbJsonRoom[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));
    const roomIds = new Set(rooms.map(r => r.id));

    for (const allocation of allocations) {
      let isValid = true;

      // Required fields
      if (!allocation.id) {
        errors.push({ table: 'allocations', recordId: allocation.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!allocation.student_id) {
        errors.push({ table: 'allocations', recordId: allocation.id, field: 'student_id', message: 'Missing required field' });
        isValid = false;
      }
      if (!allocation.room_id) {
        errors.push({ table: 'allocations', recordId: allocation.id, field: 'room_id', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (allocation.student_id && !studentIds.has(allocation.student_id)) {
        warnings.push({ table: 'allocations', recordId: allocation.id, field: 'student_id', message: `Referenced student ${allocation.student_id} not found` });
      }
      if (allocation.room_id && !roomIds.has(allocation.room_id)) {
        warnings.push({ table: 'allocations', recordId: allocation.id, field: 'room_id', message: `Referenced room ${allocation.room_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['allocations'] = { total: allocations.length, valid, invalid };
  }

  private validateLeaves(
    leaves: DbJsonLeave[],
    students: DbJsonStudent[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));

    for (const leave of leaves) {
      let isValid = true;

      // Required fields
      if (!leave.id) {
        errors.push({ table: 'leaves', recordId: leave.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!leave.student_id) {
        errors.push({ table: 'leaves', recordId: leave.id, field: 'student_id', message: 'Missing required field' });
        isValid = false;
      }
      if (!leave.start_date) {
        errors.push({ table: 'leaves', recordId: leave.id, field: 'start_date', message: 'Missing required field' });
        isValid = false;
      }
      if (!leave.end_date) {
        errors.push({ table: 'leaves', recordId: leave.id, field: 'end_date', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (leave.student_id && !studentIds.has(leave.student_id)) {
        warnings.push({ table: 'leaves', recordId: leave.id, field: 'student_id', message: `Referenced student ${leave.student_id} not found` });
      }

      // Date validation
      if (leave.start_date && leave.end_date && new Date(leave.start_date) > new Date(leave.end_date)) {
        errors.push({ table: 'leaves', recordId: leave.id, field: 'end_date', message: 'End date before start date' });
        isValid = false;
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['leaves'] = { total: leaves.length, valid, invalid };
  }

  private validateFees(
    fees: DbJsonFee[],
    students: DbJsonStudent[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));

    for (const fee of fees) {
      let isValid = true;

      // Required fields
      if (!fee.id) {
        errors.push({ table: 'fees', recordId: fee.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!fee.student_id) {
        errors.push({ table: 'fees', recordId: fee.id, field: 'student_id', message: 'Missing required field' });
        isValid = false;
      }
      if (fee.amount === undefined || fee.amount === null) {
        errors.push({ table: 'fees', recordId: fee.id, field: 'amount', message: 'Missing required field' });
        isValid = false;
      }

      // Amount validation
      if (fee.amount !== undefined && fee.amount < 0) {
        errors.push({ table: 'fees', recordId: fee.id, field: 'amount', message: 'Amount cannot be negative', value: fee.amount });
        isValid = false;
      }

      // Referential integrity
      if (fee.student_id && !studentIds.has(fee.student_id)) {
        warnings.push({ table: 'fees', recordId: fee.id, field: 'student_id', message: `Referenced student ${fee.student_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['fees'] = { total: fees.length, valid, invalid };
  }

  private validateTransactions(
    transactions: DbJsonTransaction[],
    fees: DbJsonFee[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const feeIds = new Set(fees.map(f => f.id));

    for (const txn of transactions) {
      let isValid = true;

      // Required fields
      if (!txn.id) {
        errors.push({ table: 'transactions', recordId: txn.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (txn.amount === undefined || txn.amount === null) {
        errors.push({ table: 'transactions', recordId: txn.id, field: 'amount', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (txn.fee_id && !feeIds.has(txn.fee_id)) {
        warnings.push({ table: 'transactions', recordId: txn.id, field: 'fee_id', message: `Referenced fee ${txn.fee_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['transactions'] = { total: transactions.length, valid, invalid };
  }

  private validateRenewals(
    renewals: DbJsonRenewal[],
    students: DbJsonStudent[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));

    for (const renewal of renewals) {
      let isValid = true;

      // Required fields
      if (!renewal.id) {
        errors.push({ table: 'renewals', recordId: renewal.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!renewal.student_id) {
        errors.push({ table: 'renewals', recordId: renewal.id, field: 'student_id', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (renewal.student_id && !studentIds.has(renewal.student_id)) {
        warnings.push({ table: 'renewals', recordId: renewal.id, field: 'student_id', message: `Referenced student ${renewal.student_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['renewals'] = { total: renewals.length, valid, invalid };
  }

  private validateExitRequests(
    exitRequests: DbJsonExitRequest[],
    students: DbJsonStudent[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;
    const studentIds = new Set(students.map(s => s.id));

    for (const exit of exitRequests) {
      let isValid = true;

      // Required fields
      if (!exit.id) {
        errors.push({ table: 'exitRequests', recordId: exit.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!exit.student_id) {
        errors.push({ table: 'exitRequests', recordId: exit.id, field: 'student_id', message: 'Missing required field' });
        isValid = false;
      }

      // Referential integrity
      if (exit.student_id && !studentIds.has(exit.student_id)) {
        warnings.push({ table: 'exitRequests', recordId: exit.id, field: 'student_id', message: `Referenced student ${exit.student_id} not found` });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['exitRequests'] = { total: exitRequests.length, valid, invalid };
  }

  private validateAuditLogs(
    auditLogs: DbJsonAuditLog[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    summary: Record<string, { total: number; valid: number; invalid: number }>,
  ): void {
    let valid = 0;
    let invalid = 0;

    for (const log of auditLogs) {
      let isValid = true;

      // Required fields
      if (!log.id) {
        errors.push({ table: 'auditLogs', recordId: log.id || 'unknown', field: 'id', message: 'Missing required field' });
        isValid = false;
      }
      if (!log.entity_type) {
        errors.push({ table: 'auditLogs', recordId: log.id, field: 'entity_type', message: 'Missing required field' });
        isValid = false;
      }
      if (!log.action) {
        errors.push({ table: 'auditLogs', recordId: log.id, field: 'action', message: 'Missing required field' });
        isValid = false;
      }

      // Warning for audit logs without actor
      if (!log.actor_id) {
        warnings.push({ table: 'auditLogs', recordId: log.id, field: 'actor_id', message: 'Audit log without actor_id' });
      }

      if (isValid) valid++;
      else invalid++;
    }

    summary['auditLogs'] = { total: auditLogs.length, valid, invalid };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
}
