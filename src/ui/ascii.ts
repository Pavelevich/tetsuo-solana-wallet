/**
 * TETSUO Solana Wallet - Premium CLI UI
 *
 * Cyberpunk-Luxury Fintech Aesthetic
 * Neo-Tokyo meets High-End Crypto
 */

import chalk from 'chalk';
import gradient from 'gradient-string';

// ═══════════════════════════════════════════════════════════════
// CUSTOM GRADIENTS - Cyberpunk Color Palette
// ═══════════════════════════════════════════════════════════════

const neonCyan = gradient(['#00f5ff', '#00d4aa', '#00f5ff']);
const neonPink = gradient(['#ff00ff', '#ff6ec7', '#ff00ff']);
const neonGreen = gradient(['#00ff88', '#39ff14', '#00ff88']);
const neonGold = gradient(['#ffd700', '#ffaa00', '#ffd700']);
const holographic = gradient(['#00f5ff', '#ff00ff', '#ffd700', '#00ff88']);
const sunset = gradient(['#ff6b6b', '#ffd93d', '#6bcb77']);
const ice = gradient(['#a8edea', '#fed6e3', '#a8edea']);

// ═══════════════════════════════════════════════════════════════
// MAIN LOGO - Holographic Effect
// ═══════════════════════════════════════════════════════════════

const LOGO_ART = `
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 ██░▄▄▄░██░▄▄▄██▄░▄██░▄▄▄░██░██░██░▄▄▄░██░▄▄▄░██░▄▄▄░██░▄▄▄░██
 ██▄▄▄▀▀██░▄▄▄████░████▀▄▄▀██░██░██░███░██░███░██░███░██░███░██
 ██░▀▀▀░██░▀▀▀████░████░▀▀░██▄▀▀▄██░▀▀▀░██░▀▀▀░██░▀▀▀░██░▀▀▀░██
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`;

export const TETSUO_LOGO = `
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝ `;

export const TETSUO_LOGO_SMALL = `
╔╦╗╔═╗╔╦╗╔═╗╦ ╦╔═╗
 ║ ║╣  ║ ╚═╗║ ║║ ║
 ╩ ╚═╝ ╩ ╚═╝╚═╝╚═╝`;

