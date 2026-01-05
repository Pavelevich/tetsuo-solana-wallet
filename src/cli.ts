#!/usr/bin/env node
/**
 * TETSUO Solana Wallet - CLI
 *
 * Interactive CLI with slash commands (Claude Code style)
 * NO external AI APIs - 100% local and secure
 */

import readline from 'readline';
import {
  createWallet,
  importWalletFromMnemonic,
  unlockWallet,
  listWallets,
  getActiveWallet,
  setActiveWallet,
  deleteWallet,
  loadConfig,
  saveConfig
} from './core/wallet.js';
import { SolanaClient, createKeypairFromSecretKey } from './solana/client.js';
import {
  printLogo,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printBalanceCard,
  printQRCode,
  printWalletList,
  printTransactionHistory,
  shortenAddress,
  box
} from './ui/ascii.js';
import chalk from 'chalk';

// ============= SLASH COMMANDS =============
interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string[]) => Promise<void>;
}

const commands: Command[] = [];

function registerCommand(cmd: Command) {
  commands.push(cmd);
}

function findCommand(input: string): Command | undefined {
  const name = input.toLowerCase();
  return commands.find(c =>
    c.name === name || c.aliases.includes(name)
  );
}

// ============= COMMAND: HELP =============
registerCommand({
  name: 'help',
  aliases: ['h', '?'],
  description: 'Show available commands',
  usage: '/help [command]',
  handler: async (args) => {
    if (args[0]) {
      const cmd = findCommand(args[0]);
      if (cmd) {
        console.log(`\n${chalk.cyan('/' + cmd.name)} - ${cmd.description}`);
        console.log(chalk.gray(`Usage: ${cmd.usage}`));
        if (cmd.aliases.length > 0) {
          console.log(chalk.gray(`Aliases: ${cmd.aliases.map(a => '/' + a).join(', ')}`));
        }
        console.log();
      } else {
        printError(`Unknown command: ${args[0]}`);
      }
      return;
    }

    console.log(chalk.cyan('\n  Commands:\n'));
    commands.forEach(cmd => {
      const aliases = cmd.aliases.length > 0
        ? chalk.gray(` (${cmd.aliases.map(a => '/' + a).join(', ')})`)
        : '';
      console.log(`  ${chalk.white('/' + cmd.name.padEnd(12))} ${cmd.description}${aliases}`);
    });
    console.log(chalk.gray('\n  Type /help <command> for detailed usage\n'));
  }
});

// ============= COMMAND: NEW =============
registerCommand({
  name: 'new',
  aliases: ['create', 'generate'],
  description: 'Create a new wallet',
  usage: '/new <name>',
  handler: async (args) => {
    const name = args[0] || 'main';

    const password = await askPassword('Encryption password (min 8 chars): ');
    if (password.length < 8) {
      printError('Password must be at least 8 characters');
      return;
    }

    const confirm = await askPassword('Confirm password: ');
    if (password !== confirm) {
      printError('Passwords do not match');
      return;
    }

    try {
      console.log(chalk.gray('\nGenerating wallet...\n'));
      const { wallet, mnemonic } = createWallet(name, password, 'mainnet');

      console.log(box(
        chalk.yellow('SAVE THIS RECOVERY PHRASE!\n\n') +
        chalk.white(mnemonic) +
        chalk.gray('\n\nWrite it down and store safely. Cannot be recovered!'),
        'Recovery Phrase (24 words)'
      ));

      printSuccess(`Wallet "${name}" created`);
      console.log(chalk.gray('  Address: ') + chalk.cyan(wallet.address));
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Failed to create wallet');
    }
  }
});

// ============= COMMAND: IMPORT =============
registerCommand({
  name: 'import',
  aliases: ['restore'],
  description: 'Import wallet from recovery phrase',
  usage: '/import <name>',
  handler: async (args) => {
    const name = args[0] || 'imported';

    const mnemonic = await ask('Enter recovery phrase (12 or 24 words): ');
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      printError('Recovery phrase must be 12 or 24 words');
      return;
    }

    const password = await askPassword('Encryption password: ');
    if (password.length < 8) {
      printError('Password must be at least 8 characters');
      return;
    }

    try {
      const wallet = importWalletFromMnemonic(name, mnemonic.trim(), password, 'mainnet');
      printSuccess(`Wallet "${name}" imported`);
      console.log(chalk.gray('  Address: ') + chalk.cyan(wallet.address));
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Failed to import wallet');
    }
  }
});

