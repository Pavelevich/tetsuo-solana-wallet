/**
 * TETSUO Solana Wallet - ASCII Art UI Components
 *
 * Beautiful terminal UI inspired by Claude Code
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import boxen from 'boxen';

// Custom gradient for TETSUO branding
const tetsuoGradient = gradient(['#00ff88', '#00d4ff', '#ff00ff']);
const warningGradient = gradient(['#ff6600', '#ff0066']);

/**
 * Main TETSUO ASCII logo
 */
export const TETSUO_LOGO = `
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝
`;

/**
 * Smaller inline logo
 */
export const TETSUO_LOGO_SMALL = `
╔╦╗╔═╗╔╦╗╔═╗╦ ╦╔═╗
 ║ ║╣  ║ ╚═╗║ ║║ ║
 ╩ ╚═╝ ╩ ╚═╝╚═╝╚═╝
`;

/**
 * Print the main logo with gradient
 */
export function printLogo(): void {
  console.log(tetsuoGradient(TETSUO_LOGO));
  console.log(chalk.gray('  Solana Wallet - 100% Secure & Local'));
  console.log(chalk.gray('  ────────────────────────────────────\n'));
}

/**
 * Print welcome screen
 */
export function printWelcome(walletName?: string, address?: string): void {
  printLogo();

  if (walletName && address) {
    console.log(chalk.cyan('  Active Wallet: ') + chalk.white(walletName));
    console.log(chalk.cyan('  Address: ') + chalk.gray(shortenAddress(address)));
  } else {
    console.log(chalk.yellow('  No wallet active. Create one with: tetsuo new'));
  }
  console.log();
}

/**
 * Create a styled box
 */
export function box(content: string, title?: string): string {
  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: title,
    titleAlignment: 'center'
  });
}

/**
 * Format balance display
 */
export function formatBalance(
  symbol: string,
  balance: string,
  usdValue?: string
): string {
  const balanceStr = chalk.bold.white(balance);
  const symbolStr = chalk.cyan(symbol);
  const usdStr = usdValue ? chalk.gray(` ($${usdValue})`) : '';

  return `${balanceStr} ${symbolStr}${usdStr}`;
}

/**
 * Print balance card
 */
export function printBalanceCard(
  tetsuoBalance: string,
  solBalance: string,
  address: string
): void {
  const content = `
${chalk.gray('TETSUO Balance')}
${chalk.bold.green(tetsuoBalance)} ${chalk.cyan('TETSUO')}

${chalk.gray('SOL Balance')}
${chalk.bold.yellow(solBalance)} ${chalk.yellow('SOL')}

${chalk.gray('Address')}
${chalk.dim(address)}
`;

  console.log(box(content, 'Wallet Balance'));
}

/**
 * Print transaction confirmation
 */
export function printTransactionConfirm(
  action: string,
  amount: string,
  token: string,
  recipient: string,
  fee: string
): void {
  const content = `
${chalk.white('Action:')}     ${chalk.cyan(action)}
${chalk.white('Amount:')}     ${chalk.green(amount)} ${chalk.cyan(token)}
${chalk.white('To:')}         ${chalk.yellow(shortenAddress(recipient))}
${chalk.white('Fee:')}        ${chalk.gray(fee + ' SOL')}

${chalk.bgYellow.black(' CONFIRM THIS TRANSACTION? ')}
`;

  console.log(box(content, '⚠️  Transaction Preview'));
}

/**
 * Print success message
 */
export function printSuccess(message: string, details?: string): void {
  console.log(chalk.green('✓ ') + chalk.white(message));
  if (details) {
    console.log(chalk.gray('  ' + details));
  }
}

/**
 * Print error message
 */
export function printError(message: string, details?: string): void {
  console.log(chalk.red('✗ ') + chalk.white(message));
  if (details) {
    console.log(chalk.gray('  ' + details));
  }
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
  console.log(chalk.yellow('⚠ ') + chalk.white(message));
}

/**
 * Print info message
 */
export function printInfo(message: string): void {
  console.log(chalk.cyan('ℹ ') + chalk.white(message));
}

/**
 * Print QR code placeholder (ASCII)
 */
