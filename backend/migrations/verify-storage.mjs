#!/usr/bin/env node

/**
 * Script to verify Supabase Storage configuration
 * Usage: node verify-storage.mjs
 *
 * This script checks if storage buckets and RLS policies are properly configured
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyStorageBuckets() {
  console.log('📦 Checking Storage Buckets...\n');

  const buckets = ['applications-documents', 'student-documents', 'undertakings', 'system-generated'];
  const results = [];

  for (const bucketId of buckets) {
    try {
      // Try to get bucket info
      const { data, error } = await supabase.storage.getBucket(bucketId);

      if (error) {
        console.log(`❌ Bucket '${bucketId}': Not found (${error.message})`);
        results.push({ bucket: bucketId, status: 'missing' });
      } else {
        console.log(`✅ Bucket '${bucketId}' exists:`);
        console.log(`   - Public: ${data.public}`);
        console.log(`   - File Size Limit: ${data.file_size_limit} bytes`);
        console.log(`   - Allowed MIME Types: ${data.allowed_mime_types ? data.allowed_mime_types.join(', ') : 'All'}\n`);
        results.push({ bucket: bucketId, status: 'exists', data });
      }
    } catch (error) {
      console.log(`❌ Bucket '${bucketId}': Error checking (${error.message})\n`);
      results.push({ bucket: bucketId, status: 'error', error: error.message });
    }
  }

  return results;
}

async function verifyRLSPolicies() {
  console.log('🔒 Checking RLS Policies...\n');

  try {
    // Check if RLS is enabled on storage.objects
    const { data: rlsEnabled, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT tablename, rowsecurity
          FROM pg_tables
          WHERE tablename = 'objects' AND schemaname = 'storage';
        `
      });

    if (rlsError) {
      console.log('⚠️  Could not check RLS status:', rlsError.message);
      console.log('   You may need to run verification queries in Supabase SQL Editor\n');
      return [];
    }

    if (rlsEnabled && rlsEnabled.length > 0) {
      console.log('✅ RLS is enabled on storage.objects table\n');
    } else {
      console.log('❌ RLS is NOT enabled on storage.objects table\n');
      return [];
    }

    // Get policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            cmd
          FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects'
          ORDER BY policyname
          LIMIT 20;
        `
      });

    if (policiesError) {
      console.log('⚠️  Could not retrieve policies:', policiesError.message);
      console.log('   You may need to run verification queries in Supabase SQL Editor\n');
      return [];
    }

    if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:\n`);
      policies.forEach(policy => {
        console.log(`   ${policy.policyname} (${policy.cmd})`);
      });
      console.log();
    } else {
      console.log('❌ No RLS policies found on storage.objects table\n');
    }

    return policies;
  } catch (error) {
    console.log('⚠️  Could not verify RLS policies:', error.message);
    console.log('   Please run verification queries in Supabase SQL Editor\n');
    return [];
  }
}

async function main() {
  console.log('========================================');
  console.log('Supabase Storage Verification');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log(`  URL: ${SUPABASE_URL}\n`);

  // Test connection
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('storage.buckets').select('*').limit(1);
    if (error) {
      console.log('⚠️  Connection test failed:', error.message);
      console.log('   Continuing with storage-specific checks...\n');
    } else {
      console.log('✅ Connected to Supabase successfully\n');
    }
  } catch (error) {
    console.log('⚠️  Connection test failed:', error.message);
    console.log('   Continuing with storage-specific checks...\n');
  }

  // Verify buckets
  const bucketResults = await verifyStorageBuckets();

  // Verify RLS policies
  const policyResults = await verifyRLSPolicies();

  // Summary
  console.log('========================================');
  console.log('Summary');
  console.log('========================================\n');

  const existingBuckets = bucketResults.filter(r => r.status === 'exists').length;
  const totalBuckets = bucketResults.length;
  const policiesCount = Array.isArray(policyResults) ? policyResults.length : 0;

  console.log(`Storage Buckets: ${existingBuckets}/${totalBuckets} configured`);
  console.log(`RLS Policies: ${policiesCount > 0 ? policiesCount : 'Unknown'} configured\n`);

  if (existingBuckets === totalBuckets) {
    console.log('✅ All storage buckets are configured!');
  } else {
    console.log('❌ Some storage buckets are missing. Please run the migration:');
    console.log('   https://app.supabase.com/project/fteqtsoifrqigegdvqhx/sql/new');
    console.log('   File: migrations/001_create_storage_buckets_and_rls.sql\n');
  }

  if (policiesCount === 0) {
    console.log('⚠️  Could not verify RLS policies. Please verify manually in Supabase SQL Editor:');
    console.log('   SELECT * FROM pg_policies WHERE schemaname = \'storage\' AND tablename = \'objects\';\n');
  }

  console.log('========================================\n');
}

main();
