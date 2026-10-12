#!/usr/bin/env node
/*
 * استخراج الألوان الفعلية من ملف اللوجو (مش تخمين).
 * الاستخدام:
 *   node scripts/extract-palette.mjs public/brand/logo.png
 *   node scripts/extract-palette.mjs public/brand/logo.svg
 *   node scripts/extract-palette.mjs --self-test   (يفحص مفكك الـ PNG على صورة مولّدة)
 *
 * الناتج: جدول HEX بالنسب، والقيم تُسجَّل يدويًا في docs/DESIGN.md.
 */
import { readFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";

// ---------- أدوات عامة ----------

function toHex(r, g, b) {
  const h = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function luminance(r, g, b) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a, b) {
  const p = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return luminance((n >> 16) & 255, (n >> 8) & 255, n & 255);
  };
  const [hi, lo] = [p(a), p(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------- مسار SVG: تجميع قيم fill ----------

function extractSvgColors(buf) {
  const text = buf.toString("utf8");
  const counts = new Map();
  for (const m of text.matchAll(/fill\s*=\s*["'](#(?:[0-9a-fA-F]{3,8}))["']/g)) {
    let hex = m[1].toLowerCase();
    if (hex.length === 4) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    if (hex.length === 7) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex, n]) => ({ hex, share: n / total }));
}

// ---------- مسار PNG: مفكك صغير (8-bit RGB/RGBA فقط) ----------

function readU32(buf, off) {
  return buf.readUInt32BE(off);
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

/** يبني PNG صغير في الذاكرة — للفحص الذاتي فقط. */
export function buildTestPng(pixels, width, height) {
  const bpp = 4;
  const raw = Buffer.alloc(height * (1 + width * bpp));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * bpp)] = 0; // فلتر None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixels[y * width + x];
      raw.set([r, g, b, a], y * (1 + width * bpp) + 1 + x * bpp);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

export function decodePng(buf) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.subarray(0, 8).equals(sig)) throw new Error("ليس ملف PNG صالحًا");
  let pos = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = readU32(buf, pos);
    const type = buf.subarray(pos + 4, pos + 8).toString("ascii");
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = readU32(data, 0);
      height = readU32(data, 4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(
      `صيغة غير مدعومة (bitDepth=${bitDepth}, colorType=${colorType}) — المطلوب 8-bit RGB/RGBA`
    );
  }
  const bpp = colorType === 2 ? 3 : 4;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const pixels = [];
  let p = 0;
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      const f = raw[p++];
      if (filter === 0) cur[i] = f;
      else if (filter === 1) cur[i] = (f + a) & 255;
      else if (filter === 2) cur[i] = (f + b) & 255;
      else if (filter === 3) cur[i] = (f + ((a + b) >> 1)) & 255;
      else if (filter === 4) cur[i] = (f + paeth(a, b, c)) & 255;
      else throw new Error(`فلتر غير مدعوم: ${filter}`);
    }
    for (let x = 0; x < width; x++) {
      const r = cur[x * bpp];
      const g = cur[x * bpp + 1];
      const bl = cur[x * bpp + 2];
      const al = bpp === 4 ? cur[x * bpp + 3] : 255;
      pixels.push([r, g, bl, al]);
    }
    prev.set(cur);
  }
  return { width, height, pixels };
}

function quantizePng({ pixels }) {
  // تجاهل الشفاف، وتقليل الدقة لـ 4-bit لكل قناة ثم دمج المتقارب.
  const step = pixels.length > 60_000 ? Math.floor(pixels.length / 60_000) : 1;
  const counts = new Map();
  let opaque = 0;
  for (let i = 0; i < pixels.length; i += step) {
    const [r, g, b, a] = pixels[i];
    if (a < 128) continue;
    opaque++;
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    const e = counts.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    counts.set(key, e);
  }
  return [...counts.values()]
    .sort((x, y) => y.n - x.n)
    .slice(0, 8)
    .map((e) => ({ hex: toHex(e.r / e.n, e.g / e.n, e.b / e.n), share: e.n / (opaque || 1) }));
}

// ---------- الواجهة ----------

function printPalette(rows, source) {
  console.log(`\nالألوان المستخرجة من: ${source}\n`);
  console.log("| اللون | النسبة التقريبية |");
  console.log("|---|---|");
  for (const r of rows) console.log(`| ${r.hex} | ${(r.share * 100).toFixed(1)}% |`);
  console.log("\nسجّل القيم في docs/DESIGN.md ثم حدّث CSS variables في src/app/globals.css.");
}

function selfTest() {
  const pixels = [
    [200, 30, 30, 255],
    [30, 200, 30, 255],
    [30, 30, 200, 255],
    [250, 250, 250, 255],
  ];
  const png = buildTestPng(pixels, 2, 2);
  const decoded = decodePng(png);
  const got = decoded.pixels.map(([r, g, b]) => toHex(r, g, b)).sort();
  const want = ["#c81e1e", "#1ec81e", "#1e1ec8", "#fafafa"].sort();
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(ok ? "SELF-TEST: ناجح" : `SELF-TEST: فاشل\n  حصلنا: ${got}\n  أردنا: ${want}`);
  process.exit(ok ? 0 : 1);
}

const arg = process.argv[2];
if (arg === "--self-test") {
  selfTest();
} else if (!arg) {
  console.error("الاستخدام: node scripts/extract-palette.mjs <logo.png|logo.svg> أو --self-test");
  process.exit(1);
} else if (arg.endsWith(".svg")) {
  printPalette(extractSvgColors(readFileSync(arg)), arg);
} else {
  printPalette(quantizePng(decodePng(readFileSync(arg))), arg);
}
