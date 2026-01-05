/**
 * TETSUO Solana Wallet - Main Export
 *
 * This module exports all public APIs for programmatic use.
 */

// Core cryptography
export {
  generateMnemonic,
  validateMnemonic,
  deriveKeypairFromMnemonic,
  publicKeyToAddress,
  addressToPublicKey,
  sign,
  verify,
  generateWallet,
  importWallet,
  encrypt,
  decrypt,
  secureWipe,
  type KeyPair,
  type WalletKeys
} from './core/crypto.js';

// Wallet management
export {
  createWallet,
  importWalletFromMnemonic,
  unlockWallet,
  deleteWallet,
  getWallet,
  getActiveWallet,
  setActiveWallet,
  listWallets,
  loadConfig,
  saveConfig,
  type StoredWallet,
  type WalletConfig,
  type UnlockedWallet
} from './core/wallet.js';

// Solana client
export {
  SolanaClient,
  createKeypairFromSecretKey,
  TETSUO_MINT,
  TETSUO_DECIMALS,
  type TokenBalance,
  type TransactionResult
} from './solana/client.js';

// Grok AI client
export {
  GrokClient,
  MockGrokClient,
  type GrokMessage,
  type GrokResponse,
  type ParsedCommand
} from './grok/client.js';

// UI components
export * from './ui/ascii.js';
