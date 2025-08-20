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

// Function to fix Prisma imports in a file
function fixPrismaImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if this is an API file that needs fixing
    if (filePath.includes('/pages/api/') && content.includes('new PrismaClient()')) {
      console.log(`Fixing: ${filePath}`);
      
      // Calculate relative path to lib/prisma.ts
      const relativePath = path.relative(path.dirname(filePath), 'lib/prisma.ts');
      const importPath = (relativePath.startsWith('.') ? relativePath : `./${relativePath}`).replace('.ts', '');
      
      // Replace PrismaClient import and instantiation
      content = content.replace(
        /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?\s*\n?/g,
        ''
      );
      
      content = content.replace(
        /const\s+prisma\s*=\s*new\s+PrismaClient\(\);/g,
        `import { prisma } from '${importPath}';`
      );
      
      content = content.replace(
        /let\s+prisma\s*=\s*new\s+PrismaClient\(\);/g,
        `import { prisma } from '${importPath}';`
      );
      
      // Handle globalForPrisma patterns
      content = content.replace(
        /const\s+globalForPrisma\s*=\s*globalThis\s*as\s*unknown\s*as\s*\{\s*prisma:\s*PrismaClient\s*\|\s*undefined;\s*\};?\s*\n?/g,
        ''
      );
      
      content = content.replace(
        /const\s+prisma\s*=\s*globalForPrisma\.prisma\s*\?\?\s*new\s+PrismaClient\(\);/g,
        `import { prisma } from '${importPath}';`
      );
      
      content = content.replace(
        /if\s*\(\s*process\.env\.NODE_ENV\s*!==\s*['"]production['"]\s*\)\s*globalForPrisma\.prisma\s*=\s*prisma;/g,
        ''
      );
      
      // Add the import at the top if it doesn't exist
      if (!content.includes(`import { prisma } from`)) {
        const lines = content.split('\n');
        let importIndex = 0;
        
        // Find the first import statement
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            importIndex = i + 1;
          }
        }
        
        // Insert the prisma import
        lines.splice(importIndex, 0, `import { prisma } from '${importPath}';`);
        content = lines.join('\n');
      }
      
      modified = true;
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
console.log('🔧 Fixing Prisma imports across API files...');

const apiDir = path.join(__dirname, '../pages/api');
const tsFiles = findTsFiles(apiDir);

console.log(`Found ${tsFiles.length} TypeScript files to check`);

tsFiles.forEach(fixPrismaImports);

console.log('✅ Prisma import fixes completed!');
