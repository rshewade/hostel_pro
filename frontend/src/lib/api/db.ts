/**
 * Database Helper Utilities for db.json
 *
 * Shared utilities for reading and writing to db.json during prototyping phase.
 * These will be replaced with actual database operations in production.
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// Database Path Configuration
// ============================================================================

const DB_PATH = process.env.DB_FILE_PATH || path.join(process.cwd(), '../db.json');

// ============================================================================
// Database Types
// ============================================================================

export type DatabaseSchema = {
  users: any[];
  profiles: any[];
  applications: any[];
  documents: any[];
  interviews: any[];
  rooms: any[];
  allocations: any[];
  leaves: any[];
  fees: any[];
  transactions: any[];
  auditLogs: any[];
  [key: string]: any[];
};

// ============================================================================
// Core Database Operations
// ============================================================================

/**
 * Read entire database
 */
export async function readDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    // Return empty database structure if file doesn't exist
    return {
      users: [],
      profiles: [],
      applications: [],
      documents: [],
      interviews: [],
      rooms: [],
      allocations: [],
      leaves: [],
      fees: [],
      transactions: [],
      auditLogs: [],
    };
  }
}

/**
 * Write entire database
 */
export async function writeDb(data: DatabaseSchema): Promise<DatabaseSchema> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Failed to write to database');
  }
}

// ============================================================================
// Collection-Level Operations
// ============================================================================

/**
 * Get all items from a collection
 */
export async function getCollection<T = any>(collectionName: string): Promise<T[]> {
  const db = await readDb();
  return (db[collectionName] as T[]) || [];
}

/**
 * Find item by ID in a collection
 */
export async function findById<T = any>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const collection = await getCollection<T & { id: string }>(collectionName);
  return collection.find((item) => item.id === id) || null;
}

/**
 * Find items matching a filter
 */
export async function find<T = any>(
  collectionName: string,
  filter: (item: T) => boolean
): Promise<T[]> {
  const collection = await getCollection<T>(collectionName);
  return collection.filter(filter);
}

/**
 * Find single item matching a filter
 */
export async function findOne<T = any>(
  collectionName: string,
  filter: (item: T) => boolean
): Promise<T | null> {
  const collection = await getCollection<T>(collectionName);
  return collection.find(filter) || null;
}

/**
 * Insert new item into collection
 */
export async function insert<T = any>(
  collectionName: string,
  item: T
): Promise<T> {
  const db = await readDb();

  if (!db[collectionName]) {
    db[collectionName] = [];
  }

  db[collectionName].push(item);
  await writeDb(db);

  return item;
}

/**
 * Update item by ID in a collection
 */
export async function updateById<T = any>(
  collectionName: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const db = await readDb();
  const collection = db[collectionName] || [];
  const index = collection.findIndex((item: any) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updatedItem = {
    ...collection[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  collection[index] = updatedItem;
  await writeDb(db);

  return updatedItem as T;
}

/**
 * Delete item by ID from a collection
 */
export async function deleteById(
  collectionName: string,
  id: string
): Promise<boolean> {
  const db = await readDb();
  const collection = db[collectionName] || [];
  const initialLength = collection.length;

  db[collectionName] = collection.filter((item: any) => item.id !== id);

  if (db[collectionName].length === initialLength) {
    return false; // No item was deleted
  }

  await writeDb(db);
  return true;
}

// ============================================================================
// ID Generation Utilities
// ============================================================================

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Generate sequential ID based on collection
 */
export async function generateSequentialId(
  collectionName: string,
  prefix: string
): Promise<string> {
  const collection = await getCollection(collectionName);
  const lastItem = collection[collection.length - 1];

  let lastSeq = 0;
  if (lastItem && lastItem.id) {
    const match = String(lastItem.id).match(/\d+$/);
    if (match) {
      lastSeq = parseInt(match[0]);
    }
  }

  const newSeq = lastSeq + 1;
  return `${prefix}${newSeq}`;
}

// ============================================================================
// Tracking Number Generation
// ============================================================================

/**
 * Generate tracking number for applications (HG-YYYY-NNNNN)
 */
export async function generateTrackingNumber(
  vertical: string
): Promise<string> {
  const year = new Date().getFullYear();
  const applications = await getCollection('applications');

  // Determine prefix based on vertical
  let prefix = 'HG'; // Default
  if (vertical === 'BOYS_HOSTEL') prefix = 'BH';
  else if (vertical === 'GIRLS_ASHRAM') prefix = 'GA';
  else if (vertical === 'DHARAMSHALA') prefix = 'DH';

  // Find last sequence number for this year and prefix
  let lastSeq = 0;
  applications.forEach((app: any) => {
    if (app.tracking_number && app.tracking_number.startsWith(`${prefix}-${year}`)) {
      const match = app.tracking_number.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1]);
        if (seq > lastSeq) {
          lastSeq = seq;
        }
      }
    }
  });

  const newSeq = lastSeq + 1;
  return `${prefix}-${year}-${String(newSeq).padStart(5, '0')}`;
}

// ============================================================================
// Audit Logging
// ============================================================================

export type AuditLogData = {
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  performed_by?: string | null;
  metadata?: Record<string, any>;
};

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  const auditLog = {
    id: generateId('audit'),
    ...data,
    performed_at: new Date().toISOString(),
  };

  await insert('auditLogs', auditLog);
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Paginate results
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

/**
 * Sort items by field
 */
export function sortBy<T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if item exists
 */
export async function exists(collectionName: string, id: string): Promise<boolean> {
  const item = await findById(collectionName, id);
  return item !== null;
}

/**
 * Validate foreign key reference
 */
export async function validateReference(
  collectionName: string,
  id: string,
  fieldName: string = 'id'
): Promise<boolean> {
  return await exists(collectionName, id);
}

// ============================================================================
// Transaction Simulation (Simple Locking)
// ============================================================================

let dbLock = false;

/**
 * Acquire lock (simple mutex for concurrent operations)
 */
async function acquireLock(timeout: number = 5000): Promise<void> {
  const startTime = Date.now();

  while (dbLock) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Database lock timeout');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  dbLock = true;
}

/**
 * Release lock
 */
function releaseLock(): void {
  dbLock = false;
}

/**
 * Execute operation with lock
 */
export async function withLock<T>(operation: () => Promise<T>): Promise<T> {
  await acquireLock();

  try {
    return await operation();
  } finally {
    releaseLock();
  }
}