export function printQRCode(address: string): void {
  // Simple ASCII QR representation (actual QR generation would need a library)
  const qrPlaceholder = `
  ██████████████████████████
  ██                      ██
  ██  ████████████████    ██
  ██  ██            ██    ██
  ██  ██  ████████  ██    ██
  ██  ██  ██    ██  ██    ██
  ██  ██  ████████  ██    ██
  ██  ██            ██    ██
  ██  ████████████████    ██
  ██                      ██
  ██████████████████████████
`;

  console.log(box(chalk.white(qrPlaceholder) + '\n' + chalk.cyan(address), 'Scan to Send TETSUO'));
}

/**
 * Print wallet list
 */
export function printWalletList(
  wallets: { name: string; address: string; network: string }[],
  activeWallet?: string
): void {
  if (wallets.length === 0) {
    console.log(chalk.yellow('No wallets found. Create one with: tetsuo new'));
    return;
  }

  console.log(chalk.cyan('\nYour Wallets:\n'));

  wallets.forEach((w, i) => {
    const isActive = w.name === activeWallet;
    const prefix = isActive ? chalk.green('▶ ') : chalk.gray('  ');
    const name = isActive ? chalk.bold.white(w.name) : chalk.white(w.name);
    const addr = chalk.gray(shortenAddress(w.address));
    const network = chalk.dim(`[${w.network}]`);

    console.log(`${prefix}${name} ${addr} ${network}`);
  });
  console.log();
}

/**
 * Print transaction history
 */
export function printTransactionHistory(
  transactions: {
    signature: string;
    blockTime: string | null;
    err: any;
  }[]
): void {
  if (transactions.length === 0) {
    console.log(chalk.yellow('No transactions found.'));
    return;
  }

  console.log(chalk.cyan('\nRecent Transactions:\n'));

  transactions.forEach((tx, i) => {
    const status = tx.err ? chalk.red('✗') : chalk.green('✓');
    const sig = chalk.gray(tx.signature.slice(0, 20) + '...');
    const time = tx.blockTime ? chalk.dim(tx.blockTime) : chalk.dim('pending');

    console.log(`${status} ${sig} ${time}`);
  });
  console.log();
}

/**
 * Print help menu
 */
export function printHelp(): void {
  const help = `
${chalk.cyan('Commands:')}

  ${chalk.white('tetsuo new')}              Create a new wallet
  ${chalk.white('tetsuo import')}           Import wallet from mnemonic
  ${chalk.white('tetsuo list')}             List all wallets
  ${chalk.white('tetsuo use <name>')}       Switch active wallet
  ${chalk.white('tetsuo balance')}          Show wallet balance
  ${chalk.white('tetsuo send')}             Send TETSUO tokens
  ${chalk.white('tetsuo receive')}          Show address/QR for receiving
  ${chalk.white('tetsuo history')}          Show transaction history
  ${chalk.white('tetsuo')}                  Interactive mode

${chalk.cyan('Interactive Mode:')}

  Use slash commands (Claude Code style):
  ${chalk.gray('/help')}     Show available commands
  ${chalk.gray('/balance')}  Check wallet balance
  ${chalk.gray('/send')}     Send TETSUO tokens

${chalk.cyan('Options:')}

  ${chalk.white('--network')}    mainnet | devnet | testnet
  ${chalk.white('--help')}       Show this help
  ${chalk.white('--version')}    Show version
`;

  console.log(box(help, 'TETSUO Wallet Help'));
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Print spinner/loading indicator
 */
export function spinner(text: string): { stop: (success?: boolean, finalText?: string) => void } {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i])} ${text}`);
    i = (i + 1) % frames.length;
  }, 80);

  return {
    stop: (success = true, finalText?: string) => {
      clearInterval(interval);
      const icon = success ? chalk.green('✓') : chalk.red('✗');
      process.stdout.write(`\r${icon} ${finalText || text}\n`);
    }
  };
}

/**
 * Clear screen
 */
export function clearScreen(): void {
  console.clear();
}

/**
 * Print divider line
 */
export function divider(): void {
  console.log(chalk.gray('─'.repeat(50)));
}
