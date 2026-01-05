# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Features

### Cryptographic Standards

- **Key Generation**: Ed25519 (Solana native)
- **Key Derivation**: BIP39 mnemonic → PBKDF2 → Ed25519
- **Encryption**: AES-256-GCM with 100,000 PBKDF2 iterations
- **Signing**: EdDSA (Ed25519)

### Zero Trust Architecture

1. **Keys Never Leave Device**
   - Private keys are only decrypted in memory
   - Keys are never transmitted over network
   - Keys are never logged or printed

2. **Encrypted Storage**
   - Wallets encrypted before disk write
   - Uses OS-level file permissions (0600)
   - Stored in user's home directory only

3. **No Third-Party Key Access**
   - Grok AI never receives private keys or mnemonics
   - Only public addresses shared with RPC
   - Transaction signing happens client-side

### Supply Chain Security

Built with lessons from the [September 2025 npm attack](https://blog.checkpoint.com/crypto/the-great-npm-heist-september-2025/):

1. **Minimal Dependencies**
   - Only essential packages included
   - Each dependency manually audited
   - No unnecessary transitive dependencies

2. **Pinned Versions**
   - All versions locked in package.json
   - package-lock.json committed to repo
   - No floating version ranges (^, ~)

3. **Install Safeguards**
   - Pre-install security checks
   - Recommended: `npm install --ignore-scripts`
   - Suspicious activity detection

4. **Dependency Overrides**
   - Known vulnerable packages overridden
   - Regular security audits required

## Installation Recommendations

```bash
# ALWAYS install with scripts disabled
npm install --ignore-scripts

# After install, audit dependencies
npm audit

# Verify no critical vulnerabilities
npm audit --audit-level=critical
```

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: security@tetsuo.io
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

We will respond within 48 hours and work with you to address the issue.

## Security Checklist for Users

- [ ] Install with `--ignore-scripts`
- [ ] Run `npm audit` after installation
- [ ] Never share your mnemonic phrase
- [ ] Verify recipient addresses before sending
- [ ] Use strong, unique passwords for encryption
- [ ] Keep your recovery phrase offline
- [ ] Update to latest version regularly

## Known Limitations

1. **Memory Security**: Keys exist in memory during operations
2. **Screen Capture**: Terminal output may be captured
3. **Clipboard**: Copy operations may expose addresses
4. **Environment Variables**: API keys in env can be logged

## Third-Party Dependencies

| Package | Version | Purpose | Audit Status |
|---------|---------|---------|--------------|
| @solana/web3.js | 1.95.4 | Solana RPC | ✅ Audited |
| @solana/spl-token | 0.4.9 | SPL tokens | ✅ Audited |
| tweetnacl | 1.0.3 | Ed25519 | ✅ Audited |
| bip39 | 3.1.0 | Mnemonic | ✅ Audited |

## Audit History

| Date | Auditor | Scope | Result |
|------|---------|-------|--------|
| TBD | - | Full audit | Pending |

---

**Security is our top priority. Report issues responsibly.**
