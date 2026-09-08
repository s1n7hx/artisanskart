import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const themeDir = path.join(rootDir, 'wordpress-theme', 'artisanskart');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(themeDir)) {
  fs.mkdirSync(themeDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('📦 Packaging ArtisansKart Multi-Page WordPress Theme v2.2.0...');

async function buildZip() {
  const zip = new JSZip();
  const themeFolder = zip.folder('artisanskart');

  if (!themeFolder) throw new Error('Could not create folder in zip');

  function addFilesFromDir(dir: string, zipSubFolder: JSZip) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = zipSubFolder.folder(entry.name);
        if (sub) {
          addFilesFromDir(fullPath, sub);
        }
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        zipSubFolder.file(entry.name, content);
      }
    }
  }

  addFilesFromDir(themeDir, themeFolder);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const targetPath = path.join(publicDir, 'artisanskart-theme.zip');
  fs.writeFileSync(targetPath, zipBuffer);
  console.log(`✅ Generated ${targetPath} (${zipBuffer.length} bytes)`);

  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'artisanskart-theme.zip'), zipBuffer);
  }
}

buildZip().then(() => {
  console.log('🎉 Multi-page WordPress theme packaged successfully!');
}).catch(err => {
  console.error('❌ Error packaging theme:', err);
  process.exit(1);
});