export function printLogo(): void {
  console.log(holographic(TETSUO_LOGO));
  console.log();
  console.log(chalk.gray('  ') + neonCyan('◆') + chalk.gray(' Solana Wallet ') + chalk.gray('│') + chalk.gray(' 100% Secure & Local ') + neonCyan('◆'));
  console.log(chalk.gray('  ─────────────────────────────────────────────────'));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// BALANCE CARD - Hero Component with Glow Effect
// ═══════════════════════════════════════════════════════════════

export function printBalanceCard(
  tetsuoBalance: string,
  solBalance: string,
  address: string
): void {
  const tetsuoNum = parseFloat(tetsuoBalance.replace(/,/g, '')) || 0;
  const solNum = parseFloat(solBalance) || 0;

  // Format numbers with proper decimals
  const formatNum = (n: number, dec: number) => n.toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });

  const tetsuoFmt = formatNum(tetsuoNum, 2);
  const solFmt = formatNum(solNum, 4);

  // Large stylized numbers for TETSUO
  const bigNum = createBigNumber(tetsuoFmt);

  console.log();

  // Top glow effect
  console.log(chalk.gray('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log(chalk.cyan('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'));

  // Header with gradient border
  console.log(neonCyan('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));

  // Title with icon
  const title = '◈  W A L L E T   B A L A N C E  ◈';
  console.log(neonCyan('  ║') + centerText(chalk.bold.white(title), 58) + neonCyan('║'));

  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));
  console.log(neonCyan('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));

  // TETSUO Section with large numbers
  console.log(neonCyan('  ║') + '  ' + chalk.gray('┌─────────────────────────────────────────────────────┐') + ' ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + '                                                     ' + chalk.gray('│') + ' ' + neonCyan('║'));

  // Big balance display
  bigNum.forEach(line => {
    console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + '   ' + neonGreen(line.padEnd(49)) + chalk.gray('│') + ' ' + neonCyan('║'));
  });

  // TETSUO label with glow
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + '                                                     ' + chalk.gray('│') + ' ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + centerText(chalk.bold.cyan('T E T S U O'), 53) + chalk.gray('│') + ' ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + centerText(chalk.gray('━━━━━━━━━━━━━'), 53) + chalk.gray('│') + ' ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + '                                                     ' + chalk.gray('│') + ' ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('└─────────────────────────────────────────────────────┘') + ' ' + neonCyan('║'));

  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));

  // SOL Balance - Secondary display
  console.log(neonCyan('  ║') + '  ' + chalk.gray('┌───────────────────────┐') + '                               ' + neonCyan('║'));
  const solDisplay = `  ${chalk.bold.yellow(solFmt)} ${chalk.yellow('SOL')}  `;
  console.log(neonCyan('  ║') + '  ' + chalk.gray('│') + solDisplay.padEnd(32) + chalk.gray('│') + '                               ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.gray('└───────────────────────┘') + '                               ' + neonCyan('║'));

  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));
  console.log(neonCyan('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));

  // Address section
  console.log(neonCyan('  ║') + '  ' + chalk.gray('ADDRESS') + '                                                   ' + neonCyan('║'));
  console.log(neonCyan('  ║') + '  ' + chalk.white(address) + ' '.repeat(Math.max(0, 56 - address.length)) + neonCyan('║'));

  console.log(neonCyan('  ║') + chalk.black('                                                          ') + neonCyan('║'));
  console.log(neonCyan('  ╚══════════════════════════════════════════════════════════╝'));

  // Bottom glow
  console.log(chalk.cyan('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'));
  console.log(chalk.gray('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log();
}

// Create large stylized numbers
function createBigNumber(numStr: string): string[] {
  const digits: { [key: string]: string[] } = {
    '0': ['█▀█', '█ █', '▀▀▀'],
    '1': [' █ ', ' █ ', ' ▀ '],
    '2': ['▀▀█', '█▀▀', '▀▀▀'],
    '3': ['▀▀█', ' ▀█', '▀▀▀'],
    '4': ['█ █', '▀▀█', '  ▀'],
    '5': ['█▀▀', '▀▀█', '▀▀▀'],
    '6': ['█▀▀', '█▀█', '▀▀▀'],
    '7': ['▀▀█', '  █', '  ▀'],
    '8': ['█▀█', '█▀█', '▀▀▀'],
    '9': ['█▀█', '▀▀█', '▀▀▀'],
    ',': ['   ', '   ', ' ▄ '],
    '.': ['   ', '   ', ' ▄ '],
    ' ': ['   ', '   ', '   ']
  };

  const lines: string[] = ['', '', ''];
  for (const char of numStr) {
    const d = digits[char] || ['   ', '   ', '   '];
    lines[0] += d[0] + ' ';
    lines[1] += d[1] + ' ';
    lines[2] += d[2] + ' ';
  }
  return lines;
}

// ═══════════════════════════════════════════════════════════════
// RECEIVE CARD - Neon QR Display
// ═══════════════════════════════════════════════════════════════

export function printQRCode(address: string): void {
  console.log();

  // Top glow effect
  console.log(chalk.gray('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log(chalk.magenta('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'));

  console.log(neonPink('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));

  // Title
  const title = '◈  R E C E I V E   T E T S U O  ◈';
  console.log(neonPink('  ║') + centerText(chalk.bold.white(title), 58) + neonPink('║'));

  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));
  console.log(neonPink('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));

  // QR Code with glow effect
  const qr = [
    '██████████████  ████  ██████████████',
    '██          ██  ████  ██          ██',
    '██  ██████  ██  ████  ██  ██████  ██',
    '██  ██████  ██        ██  ██████  ██',
    '██  ██████  ██  ████  ██  ██████  ██',
    '██          ██  ████  ██          ██',
    '██████████████  ██  ████████████████',
    '                ████                ',
    '████████  ██████    ████  ██████████',
    '██    ████      ████    ██    ██  ██',
    '████████████████████████████████████',
    '                ██  ████████████████',
    '██████████████  ████      ██████  ██',
    '██          ██  ██  ████████    ████',
    '██  ██████  ██  ████████████████████',
    '██  ██████  ██      ████████  ██████',
    '██  ██████  ██  ██████████    ██  ██',
    '██          ██    ████████  ████████',
    '██████████████  ██  ██████████  ████'
  ];

  qr.forEach(line => {
    const padded = centerText(chalk.white(line), 58);
    console.log(neonPink('  ║') + padded + neonPink('║'));
  });

  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));
  console.log(neonPink('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));

  // Address display
  console.log(neonPink('  ║') + '  ' + chalk.gray('YOUR SOLANA ADDRESS') + '                                       ' + neonPink('║'));
  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));

  // Split address if too long
  if (address.length > 44) {
    const mid = Math.floor(address.length / 2);
    console.log(neonPink('  ║') + centerText(chalk.bold.cyan(address.slice(0, mid)), 58) + neonPink('║'));
    console.log(neonPink('  ║') + centerText(chalk.bold.cyan(address.slice(mid)), 58) + neonPink('║'));
  } else {
    console.log(neonPink('  ║') + centerText(chalk.bold.cyan(address), 58) + neonPink('║'));
  }

  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));

  // Hint
  console.log(neonPink('  ║') + centerText(chalk.dim('Share this address to receive TETSUO or SOL'), 58) + neonPink('║'));

  console.log(neonPink('  ║') + chalk.black('                                                          ') + neonPink('║'));
  console.log(neonPink('  ╚══════════════════════════════════════════════════════════╝'));

  // Bottom glow
  console.log(chalk.magenta('  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'));
  console.log(chalk.gray('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION HISTORY - Timeline Style
// ═══════════════════════════════════════════════════════════════

export function printTransactionHistory(
  transactions: { signature: string; blockTime: string | null; err: any }[]
): void {
  console.log();

  console.log(neonGold('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));

  const title = '◈  T R A N S A C T I O N   H I S T O R Y  ◈';
  console.log(neonGold('  ║') + centerText(chalk.bold.white(title), 58) + neonGold('║'));

  console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));
  console.log(neonGold('  ╠══════════════════════════════════════════════════════════╣'));

  if (transactions.length === 0) {
    console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));
    console.log(neonGold('  ║') + centerText(chalk.gray('No transactions yet'), 58) + neonGold('║'));
    console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));
  } else {
    console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));

    transactions.forEach((tx, i) => {
      const isLast = i === transactions.length - 1;
      const status = tx.err ? chalk.red('●') : chalk.green('●');
      const statusText = tx.err ? chalk.red('FAILED') : chalk.green('SUCCESS');
      const sig = tx.signature.slice(0, 16) + '...';
      const time = tx.blockTime ? formatTime(tx.blockTime) : 'Pending';

      // Timeline connector
      const connector = isLast ? '└' : '├';
      const line = isLast ? ' ' : '│';

      console.log(neonGold('  ║') + `  ${chalk.gray(connector)}── ${status} ${chalk.white(sig)}` + ' '.repeat(18) + statusText.padStart(10) + '  ' + neonGold('║'));
      console.log(neonGold('  ║') + `  ${chalk.gray(line)}      ${chalk.dim(time)}` + ' '.repeat(38) + neonGold('║'));

      if (!isLast) {
        console.log(neonGold('  ║') + `  ${chalk.gray('│')}` + ' '.repeat(55) + neonGold('║'));
      }
    });

    console.log(neonGold('  ║') + chalk.black('                                                          ') + neonGold('║'));
  }

  console.log(neonGold('  ╚══════════════════════════════════════════════════════════╝'));
  console.log();
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

// ═══════════════════════════════════════════════════════════════
// WALLET LIST - Premium Card Style
// ═══════════════════════════════════════════════════════════════

export function printWalletList(
  wallets: { name: string; address: string; network: string }[],
  activeWallet?: string
): void {
  console.log();

  console.log(ice('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));

  const title = '◈  Y O U R   W A L L E T S  ◈';
  console.log(ice('  ║') + centerText(chalk.bold.white(title), 58) + ice('║'));

  console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));
  console.log(ice('  ╠══════════════════════════════════════════════════════════╣'));

  if (wallets.length === 0) {
    console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));
    console.log(ice('  ║') + centerText(chalk.gray('No wallets found. Use /new to create one.'), 58) + ice('║'));
    console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));
  } else {
    console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));

    wallets.forEach((w, i) => {
      const isActive = w.name === activeWallet;
      const indicator = isActive ? chalk.green('▶') : chalk.gray('○');
      const name = isActive ? chalk.bold.white(w.name) : chalk.white(w.name);
      const addr = shortenAddress(w.address);
      const network = chalk.dim(`[${w.network}]`);

      const line = `  ${indicator} ${name.padEnd(15)} ${chalk.gray(addr)} ${network}`;
      console.log(ice('  ║') + line + ' '.repeat(Math.max(0, 56 - stripAnsi(line).length)) + ice('║'));
    });

    console.log(ice('  ║') + chalk.black('                                                          ') + ice('║'));
  }

  console.log(ice('  ╚══════════════════════════════════════════════════════════╝'));
  console.log();
}