// ============= COMMAND: LIST =============
registerCommand({
  name: 'list',
  aliases: ['ls', 'wallets'],
  description: 'List all wallets',
  usage: '/list',
  handler: async () => {
    const wallets = listWallets();
    const config = loadConfig();
    printWalletList(wallets, config.activeWallet || undefined);
  }
});

// ============= COMMAND: USE =============
registerCommand({
  name: 'use',
  aliases: ['switch', 'select'],
  description: 'Switch active wallet',
  usage: '/use <name>',
  handler: async (args) => {
    if (!args[0]) {
      printError('Please specify wallet name: /use <name>');
      return;
    }
    try {
      setActiveWallet(args[0]);
      printSuccess(`Switched to wallet "${args[0]}"`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Failed to switch wallet');
    }
  }
});

// ============= COMMAND: BALANCE =============
registerCommand({
  name: 'balance',
  aliases: ['bal', 'b'],
  description: 'Show wallet balance',
  usage: '/balance',
  handler: async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      printWarning('No active wallet. Create one with /new');
      return;
    }

    console.log(chalk.gray('\nFetching balance...\n'));
    const config = loadConfig();
    const client = new SolanaClient(config.rpcEndpoint, config.network);

    try {
      const [solBalance, tetsuoBalance] = await Promise.all([
        client.getSolBalance(wallet.address),
        client.getTetsuoBalance(wallet.address)
      ]);

      printBalanceCard(
        tetsuoBalance.uiBalance,
        solBalance.toFixed(4),
        wallet.address
      );
    } catch (error) {
      printError('Failed to fetch balance. Check network connection.');
    }
  }
});

