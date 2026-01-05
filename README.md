# TETSUO Solana Wallet

A secure, AI-powered command-line wallet for TETSUO tokens on Solana.

```
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝
```

## Features

- **Secure Key Management** - Ed25519 keys with AES-256-GCM encryption
- **Grok AI Assistant** - Natural language commands via xAI's Grok API
- **Beautiful CLI** - ASCII art interface inspired by Claude Code
- **Solana Native** - Full SPL token support
- **Zero Trust** - Keys never leave your device

## Installation

```bash
# Install globally
npm install -g tetsuo-solana-wallet

# Or clone and build
git clone https://github.com/Pavelevich/tetsuo-solana-wallet.git
cd tetsuo-solana-wallet
npm install --ignore-scripts  # Security: disable lifecycle scripts
npm run build
npm link
```

## Quick Start

```bash
# Create a new wallet
tetsuo new

# Check balance
tetsuo balance

# Send tokens
tetsuo send

# Interactive mode with Grok AI
tetsuo
```

## Commands

| Command | Description |
|---------|-------------|
| `tetsuo new` | Create a new wallet |
| `tetsuo import` | Import wallet from mnemonic |
| `tetsuo list` | List all wallets |
| `tetsuo use <name>` | Switch active wallet |
| `tetsuo balance` | Show wallet balance |
| `tetsuo send` | Send TETSUO tokens |
| `tetsuo receive` | Show address/QR code |
| `tetsuo history` | Show transaction history |
| `tetsuo` | Interactive mode with Grok AI |

## Grok AI Integration

Enable natural language commands with xAI's Grok:

```bash
# Set your API key
export TETSUO_GROK_API_KEY=your-api-key

# Start interactive mode
tetsuo

> send 100 TETSUO to 7xKXtg2...
🤖 Grok: Building transaction to send 100 TETSUO...

> what's my balance?
🤖 Grok: Fetching your wallet balance...
```

Without an API key, the wallet works in offline mode with basic command parsing.

## Security

### Post-2025 NPM Attack Measures

This wallet was designed after the [September 2025 npm supply chain attack](https://blog.checkpoint.com/crypto/the-great-npm-heist-september-2025/) that targeted crypto wallets:

1. **Minimal Dependencies** - Only essential, audited packages
2. **Pinned Versions** - All dependencies locked to specific versions
3. **No Lifecycle Scripts** - Install with `--ignore-scripts`
4. **Pre-install Checks** - Security validation before install
5. **Keys in Memory Only** - Encrypted before any disk write
6. **No Key Transmission** - Private keys NEVER sent to any API

### Best Practices

```bash
# Always install with scripts disabled
npm install --ignore-scripts

# Verify package integrity
npm audit

# Check for known vulnerabilities
npx npm-security-scanner
```

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: `~/.tetsuo-solana/wallets.enc`

## Configuration

Wallet configuration is stored at `~/.tetsuo-solana/config.json`:

```json
{
  "activeWallet": "main",
  "network": "mainnet",
  "rpcEndpoint": "https://api.mainnet-beta.solana.com"
}
```

### Networks

| Network | RPC Endpoint |
|---------|--------------|
| mainnet | `https://api.mainnet-beta.solana.com` |
| devnet | `https://api.devnet.solana.com` |
| testnet | `https://api.testnet.solana.com` |

## Architecture

```
tetsuo-solana-wallet/
├── src/
│   ├── core/           # Cryptography & wallet management
│   │   ├── crypto.ts   # Ed25519, AES-256-GCM
│   │   └── wallet.ts   # Wallet CRUD operations
│   ├── solana/         # Solana RPC client
│   │   └── client.ts   # Balance, transfers, history
│   ├── grok/           # xAI Grok integration
│   │   └── client.ts   # AI command parsing
│   ├── ui/             # Terminal UI
│   │   └── ascii.ts    # ASCII art components
│   ├── cli.ts          # CLI entry point
│   └── index.ts        # Library exports
├── scripts/
│   └── preinstall-check.js
└── package.json
```

## Programmatic Usage

```typescript
import {
  createWallet,
  unlockWallet,
  SolanaClient
} from 'tetsuo-solana-wallet';

// Create a wallet
const { wallet, mnemonic } = createWallet('myWallet', 'password123', 'mainnet');
console.log('Address:', wallet.address);
console.log('Mnemonic:', mnemonic);

// Check balance
const client = new SolanaClient('https://api.mainnet-beta.solana.com');
const balance = await client.getTetsuoBalance(wallet.address);
console.log('Balance:', balance.uiBalance, 'TETSUO');
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Audit dependencies
npm run audit:deps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This software is provided "as is" without warranty. Always verify transactions before signing. Never share your mnemonic phrase with anyone.

---

**TETSUO Solana Wallet** - Your keys, your tokens.
