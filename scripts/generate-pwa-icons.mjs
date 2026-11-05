import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function createPng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowLen = width * 4;
  const rawData = Buffer.alloc(height * (rowLen + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (rowLen + 1)] = 0;
    rgbaBuffer.copy(rawData, y * (rowLen + 1) + 1, y * rowLen, (y + 1) * rowLen);
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function renderPwaIcon(size, isMaskable = false, roundedRadiusRatio = 0.22) {
  const buffer = Buffer.alloc(size * size * 4);

  // Colors
  const bg = [23, 43, 58, 255]; // #172B3A Deep Slate Blue
  const emerald = [8, 127, 91, 255]; // #087F5B
  const amber = [245, 158, 11, 255]; // #F59E0B
  const white = [255, 255, 255, 255];
  const roadDark = [15, 23, 42, 255]; // #0F172A

  const radius = isMaskable ? 0 : size * roundedRadiusRatio;
  const scale = isMaskable ? 0.72 : 0.88;
  const offset = (size * (1 - scale)) / 2;

  function setPixel(x, y, color) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    buffer[idx] = color[0];
    buffer[idx + 1] = color[1];
    buffer[idx + 2] = color[2];
    buffer[idx + 3] = color[3];
  }

  // Draw background with rounded corners (or full bleed if maskable)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!isMaskable) {
        let inside = true;
        // corner checks
        if (x < radius && y < radius) {
          inside = (x - radius) ** 2 + (y - radius) ** 2 <= radius ** 2;
        } else if (x > size - 1 - radius && y < radius) {
          inside = (x - (size - 1 - radius)) ** 2 + (y - radius) ** 2 <= radius ** 2;
        } else if (x < radius && y > size - 1 - radius) {
          inside = (x - radius) ** 2 + (y - (size - 1 - radius)) ** 2 <= radius ** 2;
        } else if (x > size - 1 - radius && y > size - 1 - radius) {
          inside = (x - (size - 1 - radius)) ** 2 + (y - (size - 1 - radius)) ** 2 <= radius ** 2;
        }
        if (inside) {
          setPixel(x, y, bg);
        } else {
          setPixel(x, y, [0, 0, 0, 0]); // Transparent outside
        }
      } else {
        setPixel(x, y, bg); // Full bleed for maskable
      }
    }
  }

  // Draw Highway / Road perspective icon inside safe zone
  // Center is size/2, size/2
  const cx = size / 2;
  const topY = offset + size * scale * 0.18;
  const botY = offset + size * scale * 0.84;
  const topHalfW = size * scale * 0.12;
  const botHalfW = size * scale * 0.36;

  for (let y = Math.floor(topY); y <= Math.ceil(botY); y++) {
    const progress = (y - topY) / (botY - topY);
    const halfW = topHalfW + (botHalfW - topHalfW) * progress;
    const minX = Math.floor(cx - halfW);
    const maxX = Math.ceil(cx + halfW);

    for (let x = minX; x <= maxX; x++) {
      // Highway asphalt
      setPixel(x, y, roadDark);

      // Emerald curbs
      if (Math.abs(x - cx) >= halfW - (size * 0.035)) {
        setPixel(x, y, emerald);
      }

      // Dashed yellow / amber center line
      const dashPeriod = Math.max(8, size * 0.1);
      const inDash = ((y - topY) % dashPeriod) < (dashPeriod * 0.55);
      const lineWidth = Math.max(1, (size * 0.02) * (0.6 + 0.8 * progress));
      if (inDash && Math.abs(x - cx) <= lineWidth) {
        setPixel(x, y, amber);
      }
    }
  }

  // Draw Construction Hardhat / Arch Emblem on top
  const archCenterY = topY + size * scale * 0.05;
  const archRadius = size * scale * 0.16;
  for (let y = Math.floor(archCenterY - archRadius); y <= Math.ceil(archCenterY); y++) {
    for (let x = Math.floor(cx - archRadius); x <= Math.ceil(cx + archRadius); x++) {
      if ((x - cx) ** 2 + (y - archCenterY) ** 2 <= archRadius ** 2) {
        setPixel(x, y, emerald);
      }
    }
  }
  // Hardhat brim
  for (let y = Math.floor(archCenterY - size * 0.01); y <= Math.ceil(archCenterY + size * 0.02); y++) {
    for (let x = Math.floor(cx - archRadius * 1.3); x <= Math.ceil(cx + archRadius * 1.3); x++) {
      setPixel(x, y, amber);
    }
  }

  // Draw road base line
  for (let y = Math.floor(botY); y <= Math.ceil(botY + size * 0.025); y++) {
    for (let x = Math.floor(cx - botHalfW * 1.05); x <= Math.ceil(cx + botHalfW * 1.05); x++) {
      setPixel(x, y, emerald);
    }
  }

  return createPng(size, size, buffer);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Icons
console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderPwaIcon(192, false, 0.22));
console.log('Created pwa-192x192.png');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderPwaIcon(512, false, 0.22));
console.log('Created pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderPwaIcon(512, true));
console.log('Created pwa-maskable-512x512.png');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderPwaIcon(180, false, 0.22));
console.log('Created apple-touch-icon.png');

// Also generate clean SVG icon in public
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#172B3A"/>
  <path d="M140 430 L220 170 L292 170 L372 430 Z" fill="#0F172A"/>
  <path d="M140 430 L158 430 L228 170 L220 170 Z" fill="#087F5B"/>
  <path d="M372 430 L354 430 L284 170 L292 170 Z" fill="#087F5B"/>
  <path d="M250 190 L262 190 L262 230 L250 230 Z" fill="#F59E0B"/>
  <path d="M248 260 L264 260 L264 310 L248 310 Z" fill="#F59E0B"/>
  <path d="M246 340 L266 340 L266 400 L246 400 Z" fill="#F59E0B"/>
  <path d="M210 160 C210 120 302 120 302 160 Z" fill="#087F5B"/>
  <rect x="190" y="156" width="132" height="14" rx="7" fill="#F59E0B"/>
  <rect x="110" y="440" width="292" height="16" rx="8" fill="#10B981"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Created favicon.svg & icon.svg');
