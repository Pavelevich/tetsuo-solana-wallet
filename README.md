<p align="center">
  <pre>
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝
  </pre>
</p>

<h1 align="center">TETSUO Solana Wallet</h1>

<p align="center">
  <strong>Premium CLI wallet for TETSUO on Solana blockchain</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#commands">Commands</a> •
  <a href="#live-trading">Live Trading</a> •
  <a href="#security">Security</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Mainnet-9945FF?style=flat-square&logo=solana" alt="Solana Mainnet">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/Security-100%25_Local-green?style=flat-square" alt="100% Local">
</p>

---

## Overview

TETSUO Solana Wallet is a professional-grade command-line interface wallet designed specifically for the TETSUO token on Solana. Built with security-first principles, it features a Claude Code-inspired slash command interface, real-time market data, and beautiful terminal UI.

**No external APIs for wallet operations. No tracking. No telemetry. Your keys never leave your device.**

---

## Features

| Feature | Description |
|---------|-------------|
| **Slash Commands** | Claude Code-style interface (`/balance`, `/send`, `/market`) |
| **Live Market Data** | Real-time TETSUO price, volume, and trading stats from DexScreener |
| **Watch Mode** | Auto-refreshing balance display with animated updates |
| **Buy Pressure Indicator** | Visual buy/sell ratio bars for trading decisions |
| **QR Code Generation** | Scannable QR codes for receiving tokens |
| **AES-256-GCM Encryption** | Military-grade encryption for private keys |
| **HD Wallet Support** | BIP39 mnemonic phrases for wallet recovery |
| **Beautiful UI** | Premium ASCII art cards and holographic gradients |

---

## Installation

### Requirements

- Node.js 18.0.0 or higher
- npm or yarn

### Quick Install

```bash
# Clone the repository
git clone https://github.com/Pavelevich/tetsuo-solana-wallet.git
cd tetsuo-solana-wallet

# Install dependencies (with security flag)
npm install --ignore-scripts

# Build the project
npm run build

# Link globally
npm link

# Run the wallet
tetsuo
```

### NPM Global Install

```bash
npm install -g tetsuo-solana-wallet
```

---

## Commands

Start interactive mode by running `tetsuo` and use slash commands:

### Wallet Management

| Command | Aliases | Description |
|---------|---------|-------------|
| `/new` | `/create` | Create a new wallet |
| `/import` | `/restore` | Import from recovery phrase |
| `/list` | `/wallets`, `/ls` | List all wallets |
| `/use <name>` | `/switch` | Switch active wallet |
| `/delete <name>` | `/remove` | Delete a wallet |
| `/export` | `/backup` | Export recovery phrase |

### Balance & Transactions

| Command | Aliases | Description |
|---------|---------|-------------|
| `/balance` | `/bal`, `/b` | Show wallet balance |
| `/send` | `/transfer`, `/tx` | Send TETSUO tokens |
| `/receive` | `/qr`, `/address` | Show address with QR code |
| `/history` | `/txs`, `/h` | Transaction history |

### Live Data

| Command | Aliases | Description |
|---------|---------|-------------|
| `/watch [sec]` | `/live`, `/monitor` | Live balance updates |
| `/market [sec]` | `/stats`, `/price` | Real-time trading stats |

### Utility

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/clear` | Clear screen |
| `/exit` | Exit wallet |

---

## Live Trading

### `/market` - Real-Time Trading Dashboard

```
  ┌───────────────────────────────────────────────────────────┐
  │             ◈  T E T S U O   T R A D I N G  ◈             │
  └───────────────────────────────────────────────────────────┘

  PRICE
  $0.001208  (0.00000869 SOL)
  +0.19% 5M  -0.11% 1H  +2.49% 6H  +3.43% 24H

  VOLUME
  $12 5M   $41 1H   $11K 6H   $35K 24H

  MARKET
  MCap: $1.21M   FDV: $1.21M   Liq: $429.8K

  LIQUIDITY POOL
  177.7M TETSUO   1546.89 SOL

  BUY PRESSURE
  5M:  ▓▓▓▓▓▓▓▓░░░░░░░░ 50%
  1H:  ▓▓▓▓░░░░░░░░░░░░ 25%
  24H: ▓▓▓▓▓▓▓▓▓░░░░░░░ 53%

  TRANSACTIONS
  5M:  0 / 1   1H: 1 / 3   6H: 48 / 43   24H: 198 / 175

  PAIR INFO
  DEX: RAYDIUM   Age: 399 days
