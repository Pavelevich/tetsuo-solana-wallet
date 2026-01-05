/**
 * TETSUO Solana Wallet - Wallet Management
 *
 * Handles wallet creation, storage, and retrieval.
 * Wallets are encrypted with AES-256-GCM before storage.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  generateWallet,
  importWallet,
  encrypt,
  decrypt,
  secureWipe,
  WalletKeys
} from './crypto.js';

const WALLET_DIR = path.join(os.homedir(), '.tetsuo-solana');
const WALLET_FILE = path.join(WALLET_DIR, 'wallets.enc');
const CONFIG_FILE = path.join(WALLET_DIR, 'config.json');

export interface StoredWallet {
  name: string;
  address: string;
  encryptedMnemonic: string;
  createdAt: string;
  network: 'mainnet' | 'devnet' | 'testnet';
}

export interface WalletConfig {
  activeWallet: string | null;
  network: 'mainnet' | 'devnet' | 'testnet';
  rpcEndpoint: string;
  grokApiKey?: string;
}

export interface UnlockedWallet extends StoredWallet {
  mnemonic: string;
  keypair: {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
  };
}

const DEFAULT_CONFIG: WalletConfig = {
  activeWallet: null,
  network: 'mainnet',
  rpcEndpoint: 'https://api.mainnet-beta.solana.com'
};

/**
 * Ensure wallet directory exists
 */
function ensureWalletDir(): void {
  if (!fs.existsSync(WALLET_DIR)) {
    fs.mkdirSync(WALLET_DIR, { mode: 0o700, recursive: true });
  }
}

/**
 * Load configuration
 */
export function loadConfig(): WalletConfig {
  ensureWalletDir();
  if (fs.existsSync(CONFIG_FILE)) {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  }
  return DEFAULT_CONFIG;
}

/**
 * Save configuration
 */
export function saveConfig(config: WalletConfig): void {
  ensureWalletDir();
  // Don't save sensitive data like API keys in plain text
  const safeConfig = { ...config };
  delete safeConfig.grokApiKey;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(safeConfig, null, 2), { mode: 0o600 });
}

/**
 * Load all stored wallets
 */
export function loadWallets(): StoredWallet[] {
  ensureWalletDir();
  if (fs.existsSync(WALLET_FILE)) {
    const data = fs.readFileSync(WALLET_FILE, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

/**
 * Save wallets to encrypted storage
 */
function saveWallets(wallets: StoredWallet[]): void {
  ensureWalletDir();
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallets, null, 2), { mode: 0o600 });
}

/**
 * Create a new wallet
 */
export function createWallet(
  name: string,
  password: string,
  network: 'mainnet' | 'devnet' | 'testnet' = 'mainnet'
): { wallet: StoredWallet; mnemonic: string } {
  const wallets = loadWallets();

  // Check for duplicate name
  if (wallets.some(w => w.name === name)) {
    throw new Error(`Wallet "${name}" already exists`);
  }

  const { mnemonic, address } = generateWallet();
  const encryptedMnemonic = encrypt(mnemonic, password);

  const storedWallet: StoredWallet = {
    name,
    address,
    encryptedMnemonic,
    createdAt: new Date().toISOString(),
    network
  };

  wallets.push(storedWallet);
  saveWallets(wallets);

  // Update config to set as active wallet
  const config = loadConfig();
  config.activeWallet = name;
  config.network = network;
  saveConfig(config);

  return { wallet: storedWallet, mnemonic };
}

/**
 * Import wallet from mnemonic
 */
export function importWalletFromMnemonic(
  name: string,
  mnemonic: string,
  password: string,
  network: 'mainnet' | 'devnet' | 'testnet' = 'mainnet'
): StoredWallet {
  const wallets = loadWallets();

  if (wallets.some(w => w.name === name)) {
    throw new Error(`Wallet "${name}" already exists`);
  }

  const { address } = importWallet(mnemonic);
  const encryptedMnemonic = encrypt(mnemonic, password);

  const storedWallet: StoredWallet = {
    name,
    address,
    encryptedMnemonic,
    createdAt: new Date().toISOString(),
    network
  };

  wallets.push(storedWallet);
  saveWallets(wallets);

  const config = loadConfig();
  config.activeWallet = name;
  config.network = network;
  saveConfig(config);

  return storedWallet;
}

/**
 * Unlock a wallet with password
 */
export function unlockWallet(name: string, password: string): UnlockedWallet {
  const wallets = loadWallets();
  const wallet = wallets.find(w => w.name === name);

  if (!wallet) {
    throw new Error(`Wallet "${name}" not found`);
  }

  try {
    const mnemonic = decrypt(wallet.encryptedMnemonic, password);
    const { keypair } = importWallet(mnemonic);

    return {
      ...wallet,
      mnemonic,
      keypair
    };
  } catch (error) {
    throw new Error('Invalid password');
  }
}

/**
 * Delete a wallet
 */
export function deleteWallet(name: string): void {
  const wallets = loadWallets();
  const index = wallets.findIndex(w => w.name === name);

  if (index === -1) {
    throw new Error(`Wallet "${name}" not found`);
  }

  wallets.splice(index, 1);
  saveWallets(wallets);

  // Update config if this was the active wallet
  const config = loadConfig();
  if (config.activeWallet === name) {
    config.activeWallet = wallets.length > 0 ? wallets[0].name : null;
    saveConfig(config);
  }
}

/**
 * Get wallet by name
 */
export function getWallet(name: string): StoredWallet | undefined {
  const wallets = loadWallets();
  return wallets.find(w => w.name === name);
}

/**
 * Get active wallet
 */
export function getActiveWallet(): StoredWallet | null {
  const config = loadConfig();
  if (!config.activeWallet) return null;
  return getWallet(config.activeWallet) || null;
}

/**
 * Set active wallet
 */
export function setActiveWallet(name: string): void {
  const wallet = getWallet(name);
  if (!wallet) {
    throw new Error(`Wallet "${name}" not found`);
  }

  const config = loadConfig();
  config.activeWallet = name;
  saveConfig(config);
}

/**
 * List all wallet names and addresses
 */
export function listWallets(): { name: string; address: string; network: string }[] {
  const wallets = loadWallets();
  return wallets.map(w => ({
    name: w.name,
    address: w.address,
    network: w.network
  }));
}
