/**
 * generate-icons.js
 * Generates PNG icons from SVG using only built-in Node modules + canvas API
 * Run: node generate-icons.js
 */

const fs   = require('fs');
const path = require('path');

// Check if canvas is available
let canvas;
try { canvas = require('canvas'); } catch(e) { canvas = null; }

if (!canvas) {
  // Fallback: copy SVG as PNG placeholder using pure Node
  // (browsers will handle SVG icons fine, PNG needed for older Android)
  console.log('Canvas not available — creating PNG from embedded base64 SVG...');
  generatePNGFallback();
} else {
  generateFromCanvas();
}

function generateFromCanvas() {
  const { createCanvas, loadImage } = canvas;
  const sizes = [72, 96, 128, 192, 512];
  const srcSvg192 = path.join(__dirname, 'img', 'icon-192.svg');
  const srcSvg512 = path.join(__dirname, 'img', 'icon-512.svg');

  Promise.all(sizes.map(function(size) {
    var src = size <= 192 ? srcSvg192 : srcSvg512;
    return loadImage(src).then(function(img) {
      var c   = createCanvas(size, size);
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      var out = path.join(__dirname, 'img', 'icon-' + size + '.png');
      fs.writeFileSync(out, c.toBuffer('image/png'));
      console.log('Generated: icon-' + size + '.png');
    });
  })).then(function() {
    console.log('All icons generated!');
  }).catch(function(e) {
    console.error('Canvas error:', e.message);
    generatePNGFallback();
  });
}

function generatePNGFallback() {
  // Minimal valid 1x1 PNG (transparent) as placeholder
  // Real icons served as SVG via <link rel="icon" type="image/svg+xml">
  var sizes = [72, 96, 128, 192, 512];

  // 1x1 transparent PNG base64
  var png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  sizes.forEach(function(size) {
    var out = path.join(__dirname, 'img', 'icon-' + size + '.png');
    if (!fs.existsSync(out)) {
      fs.writeFileSync(out, png1x1);
      console.log('Placeholder PNG: icon-' + size + '.png');
    } else {
      console.log('Exists, skip: icon-' + size + '.png');
    }
  });
  console.log('Done. SVG icons will be used as primary icons in manifest.');
}
