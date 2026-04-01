import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const SIGNED_URL_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Ensure upload directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Save an uploaded file to disk
 * Returns the relative path from UPLOADS_DIR
 */
export async function saveFile(
  buffer: Buffer,
  category: string,
  subPath: string,
  fileName: string
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const uuid = crypto.randomUUID();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageName = `${uuid}-${safeName}`;

  const relDir = path.join(category, subPath, year, month);
  const absDir = path.join(UPLOADS_DIR, relDir);

  await ensureDir(absDir);

  const relPath = path.join(relDir, storageName);
  const absPath = path.join(UPLOADS_DIR, relPath);

  await fs.writeFile(absPath, buffer);

  return relPath;
}

/**
 * Delete a file from disk
 */
export async function deleteFile(relPath: string): Promise<void> {
  try {
    const absPath = path.join(UPLOADS_DIR, relPath);
    await fs.unlink(absPath);
  } catch {
    // File may not exist, ignore
  }
}

/**
 * Read a file from disk
 */
export async function readFile(relPath: string): Promise<Buffer> {
  const absPath = path.join(UPLOADS_DIR, relPath);
  return fs.readFile(absPath);
}

/**
 * Check if a file exists
 */
export async function fileExists(relPath: string): Promise<boolean> {
  try {
    const absPath = path.join(UPLOADS_DIR, relPath);
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a signed URL token for temporary file access
 * Valid for `expirySeconds` (default 1 hour)
 */
export function generateSignedToken(filePath: string, expirySeconds: number = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + expirySeconds;
  const data = `${filePath}:${expires}`;
  const signature = crypto
    .createHmac('sha256', SIGNED_URL_SECRET)
    .update(data)
    .digest('hex');

  const token = Buffer.from(JSON.stringify({ path: filePath, expires, sig: signature })).toString('base64url');
  return token;
}

/**
 * Verify a signed URL token and return the file path
 */
export function verifySignedToken(token: string): { valid: boolean; filePath?: string; error?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    const { path: filePath, expires, sig } = decoded;

    if (Math.floor(Date.now() / 1000) > expires) {
      return { valid: false, error: 'URL has expired' };
    }

    const expectedSig = crypto
      .createHmac('sha256', SIGNED_URL_SECRET)
      .update(`${filePath}:${expires}`)
      .digest('hex');

    if (sig !== expectedSig) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, filePath };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Get the absolute path for a relative file path
 */
export function getAbsolutePath(relPath: string): string {
  return path.join(UPLOADS_DIR, relPath);
}

/**
 * Initialize upload directories
 */
export async function initUploadsDir(): Promise<void> {
  const dirs = ['applications', 'students', 'undertakings', 'receipts', 'system'];
  for (const dir of dirs) {
    await ensureDir(path.join(UPLOADS_DIR, dir));
  }
}
