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

function drawCommandMenu(selectedIndex: number, filter: string = ''): string[] {
  const lines: string[] = [];

  // Filter commands based on input
  const filtered = filter
    ? commands.filter(c => c.name.startsWith(filter.toLowerCase()))
    : commands;

  if (filtered.length === 0) {
    return [];
  }

  // Top separator
  lines.push(chalk.gray('─'.repeat(MENU_WIDTH)));

  // Command rows
  filtered.forEach((cmd, i) => {
    const isSelected = i === selectedIndex;
    const cmdName = ('/' + cmd.name).padEnd(COL_CMD);
    const desc = cmd.description.substring(0, COL_DESC).padEnd(COL_DESC);

    if (isSelected) {
      // Selected row - cyan text color only
      lines.push(chalk.cyan(' ' + cmdName + desc + ' '));
    } else {
      lines.push(chalk.gray(' ') + chalk.white(cmdName) + chalk.gray(desc) + chalk.gray(' '));
    }
  });

  // Bottom separator
  lines.push(chalk.gray('─'.repeat(MENU_WIDTH)));
  lines.push(chalk.dim(' ↑↓ navigate • enter select • esc cancel'));

  return lines;
}

function clearMenuLines(lineCount: number) {
  // Move cursor up and clear each line
  for (let i = 0; i < lineCount; i++) {
    process.stdout.write('\x1B[1A'); // Move up
    process.stdout.write('\x1B[2K'); // Clear line
  }
}

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
    let menuLines: string[] = [];
    let cursorPos = 0;

    // Get filtered commands
    const getFilteredCommands = () => {
      const filter = input.startsWith('/') ? input.slice(1) : '';
      return filter
        ? commands.filter(c => c.name.startsWith(filter.toLowerCase()))
        : commands;
    };

    const redrawPrompt = () => {
      // Clear current line and redraw prompt with input
      stdout.write('\r\x1B[2K');
      stdout.write(promptStr + input);
    };

    const showMenu = () => {
      const filter = input.startsWith('/') ? input.slice(1) : '';
      const filtered = getFilteredCommands();

      if (filtered.length === 0) {
        hideMenu();
        return;
      }

      // Adjust selected index if out of bounds
      if (selectedIndex >= filtered.length) {
        selectedIndex = filtered.length - 1;
      }

      menuLines = drawCommandMenu(selectedIndex, filter);

      // Print menu below prompt
      stdout.write('\n');
      menuLines.forEach(line => stdout.write(line + '\n'));

      // Move cursor back to prompt
      stdout.write(`\x1B[${menuLines.length + 1}A`);
      stdout.write('\r' + promptStr + input);

      menuVisible = true;
    };

    const hideMenu = () => {
      if (menuVisible && menuLines.length > 0) {
        // Save cursor position
        stdout.write('\x1B[s');
        // Move down and clear menu lines
        stdout.write('\n');
        for (let i = 0; i < menuLines.length; i++) {
          stdout.write('\x1B[2K\n');
        }
        // Restore cursor position
        stdout.write('\x1B[u');
        // Move back up
        stdout.write(`\x1B[${menuLines.length}A`);
        redrawPrompt();
      }
      menuVisible = false;
      menuLines = [];
    };

    const updateMenu = () => {
      if (menuVisible) {
        hideMenu();
        showMenu();
      }
    };

    // Write initial prompt
    stdout.write(promptStr);

    if (!stdin.isTTY) {
      // Non-interactive mode - use readline
      const tempRl = readline.createInterface({ input: stdin, output: stdout });
      tempRl.on('line', (line) => {
        tempRl.close();
        resolve(line);
      });
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();

    let escapeBuffer = '';
    let escapeTimeout: NodeJS.Timeout | null = null;

    const processEscapeSequence = (seq: string) => {
      if (seq === '\x1B[A') { // Up arrow
        if (menuVisible) {
          selectedIndex = Math.max(0, selectedIndex - 1);
          updateMenu();
        }
      } else if (seq === '\x1B[B') { // Down arrow
        if (menuVisible) {
          const filtered = getFilteredCommands();
          selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
          updateMenu();
        }
      } else if (seq === '\x1B' || seq === '\x1B[' || seq === '\x1B[C' || seq === '\x1B[D') {
        // ESC alone or left/right arrows - just close menu if ESC
        if (seq === '\x1B' && menuVisible) {
          hideMenu();
        }
      }
      escapeBuffer = '';
    };

    const onKeypress = (key: Buffer) => {
      const char = key.toString();

      // Handle escape sequences (arrow keys, ESC)
      if (char === '\x1B' || escapeBuffer.length > 0) {
        escapeBuffer += char;

        // Clear any existing timeout
        if (escapeTimeout) {
          clearTimeout(escapeTimeout);
        }

        // Check if we have a complete sequence
        if (escapeBuffer.length >= 3 && escapeBuffer.startsWith('\x1B[')) {
          processEscapeSequence(escapeBuffer);
          return;
        }

        // Set timeout for standalone ESC
        escapeTimeout = setTimeout(() => {
          processEscapeSequence(escapeBuffer);
        }, 50);
        return;
      }

      // Handle special keys
      if (char === '\x03') { // Ctrl+C
        hideMenu();
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeypress);
        process.exit(0);
      }

      if (char === '\r' || char === '\n') { // Enter
        const wasMenuVisible = menuVisible;
        hideMenu();
        stdout.write('\n');
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeypress);

        // If menu was visible, use selected command
        if (wasMenuVisible && input.startsWith('/')) {
          const filtered = getFilteredCommands();
          if (filtered.length > 0 && selectedIndex < filtered.length) {
            resolve('/' + filtered[selectedIndex].name);
            return;
          }
        }
        resolve(input);
        return;
      }

      if (char === '\x7F' || char === '\b') { // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          redrawPrompt();

          if (input === '' || !input.startsWith('/')) {
            hideMenu();
          } else {
            selectedIndex = 0;
            updateMenu();
          }
        }
        return;
      }

      // Regular character input (printable ASCII)
      if (char.length === 1 && char >= ' ' && char <= '~') {
        input += char;
        redrawPrompt();

        if (input === '/') {
          selectedIndex = 0;
          showMenu();
        } else if (input.startsWith('/')) {
          selectedIndex = 0;
          if (menuVisible) {
            updateMenu();
          } else {
            showMenu();
          }
        } else if (menuVisible) {
          hideMenu();
        }
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
