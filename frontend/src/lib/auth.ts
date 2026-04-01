import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = 86400; // 24 hours in seconds
const JWT_REFRESH_EXPIRES_IN = 604800; // 7 days in seconds
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const SALT_ROUNDS = 12;

// ============================================================================
// JWT
// ============================================================================

export interface JwtPayload {
  sub: string;        // user.id
  email?: string;
  phone?: string;
  role: string;
  vertical?: string;
  type?: 'access' | 'refresh';
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ============================================================================
// PASSWORD
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// OTP
// ============================================================================

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOtp(identifier: string, purpose: string): Promise<string> {
  const otp = process.env.NODE_ENV === 'development' ? '123456' : generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any existing OTP for this identifier+purpose
  await query(
    `UPDATE otp_verifications SET verified = true WHERE identifier = $1 AND purpose = $2 AND verified = false`,
    [identifier, purpose]
  );

  await query(
    `INSERT INTO otp_verifications (identifier, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
    [identifier, otp, purpose, expiresAt]
  );

  return otp;
}

export async function verifyOtp(identifier: string, code: string, purpose: string): Promise<{ valid: boolean; error?: string }> {
  const result = await query(
    `SELECT id, otp_code, attempts, expires_at FROM otp_verifications
     WHERE identifier = $1 AND purpose = $2 AND verified = false
     ORDER BY created_at DESC LIMIT 1`,
    [identifier, purpose]
  );

  if (result.rows.length === 0) {
    return { valid: false, error: 'No OTP found. Please request a new one.' };
  }

  const otpRecord = result.rows[0];

  if (new Date() > new Date(otpRecord.expires_at)) {
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    return { valid: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
  }

  // Increment attempts
  await query(`UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`, [otpRecord.id]);

  if (otpRecord.otp_code !== code) {
    return { valid: false, error: 'Invalid OTP code.' };
  }

  // Mark as verified
  await query(`UPDATE otp_verifications SET verified = true WHERE id = $1`, [otpRecord.id]);

  return { valid: true };
}

// ============================================================================
// SESSION
// ============================================================================

export async function createSession(userId: string, ip?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string }> {
  const userResult = await query(`SELECT id, email, mobile, role, vertical FROM users WHERE id = $1`, [userId]);
  if (userResult.rows.length === 0) throw new Error('User not found');

  const user = userResult.rows[0];
  const payload: Omit<JwtPayload, 'type'> = {
    sub: user.id,
    email: user.email,
    phone: user.mobile,
    role: user.role,
    vertical: user.vertical,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token hash in sessions table
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, ip, userAgent, expiresAt]
  );

  return { accessToken, refreshToken };
}

export async function invalidateSession(refreshToken: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

// ============================================================================
// AUDIT LOG HELPER
// ============================================================================

export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  action: string;
  performedBy?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: unknown;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, old_value, new_value, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3::audit_action, $4, $5, $6, $7, $8, $9)`,
      [
        params.entityType,
        params.entityId,
        params.action,
        params.performedBy,
        params.oldValue ? JSON.stringify(params.oldValue) : null,
        params.newValue ? JSON.stringify(params.newValue) : null,
        params.ipAddress,
        params.userAgent,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch {
    // Audit log failure should not break the main flow
    console.error('Failed to write audit log');
  }
}

// ============================================================================
// TOKEN EXTRACTION HELPER
// ============================================================================

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token);
    if (payload.type === 'refresh') return null; // Don't accept refresh tokens as access

    const result = await query(
      `SELECT id, email, mobile, full_name, role, vertical, is_active FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) return null;
    return result.rows[0];
  } catch {
    return null;
  }
}
