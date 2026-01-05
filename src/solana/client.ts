/**
 * TETSUO Solana Wallet - Solana RPC Client
 *
 * Handles all Solana blockchain interactions including:
 * - Balance queries
 * - Token account management
 * - Transaction building and sending
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// TETSUO Token Mint Address on Solana Mainnet
export const TETSUO_MINT = new PublicKey('8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8');
export const TETSUO_DECIMALS = 9;

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  uiBalance: string;
  decimals: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export class SolanaClient {
  private connection: Connection;
  private network: 'mainnet' | 'devnet' | 'testnet';

  constructor(rpcEndpoint: string, network: 'mainnet' | 'devnet' | 'testnet' = 'mainnet') {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.network = network;
  }

  /**
   * Get SOL balance for an address
   */
  async getSolBalance(address: string): Promise<number> {
    const publicKey = new PublicKey(address);
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get TETSUO token balance
   */
  async getTetsuoBalance(ownerAddress: string): Promise<TokenBalance> {
    const owner = new PublicKey(ownerAddress);

    try {
      const tokenAccount = await getAssociatedTokenAddress(
        TETSUO_MINT,
        owner
      );

      const account = await getAccount(this.connection, tokenAccount);
      const balance = Number(account.amount);
      const uiBalance = (balance / Math.pow(10, TETSUO_DECIMALS)).toLocaleString();

      return {
        mint: TETSUO_MINT.toBase58(),
        symbol: 'TETSUO',
        balance,
        uiBalance,
        decimals: TETSUO_DECIMALS
      };
    } catch (error) {
      // Token account doesn't exist - zero balance
      return {
        mint: TETSUO_MINT.toBase58(),
        symbol: 'TETSUO',
        balance: 0,
        uiBalance: '0',
        decimals: TETSUO_DECIMALS
      };
    }
  }

  /**
   * Get all token balances for an address
   */
  async getAllTokenBalances(ownerAddress: string): Promise<TokenBalance[]> {
    const owner = new PublicKey(ownerAddress);
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      owner,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map(account => {
      const info = account.account.data.parsed.info;
      return {
        mint: info.mint,
        symbol: 'Unknown',
        balance: Number(info.tokenAmount.amount),
        uiBalance: info.tokenAmount.uiAmountString,
        decimals: info.tokenAmount.decimals
      };
    });
  }

  /**
   * Send SOL to another address
   */
  async sendSol(
    fromKeypair: Keypair,
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const toPubkey = new PublicKey(toAddress);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey,
          lamports
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      return { signature, success: true };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send TETSUO tokens
   */
  async sendTetsuo(
    fromKeypair: Keypair,
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const toPubkey = new PublicKey(toAddress);
      const tokenAmount = BigInt(Math.floor(amount * Math.pow(10, TETSUO_DECIMALS)));

      // Get source token account
      const sourceTokenAccount = await getAssociatedTokenAddress(
        TETSUO_MINT,
        fromKeypair.publicKey
      );

      // Get or create destination token account
      const destTokenAccount = await getAssociatedTokenAddress(
        TETSUO_MINT,
        toPubkey
      );

      const instructions: TransactionInstruction[] = [];

      // Check if destination token account exists
      try {
        await getAccount(this.connection, destTokenAccount);
      } catch {
        // Create associated token account for recipient
        instructions.push(
          createAssociatedTokenAccountInstruction(
            fromKeypair.publicKey,
            destTokenAccount,
            toPubkey,
            TETSUO_MINT
          )
        );
      }

      // Add transfer instruction
      instructions.push(
        createTransferInstruction(
          sourceTokenAccount,
          destTokenAccount,
          fromKeypair.publicKey,
          tokenAmount
        )
      );

      const transaction = new Transaction().add(...instructions);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      return { signature, success: true };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent transactions for an address
   */
  async getRecentTransactions(address: string, limit: number = 10) {
    const publicKey = new PublicKey(address);
    const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });

    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : null,
      err: sig.err,
      memo: sig.memo
    }));
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    return this.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
  }

  /**
   * Check if an address is valid
   */
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current network
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Get RPC endpoint health
   */
  async getHealth(): Promise<boolean> {
    try {
      await this.connection.getSlot();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Keypair from secret key bytes
 */
export function createKeypairFromSecretKey(secretKey: Uint8Array): Keypair {
  return Keypair.fromSecretKey(secretKey);
}
