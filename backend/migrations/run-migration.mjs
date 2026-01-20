#!/usr/bin/env node

/**
 * Script to execute Supabase SQL migrations
 * Usage: node run-migration.mjs <migration-file>
 *
 * This script sends SQL queries directly to Supabase via REST API
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  console.error(`Looking for .env at: ${envPath}`);
  process.exit(1);
}

/**
 * Execute SQL via Supabase REST API
 */
async function executeSQL(sql) {
  const apiUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // If exec_sql function doesn't exist, we'll handle this gracefully
    throw error;
  }
}

/**
 * Execute migration by sending to Supabase Management API
 */
async function executeMigrationViaManagementAPI(sql) {
  const projectId = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)[1];
  const apiUrl = `https://api.supabase.com/v1/projects/${projectId}/database/query`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * Execute migration file
 */
async function executeMigration(migrationFile) {
  console.log(`\n🚀 Executing migration: ${migrationFile}\n`);

  try {
    // Read SQL file
    const sqlContent = readFileSync(migrationFile, 'utf8');

    console.log('Executing SQL migration via Management API...\n');

    try {
      // Try Management API first
      const result = await executeMigrationViaManagementAPI(sqlContent);

      if (result.error) {
        console.error('❌ Migration failed:', result.error);
        return false;
      }

      console.log('✅ Migration executed successfully!\n');
    } catch (error) {
      console.error('❌ Failed to execute via Management API:', error.message);
      console.log('\n💡 Please manually run the SQL in Supabase SQL Editor:');
      console.log(`   https://app.supabase.com/project/${SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)[1]}/sql/new`);
      console.log(`   File: ${migrationFile}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Migration execution failed:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node run-migration.mjs <migration-file>');
    console.error('Example: node run-migration.mjs migrations/001_create_storage_buckets_and_rls.sql');
    process.exit(1);
  }

  const migrationFile = args[0];

  // Resolve path relative to backend directory
  const resolvedPath = migrationFile.startsWith('/') ? migrationFile : join(__dirname, '..', migrationFile);

  console.log('========================================');
  console.log('Supabase Migration Runner');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log(`  Project ID: ${SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)[1]}\n`);

  try {
    const success = await executeMigration(resolvedPath);

    if (success) {
      console.log('✨ All done!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Execute main function
main();