// ============= COMMAND: WATCH (LIVE BALANCE) =============
registerCommand({
  name: 'watch',
  aliases: ['live', 'monitor'],
  description: 'Live balance updates (auto-refresh)',
  usage: '/watch [interval_seconds]',
  handler: async (args) => {
    const wallet = getActiveWallet();
    if (!wallet) {
      printWarning('No active wallet. Create one with /new');
      return;
    }

    const intervalSec = Math.max(2, Math.min(60, parseInt(args[0]) || 2));
    const config = loadConfig();
    const client = new SolanaClient(config.rpcEndpoint, config.network);

    let running = true;
    let refreshCount = 0;

    // Spinner frames
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIdx = 0;
    let spinnerInterval: NodeJS.Timeout | null = null;

    // Set up keypress listener
    const stdin = process.stdin;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
    }

    const onKey = (key: Buffer) => {
      const char = key.toString();
      if (char === 'q' || char === 'Q' || char === '\x1B' || char === '\x03') {
        running = false;
        if (spinnerInterval) clearInterval(spinnerInterval);
      }
    };
    stdin.on('data', onKey);

    // Main loop
    while (running) {
      try {
        // Clear screen and show header
        console.clear();
        console.log(chalk.cyan('\n  ◈ LIVE BALANCE MONITOR ◈'));
        console.log(chalk.gray('  ' + '─'.repeat(58)));
        console.log(chalk.dim(`  Auto-refresh: ${intervalSec}s | Press q to exit\n`));

        // Show animated spinner while fetching
        process.stdout.write(chalk.cyan(`  ${spinnerFrames[0]} Fetching balance...`));
        spinnerInterval = setInterval(() => {
          spinnerIdx = (spinnerIdx + 1) % spinnerFrames.length;
          process.stdout.write(`\r  ${chalk.cyan(spinnerFrames[spinnerIdx])} ${chalk.gray('Fetching balance...')}`);
        }, 80);

        // Fetch balances
        const [solBalance, tetsuoBalance] = await Promise.all([
          client.getSolBalance(wallet.address),
          client.getTetsuoBalance(wallet.address)
        ]);

        // Stop spinner
        if (spinnerInterval) {
          clearInterval(spinnerInterval);
          spinnerInterval = null;
        }

        // Clear spinner line and redraw screen
        console.clear();
        console.log(chalk.cyan('\n  ◈ LIVE BALANCE MONITOR ◈'));
        console.log(chalk.gray('  ' + '─'.repeat(58)));
        console.log(chalk.dim(`  Auto-refresh: ${intervalSec}s | Press q to exit\n`));

        // Display balance card
        printBalanceCard(
          tetsuoBalance.uiBalance,
          solBalance.toFixed(4),
          wallet.address
        );

        refreshCount++;
        const now = new Date().toLocaleTimeString();
        console.log(chalk.green(`  ✓ Updated: ${now}`) + chalk.gray(` (refresh #${refreshCount})`));
        console.log(chalk.dim('  Press q or ESC to exit'));

        // Countdown timer
        for (let i = intervalSec; i > 0 && running; i--) {
          process.stdout.write(`\r  ${chalk.yellow('○')} Next refresh in ${chalk.white(i)}s...  `);
          await new Promise(r => setTimeout(r, 1000));
        }

      } catch (error) {
        if (spinnerInterval) {
          clearInterval(spinnerInterval);
          spinnerInterval = null;
        }
        console.log(chalk.red('\n  ✗ Failed to fetch balance. Retrying...\n'));
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Cleanup
    if (stdin.isTTY) {
      stdin.setRawMode(false);
    }
    stdin.removeListener('data', onKey);

    console.clear();
    printLogo();
    showStatus();
    console.log(chalk.gray('  Live monitor stopped.\n'));
  }
});

// ============= COMMAND: MARKET (LIVE TRADING STATS) =============
registerCommand({
  name: 'market',
  aliases: ['stats', 'price', 'trading'],
  description: 'Live TETSUO market stats for traders',
  usage: '/market <seconds>  (e.g. /market 5)',
  handler: async (args) => {
    // Parse interval - REQUIRED
    const intervalSec = Math.max(1, Math.min(60, parseInt(args[0]) || 5));
    const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens/8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8';

    let running = true;
    let refreshCount = 0;
    let frameDrawn = false;

    // Set up keypress listener
    const stdin = process.stdin;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
    }

    const onKey = (key: Buffer) => {
      const char = key.toString();
      if (char === 'q' || char === 'Q' || char === '\x1B' || char === '\x03') {
        running = false;
      }
    };
    stdin.on('data', onKey);

    // Formatting helpers
    const formatPrice = (p: number) => (p < 0.01 ? p.toFixed(6) : p.toFixed(4)).padStart(10);
    const formatUsd = (n: number) => (n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${n.toFixed(2)}`).padStart(10);
    const formatChange = (c: number) => {
      const str = (c >= 0 ? `+${c.toFixed(2)}%` : `${c.toFixed(2)}%`).padStart(8);
      return c >= 0 ? chalk.green(str) : chalk.red(str);
    };
    const formatVol = (v: number) => ('$' + (v >= 1000000 ? `${(v/1000000).toFixed(2)}M` : v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(0))).padStart(9);

    const W = 62;
    const ln = (c: string, n: number) => c.repeat(n);
    const c = chalk.green;

    // Draw static frame ONCE
    const drawFrame = () => {
      console.clear();
      console.log();
      console.log('  ' + chalk.gray(ln('░', W)));
      console.log('  ' + chalk.green(ln('▓', W)));
      console.log('  ' + c('╔' + ln('═', W-2) + '╗'));
      console.log('  ' + c('║') + '      ' + chalk.bold.white('◈  T E T S U O   T R A D I N G  ◈') + `  [${intervalSec}s]` + '      ' + c('║'));
      console.log('  ' + c('╠' + ln('═', W-2) + '╣'));
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // Price line (row 7)
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // SOL price (row 8)
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // Changes (row 9)
      console.log('  ' + c('╠' + ln('═', W-2) + '╣'));
      console.log('  ' + c('║') + '                     ' + chalk.bold.cyan('─── VOLUME ───') + '                     ' + c('║'));
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // Volume (row 12)
      console.log('  ' + c('╠' + ln('═', W-2) + '╣'));
      console.log('  ' + c('║') + '                     ' + chalk.bold.cyan('─── MARKET ───') + '                     ' + c('║'));
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // MCap (row 15)
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // FDV (row 16)
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // Liq (row 17)
      console.log('  ' + c('╠' + ln('═', W-2) + '╣'));
      console.log('  ' + c('║') + '                  ' + chalk.bold.cyan('─── TRANSACTIONS ───') + '                  ' + c('║'));
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // TX 24H (row 20)
      console.log('  ' + c('║') + '                                                            ' + c('║'));  // TX 1H (row 21)
      console.log('  ' + c('╚' + ln('═', W-2) + '╝'));
      console.log('  ' + chalk.green(ln('▓', W)));
      console.log('  ' + chalk.gray(ln('░', W)));
      console.log();
      console.log('  ' + chalk.gray('Status: ─────────────────────────────────────'));  // row 26
      console.log('  ' + chalk.dim('Press q to exit | Source: DexScreener'));
      frameDrawn = true;
    };

    // Update only the data values using cursor positioning
    const updateData = (data: any) => {
      const pair = data.pairs?.[0];
      if (!pair) return;

      const price = parseFloat(pair.priceUsd) || 0;
      const priceNative = parseFloat(pair.priceNative) || 0;
      const change1h = pair.priceChange?.h1 || 0;
      const change6h = pair.priceChange?.h6 || 0;
      const change24h = pair.priceChange?.h24 || 0;
      const vol24h = pair.volume?.h24 || 0;
      const vol6h = pair.volume?.h6 || 0;
      const vol1h = pair.volume?.h1 || 0;
      const liq = pair.liquidity?.usd || 0;
      const mcap = pair.marketCap || 0;
      const fdv = pair.fdv || 0;
      const buys24h = pair.txns?.h24?.buys || 0;
      const sells24h = pair.txns?.h24?.sells || 0;
      const buys1h = pair.txns?.h1?.buys || 0;
      const sells1h = pair.txns?.h1?.sells || 0;

      const moveTo = (row: number, col: number) => `\x1B[${row};${col}H`;
      const clearLine = '\x1B[2K';

      // Row 7: Price USD
      process.stdout.write(moveTo(7, 5) + clearLine);
      process.stdout.write(moveTo(7, 3) + c('║') + '                  ' + chalk.bold.white('$' + formatPrice(price)) + '                    ' + c('║'));

      // Row 8: Price SOL
      process.stdout.write(moveTo(8, 5) + clearLine);
      process.stdout.write(moveTo(8, 3) + c('║') + '                ' + chalk.gray(priceNative.toFixed(8) + ' SOL') + '                  ' + c('║'));

      // Row 9: Changes
      process.stdout.write(moveTo(9, 5) + clearLine);
      const chg = `1H:${formatChange(change1h)} │ 6H:${formatChange(change6h)} │ 24H:${formatChange(change24h)}`;
      process.stdout.write(moveTo(9, 3) + c('║') + '    ' + chg + '    ' + c('║'));

      // Row 12: Volume
      process.stdout.write(moveTo(12, 5) + clearLine);
      const vol = `24H:${chalk.yellow(formatVol(vol24h))} │ 6H:${chalk.yellow(formatVol(vol6h))} │ 1H:${chalk.yellow(formatVol(vol1h))}`;
      process.stdout.write(moveTo(12, 3) + c('║') + '    ' + vol + '   ' + c('║'));

      // Row 15: Market Cap
      process.stdout.write(moveTo(15, 5) + clearLine);
      process.stdout.write(moveTo(15, 3) + c('║') + '    ' + chalk.gray('Market Cap:') + ' ' + chalk.white(formatUsd(mcap)) + '                              ' + c('║'));

      // Row 16: FDV
      process.stdout.write(moveTo(16, 5) + clearLine);
      process.stdout.write(moveTo(16, 3) + c('║') + '    ' + chalk.gray('FDV:       ') + ' ' + chalk.white(formatUsd(fdv)) + '                              ' + c('║'));

      // Row 17: Liquidity
      process.stdout.write(moveTo(17, 5) + clearLine);
      process.stdout.write(moveTo(17, 3) + c('║') + '    ' + chalk.gray('Liquidity: ') + ' ' + chalk.white(formatUsd(liq)) + '                              ' + c('║'));

      // Row 20: TX 24H
      process.stdout.write(moveTo(20, 5) + clearLine);
      const buyRatio24 = buys24h + sells24h > 0 ? (buys24h / (buys24h + sells24h) * 100).toFixed(0) : '0';
      process.stdout.write(moveTo(20, 3) + c('║') + '   24H: ' + chalk.green(String(buys24h).padStart(3) + ' buys') + ' / ' + chalk.red(String(sells24h).padStart(3) + ' sells') + '  ' + chalk.cyan(`(${buyRatio24}% buy)`) + '         ' + c('║'));

      // Row 21: TX 1H
      process.stdout.write(moveTo(21, 5) + clearLine);
      const buyRatio1 = buys1h + sells1h > 0 ? (buys1h / (buys1h + sells1h) * 100).toFixed(0) : '0';
      process.stdout.write(moveTo(21, 3) + c('║') + '    1H: ' + chalk.green(String(buys1h).padStart(3) + ' buys') + ' / ' + chalk.red(String(sells1h).padStart(3) + ' sells') + '  ' + chalk.cyan(`(${buyRatio1}% buy)`) + '         ' + c('║'));

      // Row 26: Status
      refreshCount++;
      const now = new Date().toLocaleTimeString();
      process.stdout.write(moveTo(26, 3) + clearLine);
      process.stdout.write(moveTo(26, 3) + chalk.green('✓ ') + chalk.white(now) + chalk.gray(` (#${refreshCount})`));

      // Move cursor to bottom
      process.stdout.write(moveTo(28, 1));
    };

    // Main loop
    while (running) {
      try {
        if (!frameDrawn) {
          drawFrame();
        }

        // Show loading indicator
        process.stdout.write('\x1B[26;3H' + chalk.cyan('⟳ ') + chalk.gray('Fetching...') + '          ');

        // Fetch data
        const response = await fetch(DEXSCREENER_API);
        const data = await response.json();

        if (!running) break;

        // Update values in place
        updateData(data);

        // Wait for interval
        for (let i = intervalSec; i > 0 && running; i--) {
          process.stdout.write(`\x1B[28;3H${chalk.yellow('○')} Next in ${chalk.white(i)}s...   `);
          await new Promise(r => setTimeout(r, 1000));
        }

      } catch (error) {
        process.stdout.write('\x1B[26;3H' + chalk.red('✗ Error fetching. Retry...') + '     ');
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Cleanup
    if (stdin.isTTY) {
      stdin.setRawMode(false);
    }
    stdin.removeListener('data', onKey);

    console.clear();
    printLogo();
    showStatus();
    console.log(chalk.gray('  Trading terminal closed.\n'));
  }
});

// ============= COMMAND: RECEIVE =============
registerCommand({
  name: 'receive',
  aliases: ['qr', 'address', 'addr'],
  description: 'Show address for receiving tokens',
  usage: '/receive',
  handler: async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      printWarning('No active wallet. Create one with /new');
      return;
    }
    printQRCode(wallet.address);
  }
});

// ============= COMMAND: SEND =============
registerCommand({
  name: 'send',
  aliases: ['transfer', 's'],
  description: 'Send TETSUO tokens',
  usage: '/send <amount> <address>',
  handler: async (args) => {
    const wallet = getActiveWallet();
    if (!wallet) {
      printWarning('No active wallet. Create one with /new');
      return;
    }

    let amount: number;
    let toAddress: string;

    if (args.length >= 2) {
      amount = parseFloat(args[0]);
      toAddress = args[1];
    } else {
      const amountStr = await ask('Amount (TETSUO): ');
      amount = parseFloat(amountStr);
      toAddress = await ask('Recipient address: ');
    }

    if (isNaN(amount) || amount <= 0) {
      printError('Invalid amount');
      return;
    }

    if (!SolanaClient.isValidAddress(toAddress)) {
      printError('Invalid Solana address');
      return;
    }

    // Show confirmation
    console.log(chalk.yellow('\n  Transaction Preview:'));
    console.log(chalk.gray('  ─────────────────────'));
    console.log(`  ${chalk.white('Send:')}    ${chalk.green(amount)} ${chalk.cyan('TETSUO')}`);
    console.log(`  ${chalk.white('To:')}      ${chalk.yellow(shortenAddress(toAddress))}`);
    console.log(`  ${chalk.white('Fee:')}     ${chalk.gray('~0.00025 SOL')}`);
    console.log();

    const confirm = await ask('Confirm? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      printWarning('Transaction cancelled');
      return;
    }

    const password = await askPassword('Wallet password: ');

    try {
      console.log(chalk.gray('\nSigning and sending...\n'));

      const unlockedWallet = unlockWallet(wallet.name, password);
      const keypair = createKeypairFromSecretKey(unlockedWallet.keypair.secretKey);

      const config = loadConfig();
      const client = new SolanaClient(config.rpcEndpoint, config.network);
      const result = await client.sendTetsuo(keypair, toAddress, amount);

      if (result.success) {
        printSuccess(`Sent ${amount} TETSUO to ${shortenAddress(toAddress)}`);
        console.log(chalk.gray('  Signature: ') + chalk.cyan(result.signature.slice(0, 32) + '...'));
      } else {
        printError(result.error || 'Transaction failed');
      }
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Transaction failed');
    }
  }
});

// ============= COMMAND: HISTORY =============
registerCommand({
  name: 'history',
  aliases: ['tx', 'transactions'],
  description: 'Show recent transactions',
  usage: '/history [count]',
  handler: async (args) => {
    const wallet = getActiveWallet();
    if (!wallet) {
      printWarning('No active wallet. Create one with /new');
      return;
    }

    const limit = parseInt(args[0]) || 10;
    console.log(chalk.gray('\nFetching transactions...\n'));

    const config = loadConfig();
    const client = new SolanaClient(config.rpcEndpoint, config.network);

    try {
      const transactions = await client.getRecentTransactions(wallet.address, limit);
      printTransactionHistory(transactions);
    } catch (error) {
      printError('Failed to fetch transactions');
    }
  }
});

// ============= COMMAND: DELETE =============
registerCommand({
  name: 'delete',
  aliases: ['remove', 'rm'],
  description: 'Delete a wallet',
  usage: '/delete <name>',
  handler: async (args) => {
    if (!args[0]) {
      printError('Please specify wallet name: /delete <name>');
      return;
    }

    const confirm = await ask(`Delete wallet "${args[0]}"? This cannot be undone! (yes/N): `);
    if (confirm !== 'yes') {
      printWarning('Cancelled');
      return;
    }

    try {
      deleteWallet(args[0]);
      printSuccess(`Wallet "${args[0]}" deleted`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Failed to delete wallet');
    }
  }
});

// ============= COMMAND: CLEAR =============
registerCommand({
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the screen',
  usage: '/clear',
  handler: async () => {
    console.clear();
    printLogo();
    showStatus();
  }
});

// ============= COMMAND: EXIT =============
registerCommand({
  name: 'exit',
  aliases: ['quit', 'q'],
  description: 'Exit the wallet',
  usage: '/exit',
  handler: async () => {
    console.log(chalk.gray('\nGoodbye!\n'));
    process.exit(0);
  }
});

// ============= HELPERS =============
let rl: readline.Interface;

function initReadline() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(chalk.gray(question), answer => {
      resolve(answer);
    });
  });
}

