#!/usr/bin/env node
/**
 * TETSUO Solana Wallet - CLI Entry Point
 *
 * A secure, AI-powered command-line wallet for TETSUO on Solana.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

import {
  createWallet,
  importWalletFromMnemonic,
  unlockWallet,
  listWallets,
  getActiveWallet,
  setActiveWallet,
  deleteWallet,
  loadConfig,
  saveConfig,
  UnlockedWallet
} from './core/wallet.js';
import { SolanaClient, createKeypairFromSecretKey } from './solana/client.js';
import { GrokClient, MockGrokClient, ParsedCommand } from './grok/client.js';
import {
  printLogo,
  printWelcome,
  printBalanceCard,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printGrokResponse,
  printQRCode,
  printWalletList,
  printTransactionHistory,
  printTransactionConfirm,
  printHelp,
  clearScreen,
  box,
  shortenAddress
} from './ui/ascii.js';

const program = new Command();

program
  .name('tetsuo')
  .description('TETSUO Solana Wallet with Grok AI Assistant')
  .version('1.0.0');

// ============= NEW WALLET =============
program
  .command('new')
  .description('Create a new wallet')
  .option('-n, --name <name>', 'Wallet name')
  .option('--network <network>', 'Network: mainnet, devnet, testnet', 'mainnet')
  .action(async (options) => {
    clearScreen();
    printLogo();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Wallet name:',
        default: options.name || 'main',
        validate: (input: string) => input.length > 0 || 'Name is required'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Encryption password:',
        mask: '*',
        validate: (input: string) => input.length >= 8 || 'Password must be at least 8 characters'
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        mask: '*',
        validate: (input: string, answers: any) =>
          input === answers.password || 'Passwords do not match'
      }
    ]);

    const spinner = ora('Creating wallet...').start();

    try {
      const { wallet, mnemonic } = createWallet(
        answers.name,
        answers.password,
        options.network as 'mainnet' | 'devnet' | 'testnet'
      );

      spinner.succeed('Wallet created!');

      console.log(box(
        chalk.yellow('⚠️  SAVE THIS MNEMONIC - IT CANNOT BE RECOVERED!\n\n') +
        chalk.white(mnemonic) +
        chalk.gray('\n\nWrite it down and store in a safe place.'),
        'Recovery Phrase'
      ));

      printSuccess('Wallet created successfully!');
      console.log(chalk.gray('  Name: ') + chalk.white(wallet.name));
      console.log(chalk.gray('  Address: ') + chalk.cyan(wallet.address));
      console.log(chalk.gray('  Network: ') + chalk.white(wallet.network));

    } catch (error) {
      spinner.fail('Failed to create wallet');
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= IMPORT WALLET =============
program
  .command('import')
  .description('Import wallet from mnemonic')
  .option('-n, --name <name>', 'Wallet name')
  .option('--network <network>', 'Network: mainnet, devnet, testnet', 'mainnet')
  .action(async (options) => {
    clearScreen();
    printLogo();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Wallet name:',
        default: options.name || 'imported',
        validate: (input: string) => input.length > 0 || 'Name is required'
      },
      {
        type: 'password',
        name: 'mnemonic',
        message: 'Enter mnemonic phrase:',
        mask: '*',
        validate: (input: string) => {
          const words = input.trim().split(/\s+/);
          return (words.length === 12 || words.length === 24) || 'Must be 12 or 24 words';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Encryption password:',
        mask: '*',
        validate: (input: string) => input.length >= 8 || 'Password must be at least 8 characters'
      }
    ]);

    const spinner = ora('Importing wallet...').start();

    try {
      const wallet = importWalletFromMnemonic(
        answers.name,
        answers.mnemonic.trim(),
        answers.password,
        options.network as 'mainnet' | 'devnet' | 'testnet'
      );

      spinner.succeed('Wallet imported!');
      printSuccess('Wallet imported successfully!');
      console.log(chalk.gray('  Name: ') + chalk.white(wallet.name));
      console.log(chalk.gray('  Address: ') + chalk.cyan(wallet.address));

    } catch (error) {
      spinner.fail('Failed to import wallet');
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= LIST WALLETS =============
program
  .command('list')
  .description('List all wallets')
  .action(() => {
    const wallets = listWallets();
    const config = loadConfig();
    printWalletList(wallets, config.activeWallet || undefined);
  });

// ============= USE WALLET =============
program
  .command('use <name>')
  .description('Switch active wallet')
  .action((name: string) => {
    try {
      setActiveWallet(name);
      printSuccess(`Active wallet set to "${name}"`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= BALANCE =============
program
  .command('balance')
  .alias('bal')
  .description('Show wallet balance')
  .action(async () => {
    const activeWallet = getActiveWallet();
    if (!activeWallet) {
      printError('No active wallet. Create one with: tetsuo new');
      return;
    }

    const config = loadConfig();
    const client = new SolanaClient(config.rpcEndpoint, config.network);

    const spinner = ora('Fetching balance...').start();

    try {
      const [solBalance, tetsuoBalance] = await Promise.all([
        client.getSolBalance(activeWallet.address),
        client.getTetsuoBalance(activeWallet.address)
      ]);

      spinner.stop();

      printBalanceCard(
        tetsuoBalance.uiBalance,
        solBalance.toFixed(4),
        activeWallet.address
      );

    } catch (error) {
      spinner.fail('Failed to fetch balance');
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= RECEIVE =============
program
  .command('receive')
  .alias('qr')
  .description('Show address for receiving')
  .action(() => {
    const activeWallet = getActiveWallet();
    if (!activeWallet) {
      printError('No active wallet. Create one with: tetsuo new');
      return;
    }

    printQRCode(activeWallet.address);
    printInfo('Share this address to receive TETSUO tokens');
  });

// ============= SEND =============
program
  .command('send')
  .description('Send TETSUO tokens')
  .option('-a, --amount <amount>', 'Amount to send')
  .option('-t, --to <address>', 'Recipient address')
  .action(async (options) => {
    const activeWallet = getActiveWallet();
    if (!activeWallet) {
      printError('No active wallet. Create one with: tetsuo new');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'to',
        message: 'Recipient address:',
        default: options.to,
        validate: (input: string) => {
          return SolanaClient.isValidAddress(input) || 'Invalid Solana address';
        }
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Amount (TETSUO):',
        default: options.amount ? parseFloat(options.amount) : undefined,
        validate: (input: number) => input > 0 || 'Amount must be greater than 0'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Wallet password:',
        mask: '*'
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm transaction?',
        default: false
      }
    ]);

    if (!answers.confirm) {
      printWarning('Transaction cancelled');
      return;
    }

    const spinner = ora('Sending transaction...').start();

    try {
      // Unlock wallet
      const unlockedWallet = unlockWallet(activeWallet.name, answers.password);
      const keypair = createKeypairFromSecretKey(unlockedWallet.keypair.secretKey);

      // Send transaction
      const config = loadConfig();
      const client = new SolanaClient(config.rpcEndpoint, config.network);
      const result = await client.sendTetsuo(keypair, answers.to, answers.amount);

      if (result.success) {
        spinner.succeed('Transaction sent!');
        printSuccess(`Sent ${answers.amount} TETSUO to ${shortenAddress(answers.to)}`);
        console.log(chalk.gray('  Signature: ') + chalk.cyan(result.signature));
      } else {
        spinner.fail('Transaction failed');
        printError(result.error || 'Unknown error');
      }

    } catch (error) {
      spinner.fail('Transaction failed');
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= HISTORY =============
program
  .command('history')
  .alias('tx')
  .description('Show transaction history')
  .option('-l, --limit <limit>', 'Number of transactions', '10')
  .action(async (options) => {
    const activeWallet = getActiveWallet();
    if (!activeWallet) {
      printError('No active wallet. Create one with: tetsuo new');
      return;
    }

    const config = loadConfig();
    const client = new SolanaClient(config.rpcEndpoint, config.network);

    const spinner = ora('Fetching transactions...').start();

    try {
      const transactions = await client.getRecentTransactions(
        activeWallet.address,
        parseInt(options.limit)
      );

      spinner.stop();
      printTransactionHistory(transactions);

    } catch (error) {
      spinner.fail('Failed to fetch transactions');
      printError(error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============= INTERACTIVE MODE =============
program
  .command('chat', { isDefault: true })
  .description('Interactive mode with Grok AI')
  .action(async () => {
    clearScreen();
    printWelcome(
      getActiveWallet()?.name,
      getActiveWallet()?.address
    );

    const config = loadConfig();

    // Use mock client if no API key
    const grok = config.grokApiKey
      ? new GrokClient(config.grokApiKey)
      : new MockGrokClient();

    if (!config.grokApiKey) {
      printWarning('Grok API key not configured. Using offline mode.');
      printInfo('Set your API key: export TETSUO_GROK_API_KEY=your-key\n');
    }

    console.log(chalk.gray('Type your commands or questions. Type "exit" to quit.\n'));

    // Interactive loop
    while (true) {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.cyan('>'),
          prefix: ''
        }
      ]);

      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        printInfo('Goodbye!');
        break;
      }

      if (input.trim() === '') continue;

      const response = await grok.chat(input);
      printGrokResponse(response.content);

      // Execute parsed command if available
      if (response.parsedCommand) {
        await executeCommand(response.parsedCommand);
      }
    }
  });

// ============= COMMAND EXECUTOR =============
async function executeCommand(cmd: ParsedCommand): Promise<void> {
  const activeWallet = getActiveWallet();

  switch (cmd.action) {
    case 'balance':
      if (activeWallet) {
        const config = loadConfig();
        const client = new SolanaClient(config.rpcEndpoint, config.network);
        const bal = await client.getTetsuoBalance(activeWallet.address);
        printBalanceCard(bal.uiBalance, '0.0000', activeWallet.address);
      }
      break;

    case 'receive':
      if (activeWallet) {
        printQRCode(activeWallet.address);
      }
      break;

    case 'help':
      printHelp();
      break;

    case 'send':
      if (cmd.amount && cmd.recipient) {
        printTransactionConfirm(
          'Send',
          cmd.amount.toString(),
          cmd.token || 'TETSUO',
          cmd.recipient,
          '0.00025'
        );
      }
      break;
  }
}

// ============= MAIN =============
// Check for Grok API key in environment
const grokApiKey = process.env.TETSUO_GROK_API_KEY;
if (grokApiKey) {
  const config = loadConfig();
  config.grokApiKey = grokApiKey;
  // Note: We don't save API key to disk
}

program.parse();
