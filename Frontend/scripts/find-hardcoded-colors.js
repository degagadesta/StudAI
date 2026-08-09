#!/usr/bin/env node

/**
 * Find Hardcoded Colors Script
 * 
 * Scans the codebase for hardcoded hex color values that should
 * be migrated to the theme system.
 * 
 * Usage: node scripts/find-hardcoded-colors.js
 */

const fs = require('fs');
const path = require('path');

// Common hardcoded colors in the StudAI app
const COLOR_MAPPING = {
  '#F6F1E3': 'bg-page / text-inverse',
  '#FFFDF7': 'bg-surface',
  '#F9F6EE': 'bg-surface-hover',
  '#EFE8D4': 'bg-elevated',
  '#253D31': 'bg-accent / text-primary',
  '#2F4A3D': 'bg-accent-hover / text-accent',
  '#5B6156': 'text-secondary',
  '#A9A18A': 'text-muted',
  '#DCD2B4': 'border-default',
  '#8CA37E': 'border-hover / bg-accent-light',
  '#8B3A3A': 'text-error',
  '#F7E8E8': 'bg-error',
  '#1E5652': 'teal accent (legacy)',
  'white': 'bg-surface / text-inverse',
};

// Regex patterns to find hardcoded colors
const PATTERNS = [
  /(?:bg|text|border)-\[#[0-9A-Fa-f]{6}\]/g,
  /(?:bg|text|border)-\[#[0-9A-Fa-f]{3}\]/g,
  /(?:bg|text|border)-white\b/g,
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const findings = [];

    PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(match)) {
              findings.push({
                file: filePath,
                line: index + 1,
                match,
                context: line.trim(),
              });
            }
          });
        });
      }
    });

    return findings;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDirectory(filePath, results);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      const findings = scanFile(filePath);
      results.push(...findings);
    }
  });

  return results;
}

function getSuggestion(match) {
  const hexMatch = match.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
  if (hexMatch) {
    const hex = hexMatch[1].length === 3 
      ? hexMatch[1].split('').map(x => x + x).join('') 
      : hexMatch[1];
    const upperHex = '#' + hex.toUpperCase();
    return COLOR_MAPPING[upperHex] || 'Check THEME_GUIDE.md';
  }
  if (match.includes('white')) {
    return 'bg-surface / text-inverse';
  }
  return 'Unknown';
}

console.log('🔍 Scanning for hardcoded colors...\n');

const srcPath = path.join(__dirname, '..', 'src');
const results = scanDirectory(srcPath);

if (results.length === 0) {
  console.log('✅ No hardcoded colors found! Great job! 🎉\n');
  process.exit(0);
}

console.log(`Found ${results.length} instances of hardcoded colors:\n`);

// Group by file
const byFile = results.reduce((acc, finding) => {
  if (!acc[finding.file]) {
    acc[finding.file] = [];
  }
  acc[finding.file].push(finding);
  return acc;
}, {});

// Print results grouped by file
Object.entries(byFile).forEach(([file, findings]) => {
  const relPath = path.relative(process.cwd(), file);
  console.log(`\n📄 ${relPath}`);
  console.log('─'.repeat(80));
  
  findings.forEach(({ line, match, context }) => {
    const suggestion = getSuggestion(match);
    console.log(`  Line ${line}: ${match}`);
    console.log(`    💡 Suggestion: ${suggestion}`);
    console.log(`    📝 ${context}`);
    console.log();
  });
});

console.log('\n' + '═'.repeat(80));
console.log(`\n📊 Summary: ${results.length} hardcoded colors across ${Object.keys(byFile).length} files\n`);
console.log('📚 Migration Guide: See COLOR_MIGRATION.md');
console.log('📖 Theme Documentation: See THEME_GUIDE.md');
console.log('🎨 Visual Preview: Run the app and visit /theme-preview\n');
