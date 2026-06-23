const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'client', 'src');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("import.meta.env.VITE_API_URL")) {
    const newContent = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}/g, "http://localhost:5000");
    fs.writeFileSync(filePath, newContent);
    console.log(`Reverted in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(directory);
console.log('Done reverting.');
