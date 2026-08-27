/**
 * Generates the gallery's placeholder artwork as PNG files.
 *
 * The gallery used to point at picsum.photos. That works on the internet but
 * makes the page depend on a third party being reachable — on a machine that
 * cannot reach it, every image is a 504 from the optimiser. Checked-in files
 * remove the dependency, and they let next/image derive the blur placeholder
 * from the file itself instead of us hand-rolling one.
 *
 * These are abstract gradients, not photographs. Run with:
 *   node scripts/generate-gallery-images.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_DIR = join(ROOT, 'apps', 'web', 'public', 'gallery');
const OG_DIR = join(ROOT, 'apps', 'blog', 'public', 'og');

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n++) {
    let c = n;

    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c >>> 0;
  }

  return table;
})();

function crc32(buffer) {
  let c = 0xff_ff_ff_ff;

  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xff_ff_ff_ff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, crc]);
}

function mix(from, to, t) {
  return Math.round(from + (to - from) * t);
}

/**
 * A diagonal gradient between two colours, with a soft band across it so the
 * result reads as artwork rather than as a flat wash.
 */
function render(width, height, from, to) {
  const raw = Buffer.alloc(height * (1 + width * 3));
  let p = 0;

  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filter: none

    for (let x = 0; x < width; x++) {
      const diagonal = (x / width) * 0.65 + (y / height) * 0.35;
      const band = Math.sin((x / width) * Math.PI * 2 + y / height) * 0.06;
      const t = Math.min(1, Math.max(0, diagonal + band));

      raw[p++] = mix(from[0], to[0], t);
      raw[p++] = mix(from[1], to[1], t);
      raw[p++] = mix(from[2], to[2], t);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const images = [
  // The hero, in the two crops the art direction switches between.
  {
    name: 'hero-wide',
    w: 1440,
    h: 600,
    from: [38, 62, 104],
    to: [214, 148, 96],
  },
  {
    name: 'hero-tall',
    w: 750,
    h: 900,
    from: [38, 62, 104],
    to: [214, 148, 96],
  },
  { name: 'slate', w: 800, h: 600, from: [72, 92, 112], to: [186, 200, 212] },
  { name: 'ember', w: 800, h: 600, from: [186, 92, 58], to: [58, 66, 104] },
  { name: 'moss', w: 800, h: 600, from: [46, 78, 52], to: [148, 168, 110] },
  { name: 'dusk', w: 800, h: 600, from: [58, 62, 86], to: [176, 158, 190] },
];

/**
 * Social card images for the blog, one per post. A crawler fetches these from
 * the public URL, so they have to be real files rather than data URLs.
 */
const ogImages = [
  { name: 'hello-world', from: [42, 68, 112], to: [206, 158, 108] },
  { name: 'nextjs-routing', from: [30, 54, 92], to: [120, 176, 196] },
  { name: 'react-tips', from: [46, 88, 108], to: [168, 200, 208] },
  { name: 'search-params-as-state', from: [66, 54, 108], to: [190, 156, 196] },
  { name: 'designing-empty-states', from: [96, 74, 62], to: [214, 190, 160] },
  { name: 'type-safe-urls', from: [38, 74, 66], to: [148, 190, 158] },
  { name: 'writing-good-changelogs', from: [78, 62, 58], to: [200, 172, 150] },
];

function write(dir, name, width, height, from, to) {
  const png = render(width, height, from, to);

  writeFileSync(join(dir, `${name}.png`), png);
  process.stdout.write(
    `  ${name}.png`.padEnd(32) + `${width}x${height}  ${png.length} bytes\n`
  );
}

mkdirSync(GALLERY_DIR, { recursive: true });
mkdirSync(OG_DIR, { recursive: true });

process.stdout.write('gallery (apps/web/public/gallery):\n');

for (const image of images) {
  write(GALLERY_DIR, image.name, image.w, image.h, image.from, image.to);
}

process.stdout.write('\nsocial cards (apps/blog/public/og), 1200x630:\n');

for (const image of ogImages) {
  write(OG_DIR, image.name, 1200, 630, image.from, image.to);
}
