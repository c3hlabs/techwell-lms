const crypto = require('crypto');

// Algorithm: AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64; // Length of salt for key derivation
const TAG_LENGTH = 16; // GCM tag length

/**
 * Derives a 32-byte key from the master secret using scrypt.
 * This ensures we always have a valid key length regardless of input password.
 */
function getDerivedKey(secret) {
    // Use a fixed salt since we want deterministic key derivation from the env var
    // In a password hashing scenario, salt should be random. 
    // Here, the security relies on the entropy of the process.env.ENCRYPTION_KEY
    return crypto.scryptSync(secret, 'salt', 32);
}

/**
 * Encrypts text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Combined string of IV:AuthTag:EncryptedText
 */
function encrypt(text) {
    if (!text) return null;

    const secret = process.env.ENCRYPTION_KEY || 'techwell-ai-key-fallback-secret-CHANGE_ME_IN_PROD';
    const key = getDerivedKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts text using AES-256-GCM
 * @param {string} text - IV:AuthTag:EncryptedText string
 * @returns {string} - Decrypted text
 */
function decrypt(text) {
    if (!text) return null;

    try {
        const parts = text.split(':');
        if (parts.length !== 3) {
            // Fallback for old CBC format (IV:Encrypted)
            // This allows migration without breaking existing keys
            // You might want to remove this after all keys are migrated
            return decryptLegacyCBC(text);
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const secret = process.env.ENCRYPTION_KEY || 'techwell-ai-key-fallback-secret-CHANGE_ME_IN_PROD';
        const key = getDerivedKey(secret);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return text; // Return original text on failure (or handle differently)
    }
}

// Legacy decryption support for AES-256-CBC (previous implementation)
function decryptLegacyCBC(text) {
    try {
        const secret = process.env.ENCRYPTION_KEY || 'techwell-ai-key-32-chars-long!!';
        const parts = text.split(':');
        if (parts.length !== 2) return text;

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1]; // Keep as hex string for crypto update
        const encryptedBuf = Buffer.from(encrypted, 'hex');

        // Check if key is valid length (32 bytes) for legacy
        // The old code used 'aes-256-cbc' with potentially invalid key lengths which Node might accept or reject
        // We attempt to replicate the exact behavior
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);

        let decrypted = decipher.update(encryptedBuf);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.warn('Legacy decryption failed, returning text');
        return text;
    }
}

module.exports = { encrypt, decrypt };
