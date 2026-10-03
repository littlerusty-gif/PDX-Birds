const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.join(__dirname, '../public/logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const target of targets) {
    const outPath = path.join(__dirname, '../public', target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(outPath);
    console.log(`Generated: ${target.name} (${target.size}x${target.size})`);
  }

  // Also copy to favicon.ico and favicon.svg and bird.svg
  fs.copyFileSync(svgPath, path.join(__dirname, '../public/favicon.svg'));
  fs.copyFileSync(svgPath, path.join(__dirname, '../public/bird.svg'));
  fs.copyFileSync(
    path.join(__dirname, '../public/favicon-32x32.png'),
    path.join(__dirname, '../public/favicon.ico')
  );
  console.log('Copied favicon.svg, bird.svg, and favicon.ico');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
