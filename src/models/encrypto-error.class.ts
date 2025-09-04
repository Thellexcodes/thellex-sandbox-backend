import { EncryptionErrorType } from './encryption-types';

// Custom error class
export class EncryptionError extends Error {
  constructor(type: EncryptionErrorType, message: string) {
    super(message);
    this.name = `EncryptionError_${type}`;
  }
}
