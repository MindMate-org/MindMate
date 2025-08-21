#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove console.log, console.warn, console.error (but keep console.trace for debugging)
  const patterns = [
    /console\.log\s*\([^)]*\);\s*\n?/g,
    /console\.warn\s*\([^)]*\);\s*\n?/g,
    /console\.error\s*\([^)]*\);\s*\n?/g,
    // Remove console.log without semicolon
    /^\s*console\.log\s*\([^)]*\)\s*$/gm,
    /^\s*console\.warn\s*\([^)]*\)\s*$/gm,
    /^\s*console\.error\s*\([^)]*\)\s*$/gm,
  ];

  patterns.forEach((pattern) => {
    const originalContent = content;
    content = content.replace(pattern, '');
    if (originalContent !== content) {
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  }

  return false;
}

// Get all TypeScript files in src directory using find
function getAllTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

const files = getAllTsFiles(path.join(__dirname, 'src'));

let totalCleaned = 0;

files.forEach((file) => {
  if (removeConsoleLogs(file)) {
    totalCleaned++;
  }
});

console.log(`\n🎉 완료! ${totalCleaned}개 파일에서 console.log를 제거했습니다.`);
