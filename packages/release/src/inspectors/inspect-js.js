#!/usr/bin/env node
// Inspector: checks JavaScript/TypeScript files for syntax errors using `node --check`.
// Uses git to obtain list of changed files in the current HEAD.
const { execSync } = require('child_process');

function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only --diff-filter=ACM HEAD', { encoding: 'utf8' });
    return output.split(/\n/).filter(f => f.match(/\.(js|ts)$/));
  } catch (e) {
    console.error('Failed to obtain changed files:', e.message);
    process.exit(1);
  }
}

function checkFile(file) {
  console.log(`🔎 Checking ${file}`);
  try {
    execSync(`node --check ${file}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ Syntax error in ${file}`);
    process.exit(1);
  }
}

const files = getChangedFiles();
if (files.length === 0) {
  console.log('✅ No JavaScript/TypeScript files changed.');
  process.exit(0);
}
files.forEach(checkFile);
process.exit(0);