// Strip ANSI codes for length calculation
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════

export function printSuccess(message: string, details?: string): void {
  console.log(chalk.green('  ✓ ') + chalk.bold.white(message));
  if (details) {
    console.log(chalk.gray('    ' + details));
  }
}

export function printError(message: string, details?: string): void {
  console.log(chalk.red('  ✗ ') + chalk.bold.white(message));
  if (details) {
    console.log(chalk.gray('    ' + details));
  }
}

export function printWarning(message: string): void {
  console.log(chalk.yellow('  ⚠ ') + chalk.white(message));
}

export function printInfo(message: string): void {
  console.log(chalk.cyan('  ℹ ') + chalk.white(message));
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

function centerText(text: string, width: number): string {
  const visibleLength = stripAnsi(text).length;
  const totalPadding = width - visibleLength;
  const leftPad = Math.floor(totalPadding / 2);
  const rightPad = totalPadding - leftPad;
  return ' '.repeat(Math.max(0, leftPad)) + text + ' '.repeat(Math.max(0, rightPad));
}

export function box(content: string, title?: string): string {
  const lines = content.split('\n');
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length), (title?.length || 0) + 4);
  const width = maxLen + 4;

  let result = '';
  result += chalk.cyan('╭' + '─'.repeat(width) + '╮\n');

  if (title) {
    const titlePad = Math.floor((width - title.length - 2) / 2);
    result += chalk.cyan('│') + ' '.repeat(titlePad) + chalk.bold(title) + ' '.repeat(width - titlePad - title.length) + chalk.cyan('│\n');
    result += chalk.cyan('├' + '─'.repeat(width) + '┤\n');
  }

  lines.forEach(line => {
    const pad = width - stripAnsi(line).length;
    result += chalk.cyan('│') + ' ' + line + ' '.repeat(Math.max(0, pad - 1)) + chalk.cyan('│\n');
  });

  result += chalk.cyan('╰' + '─'.repeat(width) + '╯');
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
  console.log(chalk.gray('  ' + '─'.repeat(58)));
}

