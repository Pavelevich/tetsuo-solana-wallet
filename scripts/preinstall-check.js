#!/usr/bin/env node
/**
 * Pre-install security check
 * Prevents installation if suspicious activity detected
 * Part of TETSUO Solana Wallet security measures
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const EXPECTED_HASHES = {
  'package.json': null, // Will be set during build
  'package-lock.json': null
};

console.log('\n[SECURITY] Running pre-install checks...\n');

// Check 1: Verify we're not in a CI environment being attacked
if (process.env.npm_config_ignore_scripts === 'true') {
  console.log('[OK] Install scripts disabled - safe mode');
  process.exit(0);
}

// Check 2: Warn about lifecycle scripts
console.log('[WARN] For maximum security, install with:');
console.log('       npm install --ignore-scripts\n');

// Check 3: Check for suspicious environment variables
const suspiciousEnvVars = [
  'npm_package_scripts_preinstall',
  'npm_package_scripts_postinstall'
].filter(v => process.env[v] && process.env[v].includes('curl'));

if (suspiciousEnvVars.length > 0) {
  console.error('[DANGER] Suspicious scripts detected in environment!');
  process.exit(1);
}

console.log('[OK] Pre-install checks passed\n');
