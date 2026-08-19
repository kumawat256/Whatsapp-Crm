#!/usr/bin/env node
// One-command bootstrap for a fresh clone: creates .env files (with freshly
// generated secrets, not the insecure placeholders from .env.example),
// installs every workspace's dependencies, applies Prisma migrations
// (creating the database itself if it doesn't exist yet), and seeds
// roles/permissions + the initial Super Admin login. Safe to re-run — env
// files already present are left untouched, and the seed step is
// idempotent.
//
// Usage:  pnpm setup   (or: node scripts/setup.js)
//
// Only depends on Node builtins so it can run before `pnpm install` has
// ever happened on this machine.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'apps', 'api');

function log(msg) {
  console.log(msg);
}

function run(cmd, cwd) {
  log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: cwd || ROOT });
}

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Fills in real random secrets in place of .env.example's "change-me-*"
// placeholders — those placeholders must never end up running for real.
function withGeneratedSecrets(content) {
  return content
    .replace(/^JWT_ACCESS_SECRET=.*$/m, `JWT_ACCESS_SECRET=${randomHex(32)}`)
    .replace(/^JWT_REFRESH_SECRET=.*$/m, `JWT_REFRESH_SECRET=${randomHex(32)}`)
    .replace(/^SESSION_ENCRYPTION_KEY=.*$/m, `SESSION_ENCRYPTION_KEY=${randomHex(32)}`);
}

function ensureEnvFile(exampleAbsPath, targetAbsPath) {
  const rel = path.relative(ROOT, targetAbsPath);
  if (fs.existsSync(targetAbsPath)) {
    log(`✓ ${rel} already exists — leaving it as-is`);
    return;
  }
  const content = withGeneratedSecrets(fs.readFileSync(exampleAbsPath, 'utf8'));
  fs.writeFileSync(targetAbsPath, content);
  log(`✓ created ${rel} (with freshly generated secrets)`);
}

log('== WhatsApp CRM setup ==');

log('\n-- Environment files --');
ensureEnvFile(path.join(ROOT, '.env.example'), path.join(ROOT, '.env'));
ensureEnvFile(path.join(API_DIR, '.env.example'), path.join(API_DIR, '.env'));
log(
  '\nIf your MySQL is not the XAMPP default (passwordless root on localhost:3306),\n' +
    'edit DATABASE_URL in .env and apps/api/.env before continuing.',
);

log('\n-- Installing dependencies (this also generates the Prisma client) --');
run('pnpm install');

log('\n-- Applying database migrations (creates the database if it does not exist yet) --');
run('pnpm prisma:deploy', API_DIR);

log('\n-- Seeding roles, permissions, and the initial Super Admin login --');
run('pnpm db:seed', API_DIR);

log('\n✅ Setup complete.\n');
log('Start the dev servers in two separate terminals:');
log('  pnpm dev:api   # http://localhost:3000  (health check: /health)');
log('  pnpm dev:web   # http://localhost:5174');
