import { Injectable, Inject, Logger } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  DbJson,
  VerificationResult,
  SpotCheckResult,
} from './db-json.types';
import * as crypto from 'crypto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Verify migration by comparing counts and spot-checking records
   */
  async verifyMigration(dbJson: DbJson): Promise<VerificationResult> {
    this.logger.log('Starting migration verification...');

    const tableCounts: Record<string, { expected: number; actual: number; match: boolean }> = {};
    const spotChecks: SpotCheckResult[] = [];
    const errors: string[] = [];

    // Verify counts for each table
    await this.verifyTableCount('users', dbJson.users.length + dbJson.students.length, tableCounts, errors);
    await this.verifyTableCount('rooms', dbJson.rooms.length, tableCounts, errors);
    await this.verifyTableCount('applications', dbJson.applications.length, tableCounts, errors);
    await this.verifyTableCount('documents', dbJson.documents.length, tableCounts, errors);
    await this.verifyTableCount('room_allocations', dbJson.allocations.length, tableCounts, errors);
    await this.verifyTableCount('leave_requests', dbJson.leaves.length, tableCounts, errors);
    await this.verifyTableCount('payments', dbJson.fees.length, tableCounts, errors);
    await this.verifyTableCount('renewals', dbJson.renewals.length, tableCounts, errors);
    await this.verifyTableCount('audit_logs', dbJson.auditLogs.length, tableCounts, errors);

    // Spot check some records
    if (dbJson.users.length > 0) {
      await this.spotCheckUser(dbJson.users[0], spotChecks, errors);
    }
    if (dbJson.applications.length > 0) {
      await this.spotCheckApplication(dbJson.applications[0], spotChecks, errors);
    }
    if (dbJson.rooms.length > 0) {
      await this.spotCheckRoom(dbJson.rooms[0], spotChecks, errors);
    }

    // Check if all counts match
    const allCountsMatch = Object.values(tableCounts).every(tc => tc.match);
    const allSpotChecksPass = spotChecks.every(sc => sc.mismatches.length === 0);

    const result: VerificationResult = {
      verified: allCountsMatch && allSpotChecksPass && errors.length === 0,
      tableCounts,
      spotChecks,
      errors,
    };

    this.logger.log(`Verification complete: ${result.verified ? 'PASSED' : 'FAILED'}`);
    return result;
  }

  /**
   * Verify record count for a table
   */
  private async verifyTableCount(
    tableName: string,
    expectedCount: number,
    tableCounts: Record<string, { expected: number; actual: number; match: boolean }>,
    errors: string[],
  ): Promise<void> {
    try {
      const { count, error } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        errors.push(`Failed to count ${tableName}: ${error.message}`);
        tableCounts[tableName] = { expected: expectedCount, actual: -1, match: false };
        return;
      }

      const actualCount = count || 0;
      const match = actualCount >= expectedCount; // >= because there might be pre-existing data

      tableCounts[tableName] = { expected: expectedCount, actual: actualCount, match };

      if (!match) {
        this.logger.warn(`Count mismatch for ${tableName}: expected ${expectedCount}, got ${actualCount}`);
      }
    } catch (error) {
      errors.push(`Error verifying ${tableName}: ${error.message}`);
      tableCounts[tableName] = { expected: expectedCount, actual: -1, match: false };
    }
  }

  /**
   * Spot check a user record
   */
  private async spotCheckUser(
    sourceUser: DbJson['users'][0],
    spotChecks: SpotCheckResult[],
    errors: string[],
  ): Promise<void> {
    try {
      const userId = this.ensureUuid(sourceUser.id);
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        errors.push(`Failed to spot check user ${sourceUser.id}: ${error?.message || 'Not found'}`);
        return;
      }

      const mismatches: { field: string; expected: unknown; actual: unknown }[] = [];
      let fieldsChecked = 0;
      let fieldsMatched = 0;

      // Check key fields
      const fieldsToCheck: [string, unknown, unknown][] = [
        ['email', sourceUser.email, data.email],
        ['mobile', sourceUser.mobile_no, data.mobile],
        ['role', sourceUser.role.toUpperCase(), data.role],
      ];

      for (const [field, expected, actual] of fieldsToCheck) {
        fieldsChecked++;
        if (expected === actual) {
          fieldsMatched++;
        } else {
          mismatches.push({ field, expected, actual });
        }
      }

      spotChecks.push({
        table: 'users',
        recordId: sourceUser.id,
        fieldsChecked,
        fieldsMatched,
        mismatches,
      });
    } catch (error) {
      errors.push(`Error spot checking user: ${error.message}`);
    }
  }

  /**
   * Spot check an application record
   */
  private async spotCheckApplication(
    sourceApp: DbJson['applications'][0],
    spotChecks: SpotCheckResult[],
    errors: string[],
  ): Promise<void> {
    try {
      const appId = this.ensureUuid(sourceApp.id);
      const { data, error } = await this.supabase
        .from('applications')
        .select('*')
        .eq('id', appId)
        .single();

      if (error || !data) {
        errors.push(`Failed to spot check application ${sourceApp.id}: ${error?.message || 'Not found'}`);
        return;
      }

      const mismatches: { field: string; expected: unknown; actual: unknown }[] = [];
      let fieldsChecked = 0;
      let fieldsMatched = 0;

      // Check key fields
      const fieldsToCheck: [string, unknown, unknown][] = [
        ['tracking_number', sourceApp.tracking_number, data.tracking_number],
        ['vertical', sourceApp.vertical, data.vertical],
        ['applicant_mobile', sourceApp.applicant_mobile, data.applicant_mobile],
        ['current_status', sourceApp.current_status, data.current_status],
      ];

      for (const [field, expected, actual] of fieldsToCheck) {
        fieldsChecked++;
        if (expected === actual) {
          fieldsMatched++;
        } else {
          mismatches.push({ field, expected, actual });
        }
      }

      spotChecks.push({
        table: 'applications',
        recordId: sourceApp.id,
        fieldsChecked,
        fieldsMatched,
        mismatches,
      });
    } catch (error) {
      errors.push(`Error spot checking application: ${error.message}`);
    }
  }

  /**
   * Spot check a room record
   */
  private async spotCheckRoom(
    sourceRoom: DbJson['rooms'][0],
    spotChecks: SpotCheckResult[],
    errors: string[],
  ): Promise<void> {
    try {
      const roomId = this.ensureUuid(sourceRoom.id);
      const { data, error } = await this.supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !data) {
        errors.push(`Failed to spot check room ${sourceRoom.id}: ${error?.message || 'Not found'}`);
        return;
      }

      const mismatches: { field: string; expected: unknown; actual: unknown }[] = [];
      let fieldsChecked = 0;
      let fieldsMatched = 0;

      // Check key fields
      const fieldsToCheck: [string, unknown, unknown][] = [
        ['room_number', sourceRoom.room_number, data.room_number],
        ['vertical', sourceRoom.vertical, data.vertical],
        ['capacity', sourceRoom.capacity, data.capacity],
        ['floor', sourceRoom.floor, data.floor],
      ];

      for (const [field, expected, actual] of fieldsToCheck) {
        fieldsChecked++;
        if (expected === actual) {
          fieldsMatched++;
        } else {
          mismatches.push({ field, expected, actual });
        }
      }

      spotChecks.push({
        table: 'rooms',
        recordId: sourceRoom.id,
        fieldsChecked,
        fieldsMatched,
        mismatches,
      });
    } catch (error) {
      errors.push(`Error spot checking room: ${error.message}`);
    }
  }

  /**
   * Convert string ID to UUID format (same logic as migration service)
   */
  private ensureUuid(id: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      return id;
    }

    const hash = crypto.createHash('md5').update(id).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }
}
