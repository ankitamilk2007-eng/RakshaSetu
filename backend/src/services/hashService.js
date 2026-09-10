import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes SHA-256 hash of a file buffer or stream
 */
export const calculateFileHash = (filePathOrBuffer) => {
  if (Buffer.isBuffer(filePathOrBuffer)) {
    return crypto.createHash('sha256').update(filePathOrBuffer).digest('hex');
  }

  const fileBuffer = fs.readFileSync(filePathOrBuffer);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

/**
 * Verifies if expected hash matches actual hash
 */
export const verifyHash = (filePathOrBuffer, expectedHash) => {
  const actualHash = calculateFileHash(filePathOrBuffer);
  const isMatch = actualHash.toLowerCase() === expectedHash.toLowerCase();
  return {
    isMatch,
    actualHash,
    expectedHash,
    verifiedAt: new Date().toISOString()
  };
};
