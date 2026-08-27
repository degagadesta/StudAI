#!/usr/bin/env node

/**
 * Batch Migration Script for Theme System
 * Migrates all pages to use semantic theme utilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mapping from hardcoded to theme utilities
const COLOR_REPLACEMENTS = [
  // Backgrounds
  { from: /bg-\[#F6F1E3\]/g, to: 'bg-page' },
  { from: /bg-\[#FFFDF7\]/g, to: 'bg-surface' },
  { from: /bg-white(?!\w)/g, to: 'bg-surface' },
  { from: /bg-\[#F9F6EE\]/g, to: 'bg-surface-hover' },
  { from: /bg-\[#EFE8D4\]/g, to: 'bg-elevated' },
  { from: /bg-\[#F4EFDD\]/g, to: 'bg-surface-hover' },
  { from: /bg-\[#EAF3DE\]/g, to: 'bg-accent-light' },
  { from: /bg-\[#DCEAC9\]/g, to: 'bg-elevated' },
  
  // Primary/Accent backgrounds
  { from: /bg-\[#253D31\]/g, to: 'bg-accent' },
  { from: /bg-\[#2F4A3D\]/g, to: 'bg-accent' },
  { from: /bg-\[#1E3228\]/g, to: 'bg-accent' },
  { from: /bg-\[#1a2b21\]/g, to: 'bg-accent' },
  { from: /bg-\[#2C4739\]/g, to: 'bg-accent' },
  { from: /bg-\[#33513F\]/g, to: 'bg-accent' },
  { from: /bg-\[#3B5C47\]/g, to: 'bg-accent' },
  { from: /hover:bg-\[#2F4A3D\]/g, to: 'hover-accent' },
  { from: /hover:bg-\[#1a2b21\]/g, to: 'hover-accent' },
  { from: /hover:bg-\[#1E3228\]/g, to: 'hover-accent' },
  { from: /hover:bg-\[#DCEAC9\]/g, to: 'hover:bg-elevated' },
  { from: /hover:bg-\[#F4EFDD\]/g, to: 'hover-surface' },
  { from: /hover:bg-\[#F9F6EE\]/g, to: 'hover-surface' },
  { from: /hover:bg-\[#F6F1E3\]/g, to: 'hover:bg-page' },
  
  // Accent colors  
  { from: /bg-\[#8CA37E\]/g, to: 'bg-accent-secondary' },
  { from: /bg-\[#C7D3B9\]/g, to: 'bg-accent-light' },
  { from: /bg-\[#B08D4F\]/g, to: 'bg-accent-secondary' },
  
  // Text colors
  { from: /text-\[#253D31\]/g, to: 'text-primary' },
  { from: /text-\[#5B6156\]/g, to: 'text-secondary' },
  { from: /text-\[#A9A18A\]/g, to: 'text-muted' },
  { from: /text-\[#F6F1E3\]/g, to: 'text-inverse' },
  { from: /text-\[#2F4A3D\]/g, to: 'text-accent' },
  { from: /text-\[#8CA37E\]/g, to: 'text-accent' },
  { from: /text-\[#C7D3B9\]/g, to: 'text-accent-light' },
  { from: /text-white(?!\w)/g, to: 'text-inverse' },
  { from: /text-gray-600/g, to: 'text-secondary' },
  { from: /text-gray-700/g, to: 'text-primary' },
  { from: /text-gray-500/g, to: 'text-muted' },
  { from: /text-gray-400/g, to: 'text-muted' },
  { from: /hover:text-\[#253D31\]/g, to: 'hover:text-primary' },
  { from: /hover:text-\[#5B6156\]/g, to: 'hover:text-secondary' },
  { from: /hover:text-\[#2F4A3D\]/g, to: 'hover:text-accent' },
  
  // Error colors
  { from: /text-\[#8B3A3A\]/g, to: 'text-error' },
  { from: /text-\[#C97B7B\]/g, to: 'text-error' },
  { from: /bg-\[#F7E8E8\]/g, to: 'bg-error' },
  { from: /text-red-500/g, to: 'text-error' },
  { from: /text-red-600/g, to: 'text-error' },
  { from: /bg-red-50/g, to: 'bg-error' },
  
  // Success colors
  { from: /text-green-500/g, to: 'text-success' },
  { from: /text-green-600/g, to: 'text-success' },
  
  // Borders
  { from: /border-\[#DCD2B4\]/g, to: 'border-default' },
  { from: /border-\[#B7AE8E\]/g, to: 'border-hover' },
  { from: /border-\[#8CA37E\]/g, to: 'border-accent' },
  { from: /border-\[#E3B8B8\]/g, to: 'border-error' },
  { from: /border-\[#C97B7B\]/g, to: 'border-error' },
  { from: /border-gray-300/g, to: 'border-default' },
  { from: /border-gray-200/g, to: 'border-default' },
  { from: /hover:border-\[#8CA37E\]/g, to: 'hover-border' },
  { from: /hover:border-\[#B7AE8E\]/g, to: 'hover-border' },
  { from: /focus:border-\[#8CA37E\]/g, to: 'focus:border-accent' },
  { from: /focus:border-\[#C97B7B\]/g, to: 'focus:border-error' },
  
  // Focus rings
  { from: /focus:ring-\[#8CA37E\]/g, to: 'focus:ring-accent' },
  { from: /focus:ring-\[#8CA37E\]\/20/g, to: 'focus:ring-accent' },
  { from: /focus:ring-\[#8CA37E\]\/15/g, to: 'focus:ring-accent' },
  { from: /focus:ring-\[#C97B7B\]/g, to: 'focus:ring-error' },
  { from: /focus:ring-\[#C97B7B\]\/15/g, to: 'focus:ring-error' },
  { from: /focus:ring-\[#8B4513\]/g, to: 'focus:ring-accent' },
  
  // Complex patterns with opacity
  { from: /bg-\[#F6F1E3\]\/(\d+)/g, to: 'bg-page/$1' },
  { from: /text-\[#F6F1E3\]\/(\d+)/g, to: 'text-inverse/$1' },
  { from: /border-\[#F6F1E3\]\/(\d+)/g, to: 'border-inverse/$1' },
  { from: /hover:bg-\[#F6F1E3\]\/(\d+)/g, to: 'hover:bg-page/$1' },
  
  // Placeholder colors
  { from: /placeholder:text-\[#A9A18A\]/g, to: 'placeholder-muted' },
  { from: /placeholder:text-gray-400/g, to: 'placeholder-muted' },
  
  // Disabled states
  { from: /disabled:bg-gray-400/g, to: 'disabled:bg-muted' },
  { from: /disabled:bg-gray-300/g, to: 'disabled:bg-muted' },
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    COLOR_REPLACEMENTS.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Migrated: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function migrateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      count += migrateDirectory(filePath);
    } else if (file.match(/\.(tsx|jsx)$/)) {
      if (migrateFile(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Run migration
console.log('🎨 Starting theme migration...\n');

const pagesDir = path.join(__dirname, '..', 'src', 'pages');
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const layoutsDir = path.join(__dirname, '..', 'src', 'layouts');

console.log('📄 Migrating pages...');
const pagesCount = migrateDirectory(pagesDir);

console.log('\n🧩 Migrating components...');
const componentsCount = migrateDirectory(componentsDir);

console.log('\n📐 Migrating layouts...');
const layoutsCount = migrateDirectory(layoutsDir);

console.log(`\n✨ Migration complete!`);
console.log(`📊 Files migrated: ${pagesCount + componentsCount + layoutsCount}`);
console.log(`   - Pages: ${pagesCount}`);
console.log(`   - Components: ${componentsCount}`);
console.log(`   - Layouts: ${layoutsCount}`);
