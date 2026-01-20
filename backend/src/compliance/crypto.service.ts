import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * CryptoService provides AES-256-GCM encryption for PII fields
 * Compliant with DPDP Act requirements for data protection
 */
@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 128 bits
  private readonly authTagLength = 16; // 128 bits
  private readonly encryptionKey: Buffer | null;

  constructor(private configService: ConfigService) {
    const keyHex = this.configService.get<string>('ENCRYPTION_KEY');

    if (keyHex) {
      // Key should be 32 bytes (256 bits) in hex format (64 characters)
      if (keyHex.length !== 64) {
        this.logger.warn('ENCRYPTION_KEY should be 64 hex characters (256 bits)');
        this.encryptionKey = null;
      } else {
        this.encryptionKey = Buffer.from(keyHex, 'hex');
      }
    } else {
      this.logger.warn('ENCRYPTION_KEY not configured. PII encryption disabled.');
      this.encryptionKey = null;
    }
  }

  /**
   * Check if encryption is configured
   */
  isConfigured(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Encrypt a string value using AES-256-GCM
   * Returns base64 encoded string: iv:authTag:ciphertext
   */
  encrypt(plaintext: string): string {
    if (!this.encryptionKey) {
      this.logger.warn('Encryption key not configured, returning plaintext');
      return plaintext;
    }

    if (!plaintext) {
      return plaintext;
    }

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
        { authTagLength: this.authTagLength },
      );

      // Encrypt
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine: iv:authTag:ciphertext (all base64)
      const encrypted = [
        iv.toString('base64'),
        authTag.toString('base64'),
        ciphertext,
      ].join(':');

      return encrypted;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt a string value encrypted with AES-256-GCM
   * Input format: iv:authTag:ciphertext (base64)
   */
  decrypt(encrypted: string): string {
    if (!this.encryptionKey) {
      this.logger.warn('Encryption key not configured, returning as-is');
      return encrypted;
    }

    if (!encrypted) {
      return encrypted;
    }

    // Check if it looks like encrypted data (has two colons)
    if (!encrypted.includes(':')) {
      // Likely plaintext, return as-is
      return encrypted;
    }

    try {
      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        // Not in expected format, return as-is
        return encrypted;
      }

      const [ivB64, authTagB64, ciphertext] = parts;
      const iv = Buffer.from(ivB64, 'base64');
      const authTag = Buffer.from(authTagB64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
        { authTagLength: this.authTagLength },
      );

      // Set auth tag
      decipher.setAuthTag(authTag);

      // Decrypt
      let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');

      return plaintext;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      // Return original if decryption fails (might be plaintext)
      return encrypted;
    }
  }

  /**
   * Encrypt specific fields in an object
   */
  encryptFields<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[],
  ): T {
    if (!this.isConfigured()) {
      return data;
    }

    const result = { ...data };
    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.encrypt(result[field] as string) as T[keyof T];
      }
    }
    return result;
  }

  /**
   * Decrypt specific fields in an object
   */
  decryptFields<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[],
  ): T {
    if (!this.isConfigured()) {
      return data;
    }

    const result = { ...data };
    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.decrypt(result[field] as string) as T[keyof T];
      }
    }
    return result;
  }

  /**
   * Hash a value for comparison (one-way)
   * Useful for searching encrypted fields
   */
  hash(value: string): string {
    if (!value) return value;

    const salt = this.configService.get<string>('HASH_SALT') || 'default-salt';
    return crypto
      .createHmac('sha256', salt)
      .update(value)
      .digest('hex');
  }

  /**
   * Generate a secure random key (for initial setup)
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * List of PII fields that should be encrypted
 */
export const PII_FIELDS = {
  users: ['mobile', 'email', 'address', 'emergency_contact'],
  applications: ['applicant_mobile', 'data'], // data contains form with PII
  documents: [], // Documents are stored encrypted in storage
  leave_requests: ['emergency_contact', 'destination_address'],
} as const;
