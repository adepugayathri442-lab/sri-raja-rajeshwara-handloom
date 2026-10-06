import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generatePng(width, height, isSplash = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data
  // Color 1: Emerald #0D3B2E (13, 59, 46)
  // Color 2: Gold #C5A059 (197, 160, 89)
  // Color 3: White #FAF8F5 (250, 248, 245)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isSplash ? 0.25 : 0.35);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Diamond / Loom Emblem math: |dx| + |dy| <= radius
      const diamondDist = Math.abs(dx) + Math.abs(dy);

      if (diamondDist < radius && diamondDist > radius * 0.88) {
        // Gold border
        rawData[pxOffset] = 197;
        rawData[pxOffset + 1] = 160;
        rawData[pxOffset + 2] = 89;
        rawData[pxOffset + 3] = 255;
      } else if (diamondDist <= radius * 0.88 && diamondDist >= radius * 0.8) {
        // Subtle inset
        rawData[pxOffset] = 13;
        rawData[pxOffset + 1] = 59;
        rawData[pxOffset + 2] = 46;
        rawData[pxOffset + 3] = 255;
      } else if (dist < radius * 0.35 && dist > radius * 0.28) {
        // Center gold ring
        rawData[pxOffset] = 197;
        rawData[pxOffset + 1] = 160;
        rawData[pxOffset + 2] = 89;
        rawData[pxOffset + 3] = 255;
      } else if (dist <= radius * 0.15) {
        // Core spool
        rawData[pxOffset] = 250;
        rawData[pxOffset + 1] = 248;
        rawData[pxOffset + 2] = 245;
        rawData[pxOffset + 3] = 255;
      } else {
        // Background: Emerald #0D3B2E
        rawData[pxOffset] = 13;
        rawData[pxOffset + 1] = 59;
        rawData[pxOffset + 2] = 46;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.resolve('mobile/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

fs.writeFileSync(path.join(assetsDir, 'icon.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(assetsDir, 'splash.png'), generatePng(1024, 1024, true));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), generatePng(48, 48, false));

console.log('Mobile assets generated successfully in mobile/assets/');