function askPassword(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(chalk.gray(question));

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let password = '';

    const onData = (char: Buffer) => {
      const c = char.toString();

      if (c === '\n' || c === '\r') {
        stdin.removeListener('data', onData);
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw || false);
        }
        console.log();
        resolve(password);
      } else if (c === '\u0003') { // Ctrl+C
        process.exit();
      } else if (c === '\u007F') { // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += c;
        process.stdout.write('*');
      }
    };

    stdin.on('data', onData);
  });
}

function showStatus() {
  const wallet = getActiveWallet();
  if (wallet) {
    console.log(chalk.gray('  Wallet: ') + chalk.white(wallet.name) +
                chalk.gray(' | ') + chalk.cyan(shortenAddress(wallet.address)));
  } else {
    console.log(chalk.yellow('  No wallet active. Type /new to create one.'));
  }
  console.log();
}

// ============= COMMAND MENU UI (Claude Code Style) =============
const COL_CMD = 14;  // Command column width
const COL_DESC = 36; // Description column width
const MENU_WIDTH = COL_CMD + COL_DESC + 3; // Total menu width

// ============= INTERACTIVE MENU PROMPT =============
async function interactivePrompt(): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    const wallet = getActiveWallet();
    const promptPrefix = wallet ? chalk.cyan(wallet.name) : chalk.yellow('no-wallet');
    const promptStr = `${promptPrefix} ${chalk.gray('>')} `;

    let input = '';
    let menuVisible = false;
    let selectedIndex = 0;
    let menuLineCount = 0;

    // Get filtered commands based on current input
    const getFiltered = (): Command[] => {
      const filter = input.startsWith('/') ? input.slice(1) : '';
      return filter
        ? commands.filter(c => c.name.startsWith(filter.toLowerCase()))
        : commands;
    };

    // Clear N lines below current position
    const clearBelow = (count: number) => {
      for (let i = 0; i < count; i++) {
        stdout.write('\n\x1B[2K'); // Move down and clear line
      }
      // Move back up
      if (count > 0) {
        stdout.write(`\x1B[${count}A`);
      }
    };

    // Render the full display (prompt + menu)
    const render = () => {
      const filtered = getFiltered();

      // Clear current line and write prompt
      stdout.write('\r\x1B[2K');
      stdout.write(promptStr + input);

      if (menuVisible && filtered.length > 0) {
        // Clamp selected index
        if (selectedIndex >= filtered.length) {
          selectedIndex = filtered.length - 1;
        }
        if (selectedIndex < 0) {
          selectedIndex = 0;
        }

        // Build menu lines
        const lines: string[] = [];
        lines.push(chalk.gray('─'.repeat(MENU_WIDTH)));

        filtered.forEach((cmd, i) => {
          const cmdName = ('/' + cmd.name).padEnd(COL_CMD);
          const desc = cmd.description.substring(0, COL_DESC).padEnd(COL_DESC);

          if (i === selectedIndex) {
            lines.push(chalk.cyan(' ' + cmdName + desc + ' '));
          } else {
            lines.push(chalk.gray(' ') + chalk.white(cmdName) + chalk.gray(desc) + chalk.gray(' '));
          }
        });

        lines.push(chalk.gray('─'.repeat(MENU_WIDTH)));
        lines.push(chalk.dim(' ↑↓ navigate • enter select • esc cancel'));

        // Clear old menu if it was longer
        if (menuLineCount > lines.length) {
          clearBelow(menuLineCount);
        }

        // Draw new menu
        stdout.write('\n');
        lines.forEach(line => stdout.write(line + '\n'));

        // Move cursor back to prompt line
        stdout.write(`\x1B[${lines.length + 1}A`);
        stdout.write('\r' + promptStr + input);

        menuLineCount = lines.length;
      } else if (menuLineCount > 0) {
        // Clear old menu
        clearBelow(menuLineCount);
        menuLineCount = 0;
      }
    };

    // Write initial prompt
    stdout.write(promptStr);

    if (!stdin.isTTY) {
      const tempRl = readline.createInterface({ input: stdin, output: stdout });
      tempRl.on('line', (line) => {
        tempRl.close();
        resolve(line);
      });
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();

    const onKeypress = (key: Buffer) => {
      const char = key.toString();

      // Arrow keys (may come as complete sequence or need checking)
      if (char === '\x1B[A' || char === '\x1B\x5bA') { // Up
        if (menuVisible) {
          selectedIndex = Math.max(0, selectedIndex - 1);
          render();
        }
        return;
      }

      if (char === '\x1B[B' || char === '\x1B\x5bB') { // Down
        if (menuVisible) {
          const filtered = getFiltered();
          selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
          render();
        }
        return;
      }

      // Ignore other escape sequences (left, right, etc)
      if (char.startsWith('\x1B[') || char.startsWith('\x1B\x5b')) {
        return;
      }

      // ESC key alone
      if (char === '\x1B') {
        if (menuVisible) {
          menuVisible = false;
          render();
        }
        return;
      }

      // Ctrl+C
      if (char === '\x03') {
        if (menuLineCount > 0) {
          clearBelow(menuLineCount);
        }
        stdout.write('\n');
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeypress);
        process.exit(0);
      }

      // Enter
      if (char === '\r' || char === '\n') {
        const filtered = getFiltered();
        let result = input;

        // If menu visible and we have selection, use it
        if (menuVisible && filtered.length > 0 && selectedIndex < filtered.length) {
          result = '/' + filtered[selectedIndex].name;
        }

        // Clear menu
        if (menuLineCount > 0) {
          clearBelow(menuLineCount);
        }

        stdout.write('\n');
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeypress);
        resolve(result);
        return;
      }

      // Backspace
      if (char === '\x7F' || char === '\b') {
        if (input.length > 0) {
          input = input.slice(0, -1);

          if (input === '' || !input.startsWith('/')) {
            menuVisible = false;
          }
          selectedIndex = 0;
          render();
        }
        return;
      }

      // Regular printable character
      if (char.length === 1 && char >= ' ' && char <= '~') {
        input += char;

        if (input.startsWith('/')) {
          menuVisible = true;
          selectedIndex = 0;
        } else {
          menuVisible = false;
        }
        render();
      }
    };

    stdin.on('data', onKeypress);
  });
}

