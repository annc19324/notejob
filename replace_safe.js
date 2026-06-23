const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'client', 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Handle single quotes
  if (content.includes("'http://localhost:5000")) {
    content = content.replace(/'http:\/\/localhost:5000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '");
    changed = true;
  }
  // Handle double quotes
  if (content.includes('"http://localhost:5000')) {
    content = content.replace(/"http:\/\/localhost:5000/g, '(import.meta.env.VITE_API_URL || "http://localhost:5000") + "');
    changed = true;
  }
  // Handle backticks
  if (content.includes('`http://localhost:5000')) {
    content = content.replace(/`http:\/\/localhost:5000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + `");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Safely replaced in ${filePath}`);
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
console.log('Done safe replacing.');
