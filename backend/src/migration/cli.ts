#!/usr/bin/env ts-node
/**
 * Migration CLI
 *
 * Usage:
 *   npx ts-node src/migration/cli.ts validate [--input path/to/db.json]
 *   npx ts-node src/migration/cli.ts migrate [--input path/to/db.json]
 *   npx ts-node src/migration/cli.ts verify [--input path/to/db.json]
 *   npx ts-node src/migration/cli.ts full [--input path/to/db.json]
 */

import { NestFactory } from '@nestjs/core';
import { MigrationModule } from './migration.module';
import { ValidationService } from './validation.service';
import { MigrationService } from './migration.service';
import { VerificationService } from './verification.service';
import { DbJson } from './db-json.types';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_DB_JSON_PATH = '../../db.json';

async function loadDbJson(inputPath?: string): Promise<DbJson> {
  const filePath = inputPath || path.resolve(__dirname, DEFAULT_DB_JSON_PATH);
  console.log(`Loading db.json from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as DbJson;
}

function saveReport(filename: string, data: unknown): void {
  const outputPath = path.resolve(__dirname, '../../migration-reports', filename);
  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Report saved to: ${outputPath}`);
}

async function runValidation(inputPath?: string): Promise<boolean> {
  console.log('\n========================================');
  console.log('STEP 1: DATA VALIDATION');
  console.log('========================================\n');

  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const validationService = app.get(ValidationService);
    const dbJson = await loadDbJson(inputPath);

    console.log('Starting validation...');
    const report = await validationService.validateData(dbJson);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveReport(`validation-${timestamp}.json`, report);

    console.log('\n--- Validation Summary ---');
    console.log(`Total records: ${report.totalRecords}`);
    console.log(`Valid records: ${report.validRecords}`);
    console.log(`Invalid records: ${report.invalidRecords}`);
    console.log(`Errors: ${report.errors.length}`);
    console.log(`Warnings: ${report.warnings.length}`);

    console.log('\n--- By Table ---');
    for (const [table, stats] of Object.entries(report.summary)) {
      const status = stats.invalid === 0 ? '✓' : '✗';
      console.log(`  ${status} ${table}: ${stats.valid}/${stats.total} valid`);
    }

    if (report.errors.length > 0) {
      console.log('\n--- Errors (first 10) ---');
      report.errors.slice(0, 10).forEach(err => {
        console.log(`  [${err.table}:${err.recordId}] ${err.field}: ${err.message}`);
      });
    }

    if (report.isValid) {
      console.log('\n✓ Validation PASSED - Ready to migrate');
    } else {
      console.log('\n✗ Validation FAILED - Fix errors before migrating');
    }

    return report.isValid;
  } finally {
    await app.close();
  }
}

async function runMigration(inputPath?: string): Promise<boolean> {
  console.log('\n========================================');
  console.log('STEP 2: DATA MIGRATION');
  console.log('========================================\n');

  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const migrationService = app.get(MigrationService);
    const dbJson = await loadDbJson(inputPath);

    console.log('Starting migration...');
    const result = await migrationService.migrateData(dbJson);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveReport(`migration-${timestamp}.json`, result);

    console.log('\n--- Migration Summary ---');
    console.log(`Duration: ${result.durationMs}ms`);
    console.log(`Tables migrated: ${result.migratedTables.join(', ')}`);
    console.log(`Errors: ${result.errors.length}`);

    console.log('\n--- Record Counts ---');
    for (const [table, counts] of Object.entries(result.recordCounts)) {
      const status = counts.failed === 0 ? '✓' : '✗';
      console.log(`  ${status} ${table}: ${counts.inserted}/${counts.attempted} inserted`);
    }

    if (result.errors.length > 0) {
      console.log('\n--- Errors (first 10) ---');
      result.errors.slice(0, 10).forEach(err => {
        console.log(`  [${err.table}:${err.recordId}] ${err.error}`);
      });
    }

    if (result.success) {
      console.log('\n✓ Migration COMPLETED successfully');
    } else {
      console.log('\n✗ Migration COMPLETED with errors');
    }

    return result.success;
  } finally {
    await app.close();
  }
}