// ============= MAIN REPL =============
async function repl() {
  console.clear();
  printLogo();
  showStatus();

  console.log(chalk.gray('  Type / for commands\n'));

  const prompt = async () => {
    const input = await interactivePrompt();
    const trimmed = input.trim();

    if (trimmed === '') {
      prompt();
      return;
    }

    // Handle slash commands
    if (trimmed.startsWith('/')) {
      const parts = trimmed.slice(1).split(/\s+/);
      const cmdName = parts[0];
      const args = parts.slice(1);

      const cmd = findCommand(cmdName);
      if (cmd) {
        await cmd.handler(args);
      } else {
        printError(`Unknown command: /${cmdName}. Type / to see commands.`);
      }
    } else {
      // Non-slash input - show hint
      console.log(chalk.gray('  Commands start with /. Type / to see available commands.'));
    }

    prompt();
  };

  prompt();
}

// ============= CLI ENTRY =============
const args = process.argv.slice(2);

if (args.length === 0) {
  // Interactive mode
  initReadline();
  repl();
} else if (args[0] === '--help' || args[0] === '-h') {
  printLogo();
  console.log(chalk.white('Usage:') + chalk.gray(' tetsuo [command]\n'));
  console.log(chalk.white('Commands:'));
  console.log(chalk.gray('  (no args)      Interactive mode'));
  console.log(chalk.gray('  --help         Show this help'));
  console.log(chalk.gray('  --version      Show version\n'));
  console.log(chalk.white('Interactive commands:'));
  commands.forEach(cmd => {
    console.log(chalk.gray(`  /${cmd.name.padEnd(12)} ${cmd.description}`));
  });
  console.log();
} else if (args[0] === '--version' || args[0] === '-v') {
  console.log('tetsuo-solana-wallet v1.0.0');
} else {
  // Run single command
  initReadline();
  const cmdName = args[0].replace(/^\//, '');
  const cmdArgs = args.slice(1);
  const cmd = findCommand(cmdName);

  if (cmd) {
    cmd.handler(cmdArgs).then(() => {
      rl.close();
      process.exit(0);
    });
  } else {
    printError(`Unknown command: ${args[0]}`);
    process.exit(1);
  }
}
