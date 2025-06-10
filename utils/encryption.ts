// Using AES encryption from crypto-js
import { AES, enc } from 'crypto-js';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-32-bytes-long-secure-key';

export const encryptData = (text: string): string => {
  try {
    // Add a prefix to identify frontend encryption
    const encrypted = AES.encrypt(text, ENCRYPTION_KEY).toString();
    return `FE:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decryptData = (encryptedText: string): string => {
  try {
    // Remove the prefix if it exists
    const actualText = encryptedText.startsWith('FE:') ? 
      encryptedText.slice(3) : encryptedText;
      
    const bytes = AES.decrypt(actualText, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}; 