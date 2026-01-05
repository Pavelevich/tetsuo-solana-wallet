/**
 * TETSUO Solana Wallet - Premium CLI UI
 *
 * Perfectly symmetric, pixel-perfect terminal UI
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import qrcode from 'qrcode-terminal';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const W = 60; // Fixed width for all cards

// Custom gradients
const neonCyan = gradient(['#00f5ff', '#00d4aa', '#00f5ff']);
const neonPink = gradient(['#ff00ff', '#ff6ec7', '#ff00ff']);
const neonGold = gradient(['#ffd700', '#ffaa00', '#ffd700']);
const holographic = gradient(['#00f5ff', '#ff00ff', '#ffd700', '#00ff88']);

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - Ensure perfect alignment
// ═══════════════════════════════════════════════════════════════

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

function padRight(str: string, len: number): string {
  const visible = visibleLength(str);
  const padding = Math.max(0, len - visible);
  return str + ' '.repeat(padding);
}

function padCenter(str: string, len: number): string {
  const visible = visibleLength(str);
  const total = Math.max(0, len - visible);
  const left = Math.floor(total / 2);
  const right = total - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

function line(char: string, len: number): string {
  return char.repeat(len);
}

// Box drawing with guaranteed width
function boxTop(w: number, color: (s: string) => string): string {
  return color('╔' + line('═', w - 2) + '╗');
}

function boxMid(w: number, color: (s: string) => string): string {
  return color('╠' + line('═', w - 2) + '╣');
}

function boxBot(w: number, color: (s: string) => string): string {
  return color('╚' + line('═', w - 2) + '╝');
}

function boxRow(content: string, w: number, color: (s: string) => string): string {
  const inner = padRight(content, w - 4);
  return color('║') + ' ' + inner + ' ' + color('║');
}

function boxRowCenter(content: string, w: number, color: (s: string) => string): string {
  const inner = padCenter(content, w - 4);
  return color('║') + ' ' + inner + ' ' + color('║');
}

function boxEmpty(w: number, color: (s: string) => string): string {
  return color('║') + ' '.repeat(w - 2) + color('║');
}

// ═══════════════════════════════════════════════════════════════
// LOGO
// ═══════════════════════════════════════════════════════════════

export const TETSUO_LOGO = `
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝ `;

export const TETSUO_LOGO_SMALL = `╔╦╗╔═╗╔╦╗╔═╗╦ ╦╔═╗
 ║ ║╣  ║ ╚═╗║ ║║ ║
 ╩ ╚═╝ ╩ ╚═╝╚═╝╚═╝`;

export function printLogo(): void {
  console.log(holographic(TETSUO_LOGO));
  console.log();
  console.log(chalk.gray('   ◆ Solana Wallet │ 100% Secure & Local ◆'));
  console.log(chalk.gray('   ' + line('─', 44)));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// BALANCE CARD
// ═══════════════════════════════════════════════════════════════

export function printBalanceCard(
  tetsuoBalance: string,
  solBalance: string,
  address: string
): void {
  const tetsuoNum = parseFloat(tetsuoBalance.replace(/,/g, '')) || 0;
  const solNum = parseFloat(solBalance) || 0;

  const tetsuoFmt = tetsuoNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const solFmt = solNum.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const c = (s: string) => chalk.cyan(s);

  console.log();
  console.log('  ' + chalk.gray(line('░', W)));
  console.log('  ' + chalk.cyan(line('▓', W)));
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.white('◈  W A L L E T   B A L A N C E  ◈'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));
  console.log('  ' + boxEmpty(W, c));

  // TETSUO balance - large display
  const tetsuoDisplay = chalk.bold.green(tetsuoFmt) + ' ' + chalk.cyan('TETSUO');
  console.log('  ' + boxRowCenter(tetsuoDisplay, W, c));
  console.log('  ' + boxEmpty(W, c));

  // Separator
  console.log('  ' + boxRowCenter(chalk.gray(line('─', 30)), W, c));
  console.log('  ' + boxEmpty(W, c));

  // SOL balance
  const solDisplay = chalk.bold.yellow(solFmt) + ' ' + chalk.yellow('SOL');
  console.log('  ' + boxRowCenter(solDisplay, W, c));

  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));
  console.log('  ' + boxEmpty(W, c));

  // Address
  console.log('  ' + boxRow(chalk.gray('Address:'), W, c));
  console.log('  ' + boxRow(chalk.white(address), W, c));

  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxBot(W, c));
  console.log('  ' + chalk.cyan(line('▓', W)));
  console.log('  ' + chalk.gray(line('░', W)));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// RECEIVE / QR CODE CARD
// ═══════════════════════════════════════════════════════════════

export function printQRCode(address: string): void {
  const c = (s: string) => chalk.magenta(s);

  console.log();
  console.log('  ' + chalk.gray(line('░', W)));
  console.log('  ' + chalk.magenta(line('▓', W)));
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.white('◈  R E C E I V E   T E T S U O  ◈'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));
  console.log('  ' + boxEmpty(W, c));

  // Generate real QR code
  qrcode.generate(address, { small: true }, (qrString: string) => {
    const qrLines = qrString.split('\n').filter(l => l.trim());
    qrLines.forEach(row => {
      console.log('  ' + boxRowCenter(chalk.white(row), W, c));
    });

    console.log('  ' + boxEmpty(W, c));
    console.log('  ' + boxMid(W, c));
    console.log('  ' + boxEmpty(W, c));

    // Address
    console.log('  ' + boxRow(chalk.gray('Your Solana Address:'), W, c));
    console.log('  ' + boxEmpty(W, c));

    // Split address if needed
    if (address.length <= W - 6) {
      console.log('  ' + boxRowCenter(chalk.bold.cyan(address), W, c));
    } else {
      const mid = Math.ceil(address.length / 2);
      console.log('  ' + boxRowCenter(chalk.bold.cyan(address.slice(0, mid)), W, c));
      console.log('  ' + boxRowCenter(chalk.bold.cyan(address.slice(mid)), W, c));
    }

    console.log('  ' + boxEmpty(W, c));
    console.log('  ' + boxRowCenter(chalk.dim('Scan with any Solana wallet'), W, c));
    console.log('  ' + boxEmpty(W, c));
    console.log('  ' + boxBot(W, c));
    console.log('  ' + chalk.magenta(line('▓', W)));
    console.log('  ' + chalk.gray(line('░', W)));
    console.log();
  });
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION HISTORY
// ═══════════════════════════════════════════════════════════════

export function printTransactionHistory(
  transactions: { signature: string; blockTime: string | null; err: any }[]
): void {
  const c = (s: string) => chalk.yellow(s);

  console.log();
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.white('◈  T R A N S A C T I O N S  ◈'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));

  if (transactions.length === 0) {
    console.log('  ' + boxEmpty(W, c));
    console.log('  ' + boxRowCenter(chalk.gray('No transactions yet'), W, c));
    console.log('  ' + boxEmpty(W, c));
  } else {
    console.log('  ' + boxEmpty(W, c));

    transactions.forEach((tx, i) => {
      const status = tx.err ? chalk.red('✗') : chalk.green('✓');
      const sig = tx.signature.slice(0, 20) + '...';
      const time = tx.blockTime ? formatTime(tx.blockTime) : 'Pending';

      const row = `${status} ${chalk.white(sig)}  ${chalk.dim(time)}`;
      console.log('  ' + boxRow(row, W, c));
    });

    console.log('  ' + boxEmpty(W, c));
  }

  console.log('  ' + boxBot(W, c));
  console.log();
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

// ═══════════════════════════════════════════════════════════════
// WALLET LIST
// ═══════════════════════════════════════════════════════════════

export function printWalletList(
  wallets: { name: string; address: string; network: string }[],
  activeWallet?: string
): void {
  const c = (s: string) => chalk.cyan(s);

  console.log();
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.white('◈  Y O U R   W A L L E T S  ◈'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));

  if (wallets.length === 0) {
    console.log('  ' + boxEmpty(W, c));
    console.log('  ' + boxRowCenter(chalk.gray('No wallets found. Use /new to create one.'), W, c));
    console.log('  ' + boxEmpty(W, c));
  } else {
    console.log('  ' + boxEmpty(W, c));

    wallets.forEach(w => {
      const isActive = w.name === activeWallet;
      const icon = isActive ? chalk.green('▶') : chalk.gray('○');
      const name = isActive ? chalk.bold.white(w.name) : chalk.white(w.name);
      const addr = shortenAddress(w.address);
      const net = chalk.dim(`[${w.network}]`);

      const row = `${icon} ${name}  ${chalk.gray(addr)}  ${net}`;
      console.log('  ' + boxRow(row, W, c));
    });

    console.log('  ' + boxEmpty(W, c));
  }

  console.log('  ' + boxBot(W, c));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// HELP
// ═══════════════════════════════════════════════════════════════

export function printHelp(): void {
  const c = (s: string) => chalk.cyan(s);

  const cmds = [
    ['/new', 'Create a new wallet'],
    ['/import', 'Import from recovery phrase'],
    ['/list', 'List all wallets'],
    ['/use', 'Switch active wallet'],
    ['/balance', 'Show wallet balance'],
    ['/send', 'Send TETSUO tokens'],
    ['/receive', 'Show address for receiving'],
    ['/history', 'Show recent transactions'],
    ['/clear', 'Clear the screen'],
    ['/exit', 'Exit the wallet']
  ];

  console.log();
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.white('◈  T E T S U O   H E L P  ◈'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));
  console.log('  ' + boxEmpty(W, c));

  cmds.forEach(([cmd, desc]) => {
    const row = chalk.cyan(cmd!.padEnd(12)) + chalk.gray(desc);
    console.log('  ' + boxRow(row, W, c));
  });

  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxBot(W, c));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════

export function printSuccess(message: string, details?: string): void {
  console.log('  ' + chalk.green('✓') + ' ' + chalk.white(message));
  if (details) console.log('    ' + chalk.gray(details));
}

export function printError(message: string, details?: string): void {
  console.log('  ' + chalk.red('✗') + ' ' + chalk.white(message));
  if (details) console.log('    ' + chalk.gray(details));
}

export function printWarning(message: string): void {
  console.log('  ' + chalk.yellow('⚠') + ' ' + chalk.white(message));
}

export function printInfo(message: string): void {
  console.log('  ' + chalk.cyan('ℹ') + ' ' + chalk.white(message));
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function box(content: string, title?: string): string {
  const lines = content.split('\n');
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length), (title?.length || 0) + 4);
  const w = maxLen + 4;
  const c = (s: string) => chalk.cyan(s);

  let result = '';
  result += c('╭' + line('─', w - 2) + '╮') + '\n';

  if (title) {
    result += c('│') + padCenter(chalk.bold(title), w - 2) + c('│') + '\n';
    result += c('├' + line('─', w - 2) + '┤') + '\n';
  }

  lines.forEach(l => {
    result += c('│') + ' ' + padRight(l, w - 4) + ' ' + c('│') + '\n';
  });

  result += c('╰' + line('─', w - 2) + '╯');
  return result;
}

export function spinner(text: string): { stop: (success?: boolean, finalText?: string) => void } {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r  ${chalk.cyan(frames[i])} ${text}`);
    i = (i + 1) % frames.length;
  }, 80);

  return {
    stop: (success = true, finalText?: string) => {
      clearInterval(interval);
      const icon = success ? chalk.green('✓') : chalk.red('✗');
      process.stdout.write(`\r  ${icon} ${finalText || text}\n`);
    }
  };
}

export function clearScreen(): void {
  console.clear();
}

export function divider(): void {
  console.log('  ' + chalk.gray(line('─', W - 4)));
}

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════

export function printWelcome(walletName?: string, address?: string): void {
  printLogo();
  if (walletName && address) {
    console.log('  ' + chalk.cyan('◆') + ' Active: ' + chalk.white(walletName) + chalk.gray(' │ ') + chalk.dim(shortenAddress(address)));
  } else {
    console.log('  ' + chalk.yellow('◆') + ' No wallet active. Use /new to create one.');
  }
  console.log();
}

export function formatBalance(symbol: string, balance: string, usdValue?: string): string {
  return `${chalk.bold.white(balance)} ${chalk.cyan(symbol)}${usdValue ? chalk.gray(` ($${usdValue})`) : ''}`;
}

export function printTransactionConfirm(
  action: string,
  amount: string,
  token: string,
  recipient: string,
  fee: string
): void {
  const c = (s: string) => chalk.yellow(s);

  console.log();
  console.log('  ' + boxTop(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRowCenter(chalk.bold.yellow('⚠  CONFIRM TRANSACTION  ⚠'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxMid(W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxRow(chalk.gray('Action:  ') + chalk.white(action), W, c));
  console.log('  ' + boxRow(chalk.gray('Amount:  ') + chalk.green(amount) + ' ' + chalk.cyan(token), W, c));
  console.log('  ' + boxRow(chalk.gray('To:      ') + chalk.white(recipient), W, c));
  console.log('  ' + boxRow(chalk.gray('Fee:     ') + chalk.dim(fee + ' SOL'), W, c));
  console.log('  ' + boxEmpty(W, c));
  console.log('  ' + boxBot(W, c));
  console.log();
}