async function runVerification(inputPath?: string): Promise<boolean> {
  console.log('\n========================================');
  console.log('STEP 3: MIGRATION VERIFICATION');
  console.log('========================================\n');

  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const verificationService = app.get(VerificationService);
    const dbJson = await loadDbJson(inputPath);

    console.log('Starting verification...');
    const result = await verificationService.verifyMigration(dbJson);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveReport(`verification-${timestamp}.json`, result);

    console.log('\n--- Count Verification ---');
    for (const [table, counts] of Object.entries(result.tableCounts)) {
      const status = counts.match ? '✓' : '✗';
      console.log(`  ${status} ${table}: expected ${counts.expected}, actual ${counts.actual}`);
    }

    console.log('\n--- Spot Checks ---');
    for (const check of result.spotChecks) {
      const status = check.mismatches.length === 0 ? '✓' : '✗';
      console.log(`  ${status} ${check.table}:${check.recordId} - ${check.fieldsMatched}/${check.fieldsChecked} fields matched`);
      if (check.mismatches.length > 0) {
        check.mismatches.forEach(m => {
          console.log(`      ${m.field}: expected "${m.expected}", got "${m.actual}"`);
        });
      }
    }

    if (result.errors.length > 0) {
      console.log('\n--- Errors ---');
      result.errors.forEach(err => console.log(`  ${err}`));
    }

    if (result.verified) {
      console.log('\n✓ Verification PASSED');
    } else {
      console.log('\n✗ Verification FAILED');
    }

    return result.verified;
  } finally {
    await app.close();
  }
}

async function runFullMigration(inputPath?: string): Promise<void> {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     FULL MIGRATION PROCESS             ║');
  console.log('╚════════════════════════════════════════╝');

  // Step 1: Validation
  const validationPassed = await runValidation(inputPath);
  if (!validationPassed) {
    console.log('\n⚠ Validation failed. Aborting migration.');
    console.log('Fix the validation errors and try again.');
    process.exit(1);
  }

  // Step 2: Migration
  const migrationPassed = await runMigration(inputPath);
  if (!migrationPassed) {
    console.log('\n⚠ Migration completed with errors.');
    console.log('Check the migration report for details.');
  }

  // Step 3: Verification
  const verificationPassed = await runVerification(inputPath);

  // Final Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     MIGRATION COMPLETE                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nValidation:   ${validationPassed ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`Migration:    ${migrationPassed ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`Verification: ${verificationPassed ? '✓ PASSED' : '✗ FAILED'}`);

  if (validationPassed && migrationPassed && verificationPassed) {
    console.log('\n✓ All steps completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠ Some steps failed. Review the reports.');
    process.exit(1);
  }
}

// CLI Entry Point
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse --input flag
  let inputPath: string | undefined;
  const inputIndex = args.indexOf('--input');
  if (inputIndex !== -1 && args[inputIndex + 1]) {
    inputPath = args[inputIndex + 1];
  }

  console.log('╔════════════════════════════════════════╗');
  console.log('║     DB.JSON TO SUPABASE MIGRATION      ║');
  console.log('╚════════════════════════════════════════╝\n');

  switch (command) {
    case 'validate':
      await runValidation(inputPath);
      break;

    case 'migrate':
      await runMigration(inputPath);
      break;

    case 'verify':
      await runVerification(inputPath);
      break;

    case 'full':
      await runFullMigration(inputPath);
      break;

    default:
      console.log('Usage:');
      console.log('  npx ts-node src/migration/cli.ts <command> [--input path/to/db.json]');
      console.log('');
      console.log('Commands:');
      console.log('  validate  - Validate db.json data before migration');
      console.log('  migrate   - Run the data migration');
      console.log('  verify    - Verify migration was successful');
      console.log('  full      - Run all steps (validate → migrate → verify)');
      console.log('');
      console.log('Options:');
      console.log('  --input   - Path to db.json file (default: ../../db.json)');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