// ═══════════════════════════════════════════════════════════════
// LEGACY EXPORTS (compatibility)
// ═══════════════════════════════════════════════════════════════

export function printWelcome(walletName?: string, address?: string): void {
  printLogo();
  if (walletName && address) {
    console.log(chalk.cyan('  ◆ Active: ') + chalk.white(walletName) + chalk.gray(' │ ') + chalk.dim(shortenAddress(address)));
  } else {
    console.log(chalk.yellow('  ◆ No wallet active. Use /new to create one.'));
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
  console.log();
  console.log(sunset('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(sunset('  ║') + centerText(chalk.bold.yellow('⚠  CONFIRM TRANSACTION  ⚠'), 58) + sunset('║'));
  console.log(sunset('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(sunset('  ║') + chalk.black('                                                          ') + sunset('║'));
  console.log(sunset('  ║') + `  ${chalk.gray('Action:')}   ${chalk.white(action)}` + ' '.repeat(42 - action.length) + sunset('║'));
  console.log(sunset('  ║') + `  ${chalk.gray('Amount:')}   ${chalk.green(amount)} ${chalk.cyan(token)}` + ' '.repeat(36 - amount.length - token.length) + sunset('║'));
  console.log(sunset('  ║') + `  ${chalk.gray('To:')}       ${chalk.yellow(recipient)}` + ' '.repeat(Math.max(0, 42 - recipient.length)) + sunset('║'));
  console.log(sunset('  ║') + `  ${chalk.gray('Fee:')}      ${chalk.dim(fee + ' SOL')}` + ' '.repeat(38 - fee.length) + sunset('║'));
  console.log(sunset('  ║') + chalk.black('                                                          ') + sunset('║'));
  console.log(sunset('  ╚══════════════════════════════════════════════════════════╝'));
  console.log();
}

export function printHelp(): void {
  console.log();
  console.log(holographic('  ╔══════════════════════════════════════════════════════════╗'));
  console.log(holographic('  ║') + centerText(chalk.bold.white('◈  T E T S U O   H E L P  ◈'), 58) + holographic('║'));
  console.log(holographic('  ╠══════════════════════════════════════════════════════════╣'));
  console.log(holographic('  ║') + chalk.black('                                                          ') + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/new')}        ${chalk.gray('Create a new wallet')}` + ' '.repeat(24) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/import')}     ${chalk.gray('Import from recovery phrase')}` + ' '.repeat(16) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/list')}       ${chalk.gray('List all wallets')}` + ' '.repeat(27) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/use')}        ${chalk.gray('Switch active wallet')}` + ' '.repeat(23) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/balance')}    ${chalk.gray('Show wallet balance')}` + ' '.repeat(24) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/send')}       ${chalk.gray('Send TETSUO tokens')}` + ' '.repeat(25) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/receive')}    ${chalk.gray('Show address for receiving')}` + ' '.repeat(17) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/history')}    ${chalk.gray('Show recent transactions')}` + ' '.repeat(19) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/clear')}      ${chalk.gray('Clear the screen')}` + ' '.repeat(27) + holographic('║'));
  console.log(holographic('  ║') + `  ${chalk.cyan('/exit')}       ${chalk.gray('Exit the wallet')}` + ' '.repeat(28) + holographic('║'));
  console.log(holographic('  ║') + chalk.black('                                                          ') + holographic('║'));
  console.log(holographic('  ╚══════════════════════════════════════════════════════════╝'));
  console.log();
}