```

**Features:**
- 5-minute, 1-hour, 6-hour, and 24-hour timeframes
- Price changes with color coding (green/red)
- Buy pressure visual bars
- Liquidity pool breakdown
- Auto-refresh with customizable interval

### `/watch` - Live Balance Monitor

```
  ╔════════════════════════════════════════════════════════════╗
  ║              ◈  W A L L E T   B A L A N C E  ◈             ║
  ╠════════════════════════════════════════════════════════════╣
  ║                                                            ║
  ║                    1,234.56 TETSUO                         ║
  ║                    ──────────────────                      ║
  ║                      0.5000 SOL                            ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝

  ✓ 11:45:32 PM #5  │ Refresh: 2s │ Press q to exit
```

---

## Security

### Design Principles

1. **100% Local** - No external APIs for wallet operations
2. **Zero Trust** - Private keys never transmitted anywhere
3. **Encrypted Storage** - AES-256-GCM with PBKDF2 key derivation
4. **Memory Security** - Keys cleared from memory after use
5. **No Telemetry** - Zero tracking or analytics

### Encryption Details

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Key Derivation | PBKDF2 |
| Iterations | 100,000 |
| Salt | Random 16 bytes |
| IV | Random 12 bytes |

### Storage Location

```
~/.tetsuo-solana/
├── config.json      # Network settings
└── wallets.enc      # Encrypted wallets
```

### Best Practices

```bash
# Always install with scripts disabled
npm install --ignore-scripts

# Verify package integrity
npm audit

# Never share your mnemonic phrase
# Never enter your mnemonic on websites
# Always verify recipient addresses
```

---

## TETSUO Token

| Property | Value |
|----------|-------|
| **Symbol** | TETSUO |
| **Network** | Solana Mainnet |
| **Mint Address** | `8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8` |
| **Decimals** | 9 |
| **DEX** | Raydium |

---

## Architecture

```
tetsuo-solana-wallet/
├── src/
│   ├── core/
│   │   ├── crypto.ts       # Ed25519, AES-256-GCM encryption
│   │   └── wallet.ts       # Wallet CRUD operations
│   ├── solana/
│   │   └── client.ts       # Solana RPC client
│   ├── ui/
│   │   └── ascii.ts        # Premium terminal UI components
│   ├── cli.ts              # Main CLI with slash commands
│   └── suppress-warnings.ts
├── dist/                   # Compiled JavaScript
├── package.json
└── README.md
```

---

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development mode
npm run dev

# Run tests
npm test

# Audit dependencies
npm run audit:deps
```

---

## Network Configuration

| Network | RPC Endpoint |
|---------|--------------|
| Mainnet | `https://api.mainnet-beta.solana.com` |
| Devnet | `https://api.devnet.solana.com` |
| Testnet | `https://api.testnet.solana.com` |

---

## Programmatic Usage

```typescript
import { createWallet, unlockWallet, SolanaClient } from 'tetsuo-solana-wallet';

// Create a wallet
const { wallet, mnemonic } = createWallet('myWallet', 'password123', 'mainnet');
console.log('Address:', wallet.address);
console.log('Mnemonic:', mnemonic); // Save this!

// Check balance
const client = new SolanaClient('https://api.mainnet-beta.solana.com');
const balance = await client.getTetsuoBalance(wallet.address);
console.log('Balance:', balance.uiBalance, 'TETSUO');

// Send tokens
const keypair = unlockWallet('myWallet', 'password123');
const result = await client.sendTetsuo(keypair, recipientAddress, 100);
console.log('Signature:', result.signature);
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

**Pavelevich** - [GitHub](https://github.com/Pavelevich)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Disclaimer

This software is provided "as is" without warranty of any kind. Always verify transactions before signing. Never share your mnemonic phrase or private keys with anyone. The authors are not responsible for any loss of funds.

---

<p align="center">
  <strong>TETSUO Solana Wallet</strong><br>
  <em>Your keys. Your tokens. 100% secure.</em>
</p>
