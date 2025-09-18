import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { logger } from './logger';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-cbc',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  SALT: 'gemstone-store-encryption-salt' // In production, use a secure random salt
};

/**
 * Encrypt sensitive data
 * @param data The data to encrypt
 * @param secret The encryption secret key
 * @returns Encrypted data as hex string
 */
export function encryptData(data: string, secret: string): string {
  try {
    // Derive key from secret
    const key = scryptSync(secret, ENCRYPTION_CONFIG.SALT, ENCRYPTION_CONFIG.KEY_LENGTH);
    
    // Generate random initialization vector
    const iv = randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    
    // Create cipher
    const cipher = createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Data encryption failed', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData The encrypted data (iv:data format)
 * @param secret The decryption secret key
 * @returns Decrypted data as string
 */
export function decryptData(encryptedData: string, secret: string): string {
  try {
    // Split iv and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Derive key from secret
    const key = scryptSync(secret, ENCRYPTION_CONFIG.SALT, ENCRYPTION_CONFIG.KEY_LENGTH);
    
    // Create decipher
    const decipher = createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Data decryption failed', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Hash sensitive data (one-way)
 * @param data The data to hash
 * @param salt Optional salt
 * @returns Hashed data
 */
export function hashData(data: string, salt: string = ENCRYPTION_CONFIG.SALT): string {
  try {
    const key = scryptSync(data, salt, ENCRYPTION_CONFIG.KEY_LENGTH);
    return key.toString('hex');
  } catch (error) {
    logger.error('Data hashing failed', error);
    throw new Error('Hashing failed');
  }
}

/**
 * Generate a secure random key
 * @param length Length of the key in bytes
 * @returns Secure random key as hex string
 */
export function generateSecureKey(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Validate if a string is a valid hex key
 * @param key The key to validate
 * @param expectedLength Expected length in bytes
 * @returns True if valid, false otherwise
 */
export function validateKey(key: string, expectedLength: number = 32): boolean {
  const hexRegex = /^[0-9a-f]+$/;
  return key.length === expectedLength * 2 && hexRegex.test(key);
}

/**
 * Encrypt user personal information
 * @param userData User data to encrypt
 * @param encryptionKey Encryption key
 * @returns Encrypted user data
 */
export function encryptUserData(userData: { 
  firstName?: string; 
  lastName?: string; 
  phone?: string; 
  address?: string 
}, encryptionKey: string): any {
  const encryptedData: any = {};
  
  if (userData.firstName) {
    encryptedData.firstName = encryptData(userData.firstName, encryptionKey);
  }
  
  if (userData.lastName) {
    encryptedData.lastName = encryptData(userData.lastName, encryptionKey);
  }
  
  if (userData.phone) {
    encryptedData.phone = encryptData(userData.phone, encryptionKey);
  }
  
  if (userData.address) {
    encryptedData.address = encryptData(userData.address, encryptionKey);
  }
  
  return encryptedData;
}

/**
 * Decrypt user personal information
 * @param encryptedUserData Encrypted user data
 * @param encryptionKey Encryption key
 * @returns Decrypted user data
 */
export function decryptUserData(encryptedUserData: any, encryptionKey: string): any {
  const decryptedData: any = {};
  
  try {
    if (encryptedUserData.firstName) {
      decryptedData.firstName = decryptData(encryptedUserData.firstName, encryptionKey);
    }
    
    if (encryptedUserData.lastName) {
      decryptedData.lastName = decryptData(encryptedUserData.lastName, encryptionKey);
    }
    
    if (encryptedUserData.phone) {
      decryptedData.phone = decryptData(encryptedUserData.phone, encryptionKey);
    }
    
    if (encryptedUserData.address) {
      decryptedData.address = decryptData(encryptedUserData.address, encryptionKey);
    }
  } catch (error) {
    logger.error('User data decryption failed', error);
    throw new Error('Failed to decrypt user data');
  }
  
  return decryptedData;
}

export default {
  encryptData,
  decryptData,
  hashData,
  generateSecureKey,
  validateKey,
  encryptUserData,
  decryptUserData
};