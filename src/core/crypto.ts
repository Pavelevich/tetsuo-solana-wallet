/**
 * TETSUO Solana Wallet - Core Cryptography Module
 *
 * Uses Ed25519 for Solana-compatible key generation and signing.
 * All cryptographic operations happen in-memory only.
 *
 * Security: Keys are NEVER logged, transmitted, or written to disk unencrypted.
 */

import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import crypto from 'crypto';

// Solana derivation path (BIP44)
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface WalletKeys {
  mnemonic: string;
  keypair: KeyPair;
  address: string;
}

/**
 * Generate a new random mnemonic (24 words for maximum security)
 */
export function generateMnemonic(strength: 128 | 256 = 256): string {
  return bip39.generateMnemonic(strength);
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Derive Ed25519 keypair from mnemonic using Solana's derivation path
 */
export function deriveKeypairFromMnemonic(mnemonic: string): KeyPair {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derivedSeed = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex')).key;
  const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);

  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey
  };
}

/**
 * Convert public key to Solana address (Base58)
 */
export function publicKeyToAddress(publicKey: Uint8Array): string {
  return bs58.encode(publicKey);
}

/**
 * Convert Base58 address back to public key bytes
 */
export function addressToPublicKey(address: string): Uint8Array {
  return bs58.decode(address);
}

/**
 * Sign a message with the secret key
 */
export function sign(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return nacl.sign.detached(message, secretKey);
}

/**
 * Verify a signature
 */
export function verify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return nacl.sign.detached.verify(message, signature, publicKey);
}

/**
 * Generate a complete wallet (mnemonic + keypair + address)
 */
export function generateWallet(): WalletKeys {
  const mnemonic = generateMnemonic(256); // 24 words
  const keypair = deriveKeypairFromMnemonic(mnemonic);
  const address = publicKeyToAddress(keypair.publicKey);

  return {
    mnemonic,
    keypair,
    address
  };
}

/**
 * Import wallet from mnemonic
 */
export function importWallet(mnemonic: string): WalletKeys {
  const keypair = deriveKeypairFromMnemonic(mnemonic);
  const address = publicKeyToAddress(keypair.publicKey);

  return {
    mnemonic,
    keypair,
    address
  };
}

/**
 * Encrypt sensitive data with AES-256-GCM
 */
export function encrypt(data: string, password: string): string {
  const salt = crypto.randomBytes(32);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted
  });
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string, password: string): string {
  const { salt, iv, authTag, encrypted } = JSON.parse(encryptedData);

  const key = crypto.pbkdf2Sync(
    password,
    Buffer.from(salt, 'hex'),
    100000,
    32,
    'sha256'
  );

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Securely clear sensitive data from memory
 */
export function secureWipe(buffer: Uint8Array): void {
  crypto.randomFillSync(buffer);
  buffer.fill(0);
}
