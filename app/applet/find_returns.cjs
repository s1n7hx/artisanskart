const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src').concat(['./index.html']);
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/returns?\b/i.test(line)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('return ') && !trimmed.startsWith('return;') && !trimmed.startsWith('return(') && !trimmed.startsWith('return{') && !trimmed.startsWith('// return') && !trimmed.startsWith('* return') && !trimmed.startsWith('// Return') && !trimmed.startsWith('* Return') && !trimmed.startsWith('if (') && !trimmed.startsWith('if(')) {
        console.log(`${file}:${idx + 1}: ${trimmed}`);
      }
    }
  });
});
