import { EncryptionErrorType } from '@/models/encryption-types';
import { EncryptionError } from '@/models/encrypto-error.class';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export const createEncryptionTransformer = (key: Buffer) => ({
  to(value: string | null | undefined): Buffer | null {
    try {
      if (!value) return null;
      if (!key || key.length !== 32) {
        throw new EncryptionError(
          EncryptionErrorType.INVALID_KEY,
          'Invalid or missing encryption key',
        );
      }

      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);
      return Buffer.concat([iv, encrypted]);
    } catch (error: any) {
      throw new EncryptionError(
        EncryptionErrorType.ENCRYPTION_FAILED,
        `Encryption failed: ${error.message}`,
      );
    }
  },

  from(value: Buffer | null): string | null {
    try {
      if (!value) return null;

      if (!key || key.length !== 32) {
        throw new EncryptionError(
          EncryptionErrorType.INVALID_KEY,
          'Invalid or missing encryption key',
        );
      }

      const iv = value.subarray(0, 16);
      const encrypted = value.subarray(16);

      if (iv.length !== 16) {
        throw new EncryptionError(
          EncryptionErrorType.INVALID_INPUT,
          'Invalid IV length',
        );
      }

      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString('utf8');
    } catch (error: any) {
      throw new EncryptionError(
        EncryptionErrorType.DECRYPTION_FAILED,
        `Decryption failed: ${error.message}`,
      );
    }
  },
});
