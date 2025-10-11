"use client";

/**
 * Secure Token Storage Utility
 * Provides additional security layers for token storage in localStorage
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  role: string;
  timestamp: number;
  checksum: string;
}

// Simple XOR encryption for token obfuscation
const encryptToken = (token: string, key: string): string => {
  let result = '';
  for (let i = 0; i < token.length; i++) {
    result += String.fromCharCode(
      token.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode
};

const decryptToken = (encryptedToken: string, key: string): string => {
  try {
    const decoded = atob(encryptedToken);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch {
    return '';
  }
};

// Generate a simple checksum for integrity validation
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

const validateChecksum = (data: string, checksum: string): boolean => {
  return generateChecksum(data) === checksum;
};

// Encryption key - in production this should be environment-specific
const ENCRYPTION_KEY = 'pariksha_path_secure_key_2024';

export class SecureTokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_ROLE_KEY = 'user_role';
  private static readonly TOKEN_DATA_KEY = 'token_data';

  // Validate if we're in a secure context
  private static isSecureContext(): boolean {
    if (typeof window === 'undefined') return false;

    // Check if HTTPS or localhost
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

    return isHTTPS || isLocalhost;
  }

  // Validate token format (basic JWT structure check)
  private static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    // Basic JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      // Check if header and payload are valid base64
      atob(parts[0]);
      atob(parts[1]);
      return true;
    } catch {
      return false;
    }
  }

  // Store access token with encryption and validation
  static setAccessToken(token: string): boolean {
    if (!this.isSecureContext()) {
      console.warn('Token storage blocked: Insecure context');
      return false;
    }

    if (!this.isValidTokenFormat(token)) {
      console.warn('Token storage blocked: Invalid token format');
      return false;
    }

    try {
      const encryptedToken = encryptToken(token, ENCRYPTION_KEY);
      localStorage.setItem(this.ACCESS_TOKEN_KEY, encryptedToken);
      return true;
    } catch (error) {
      console.error('Failed to store access token:', error);
      return false;
    }
  }

  // Get access token with decryption and validation
  static getAccessToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (!encryptedToken) return null;

      const decryptedToken = decryptToken(encryptedToken, ENCRYPTION_KEY);

      if (!this.isValidTokenFormat(decryptedToken)) {
        console.warn('Invalid token detected, clearing storage');
        this.clearAllTokens();
        return null;
      }

      return decryptedToken;
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      this.clearAllTokens();
      return null;
    }
  }

  // Store refresh token with encryption
  static setRefreshToken(token: string): boolean {
    if (!this.isSecureContext()) {
      console.warn('Refresh token storage blocked: Insecure context');
      return false;
    }

    try {
      const encryptedToken = encryptToken(token, ENCRYPTION_KEY);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedToken);
      return true;
    } catch (error) {
      console.error('Failed to store refresh token:', error);
      return false;
    }
  }

  // Get refresh token with decryption
  static getRefreshToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encryptedToken) return null;

      return decryptToken(encryptedToken, ENCRYPTION_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  // Store user role
  static setUserRole(role: string): boolean {
    if (!this.isSecureContext()) return false;

    try {
      localStorage.setItem(this.USER_ROLE_KEY, role);
      return true;
    } catch (error) {
      console.error('Failed to store user role:', error);
      return false;
    }
  }

  // Get user role
  static getUserRole(): string | null {
    try {
      return localStorage.getItem(this.USER_ROLE_KEY);
    } catch (error) {
      console.error('Failed to retrieve user role:', error);
      return null;
    }
  }

  // Clear all tokens and user data
  static clearAllTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_ROLE_KEY);
      localStorage.removeItem(this.TOKEN_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Check if tokens exist and are valid
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const userRole = this.getUserRole();

    return !!(accessToken && refreshToken && userRole);
  }

  // Get token info for debugging (without exposing actual tokens)
  static getTokenInfo(): { hasTokens: boolean; isSecureContext: boolean; userRole?: string } {
    return {
      hasTokens: this.hasValidTokens(),
      isSecureContext: this.isSecureContext(),
      userRole: this.getUserRole() || undefined,
    };
  }
}

export default SecureTokenStorage;
