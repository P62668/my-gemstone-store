// Simple test to verify responsive design implementation
const fs = require('fs');
const path = require('path');

// Check if key responsive classes are used in components
const componentsDir = path.join(__dirname, '../components');
const pagesDir = path.join(__dirname, '../pages');

// Responsive breakpoints to check for
const responsiveClasses = [
  'sm:', 'md:', 'lg:', 'xl:', '2xl:',
  'max-sm:', 'max-md:', 'max-lg:', 'max-xl:'
];

// Function to check if a file contains responsive classes
function checkFileForResponsiveClasses(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundClasses = responsiveClasses.filter(cls => content.includes(cls));
    return foundClasses.length > 0 ? foundClasses : [];
  } catch (error) {
    return [];
  }
}

// Function to recursively find all .tsx files
function findTSXFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findTSXFiles(file));
    } else if (path.extname(file) === '.tsx') {
      results.push(file);
    }
  });
  
  return results;
}

// Check all components and pages
const componentFiles = findTSXFiles(componentsDir);
const pageFiles = findTSXFiles(pagesDir);

console.log('🔍 Checking responsive design implementation...\n');

let responsiveFiles = 0;
let totalFiles = 0;

// Check components
console.log('📁 Checking components...');
componentFiles.forEach(file => {
  totalFiles++;
  const responsiveInFile = checkFileForResponsiveClasses(file);
  if (responsiveInFile.length > 0) {
    responsiveFiles++;
    console.log(`  ✅ ${path.basename(file)} - Uses: ${responsiveInFile.join(', ')}`);
  }
});

// Check pages
console.log('\n📄 Checking pages...');
pageFiles.forEach(file => {
  totalFiles++;
  const responsiveInFile = checkFileForResponsiveClasses(file);
  if (responsiveInFile.length > 0) {
    responsiveFiles++;
    console.log(`  ✅ ${path.basename(file)} - Uses: ${responsiveInFile.join(', ')}`);
  }
});

console.log(`\n📊 Responsive Design Report:`);
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Files with responsive classes: ${responsiveFiles}`);
console.log(`   Responsive design coverage: ${((responsiveFiles/totalFiles)*100).toFixed(1)}%`);

if (responsiveFiles > 0) {
  console.log('\n✅ Responsive design is implemented in the project!');
} else {
  console.log('\n❌ No responsive classes found. Please add responsive design.');
}