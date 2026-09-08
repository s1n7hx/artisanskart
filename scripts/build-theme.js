import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const themeDir = path.join(rootDir, 'wordpress-theme', 'artisanskart');
const themeAssetsDir = path.join(themeDir, 'assets');
const publicDir = path.join(rootDir, 'public');

console.log('🚀 Building WordPress Theme Package for ArtisansKart...');

// 1. Ensure target directories exist
if (!fs.existsSync(themeAssetsDir)) {
  fs.mkdirSync(themeAssetsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. Clean compiled assets but preserve custom theme scripts
const customThemeJsPath = path.join(themeAssetsDir, 'theme.js');
let savedThemeJs = null;
if (fs.existsSync(customThemeJsPath)) {
  savedThemeJs = fs.readFileSync(customThemeJsPath, 'utf8');
}

if (fs.existsSync(themeAssetsDir)) {
  fs.rmSync(themeAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(themeAssetsDir, { recursive: true });

// Restore theme.js
if (savedThemeJs) {
  fs.writeFileSync(customThemeJsPath, savedThemeJs, 'utf8');
}

// 3. Copy compiled dist/assets into wordpress-theme/artisanskart/assets/
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(distAssetsDir)) {
  fs.cpSync(distAssetsDir, themeAssetsDir, { recursive: true });
  // Ensure theme.js is definitely still there
  if (savedThemeJs) {
    fs.writeFileSync(customThemeJsPath, savedThemeJs, 'utf8');
  }
  console.log('Copied assets from dist/assets -> wordpress-theme/artisanskart/assets/');
} else {
  console.warn('⚠️ Warning: dist/assets not found. Run "vite build" first.');
}

// 4. Create theme ZIP using JSZip
async function createThemeZip() {
  const zip = new JSZip();
  const themeFolder = zip.folder('artisanskart');

  function addFilesRecursively(currentPath, zipTarget) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subFolder = zipTarget.folder(item);
        addFilesRecursively(fullPath, subFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        zipTarget.file(item, content);
      }
    }
  }

  addFilesRecursively(themeDir, themeFolder);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const publicZipPath = path.join(publicDir, 'artisanskart-theme.zip');
  fs.writeFileSync(publicZipPath, zipBuffer);
  console.log(`✅ Generated downloadable theme zip: ${publicZipPath}`);

  if (fs.existsSync(distDir)) {
    const distZipPath = path.join(distDir, 'artisanskart-theme.zip');
    fs.writeFileSync(distZipPath, zipBuffer);
  }

  console.log('🎉 WordPress Theme is 100% ready for upload!');
}

createThemeZip().catch(err => {
  console.error('Error creating theme ZIP:', err);
  process.exit(1);
});
