const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files in a directory
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix import paths in a file
function fixImportPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if this file has prisma imports that need fixing
    if (content.includes('import { prisma } from') && content.includes('lib/prisma')) {
      console.log(`Fixing imports in: ${filePath}`);
      
      // Calculate the correct relative path to lib/prisma
      const relativePath = path.relative(path.dirname(filePath), 'lib/prisma');
      const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
      
      // Replace all prisma import statements
      const importRegex = /import\s*\{\s*prisma\s*\}\s*from\s*['"][^'"]*lib\/prisma[^'"]*['"];?/g;
      const newImport = `import { prisma } from '${importPath}';`;
      
      if (content.match(importRegex)) {
        content = content.replace(importRegex, newImport);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Fixing import paths across API files...');

const apiDir = path.join(__dirname, '../pages/api');
const tsFiles = findTsFiles(apiDir);

console.log(`Found ${tsFiles.length} TypeScript files to check`);

tsFiles.forEach(fixImportPaths);

console.log('✅ Import path fixes completed!');
