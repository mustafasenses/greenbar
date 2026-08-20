import { clamp01 } from './color.js';
import { buildMask } from './mask.js';
import { sampleGrid } from './sample.js';

/**
 * Percentile-clipped histogram stretch over masked cells only. Letting the
 * fill colour of cropped corners into the histogram defeats the stretch.
 */
export function levels(lum, mask) {
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < lum.length; i++) {
    if (!mask[i]) continue;
    hist[(clamp01(lum[i]) * 255) | 0]++;
    n++;
  }
  if (!n) return { lo: 0, hi: 1 };

  const cut = Math.floor(n * 0.015);
  let lo = 0;
  let hi = 255;
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > cut) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > cut) { hi = i; break; } }
  if (hi - lo < 8) { lo = 0; hi = 255; }
  return { lo: lo / 255, hi: hi / 255 };
}

/**
 * Contrast-limited adaptive histogram equalisation.
 *
 * A single global curve collapses a face in front of a bright wall into one
 * tone. Here each tile gets its own range and neighbouring tiles are blended
 * bilinearly; the clip limit stops flat areas from having their noise
 * amplified into character litter.
 */
export function clahe(v, mask, cols, rows, tx, ty, clip) {
  const BINS = 64;
  const bin = (x) => Math.min(BINS - 1, (clamp01(x) * BINS) | 0);

  const build = (idx) => {
    const h = new Float32Array(BINS);
    let n = 0;
    for (const i of idx) { h[bin(v[i])]++; n++; }
    if (n < 8) return null;
    const limit = Math.max(1, (clip * n) / BINS);
    let excess = 0;
    for (let b = 0; b < BINS; b++) {
      if (h[b] > limit) { excess += h[b] - limit; h[b] = limit; }
    }
    const add = excess / BINS;
    const cdf = new Float32Array(BINS);
    let acc = 0;
    for (let b = 0; b < BINS; b++) { acc += h[b] + add; cdf[b] = acc / n; }
    return cdf;
  };

  const all = [];
  for (let i = 0; i < v.length; i++) if (mask[i]) all.push(i);
  const global = build(all);
  if (!global) return v;

  const tw = cols / tx;
  const th = rows / ty;
  const cdfs = [];
  for (let ti = 0; ti < ty; ti++) {
    for (let tj = 0; tj < tx; tj++) {
      const idx = [];
      for (let y = Math.floor(ti * th); y < Math.floor((ti + 1) * th); y++) {
        for (let x = Math.floor(tj * tw); x < Math.floor((tj + 1) * tw); x++) {
          const i = y * cols + x;
          if (mask[i]) idx.push(i);
        }
      }
      cdfs.push(build(idx) || global);
    }
  }

  const out = new Float32Array(v.length);
  for (let y = 0; y < rows; y++) {
    const fy = Math.min(ty - 1, Math.max(0, y / th - 0.5));
    const iy = Math.floor(fy);
    const wy = fy - iy;
    const iy1 = Math.min(ty - 1, iy + 1);
    for (let x = 0; x < cols; x++) {
      const fx = Math.min(tx - 1, Math.max(0, x / tw - 0.5));
      const ix = Math.floor(fx);
      const wx = fx - ix;
      const ix1 = Math.min(tx - 1, ix + 1);
      const b = bin(v[y * cols + x]);
      const p = cdfs[iy * tx + ix][b];
      const q = cdfs[iy * tx + ix1][b];
      const r = cdfs[iy1 * tx + ix][b];
      const s = cdfs[iy1 * tx + ix1][b];
      out[y * cols + x] = (p * (1 - wx) + q * wx) * (1 - wy) + (r * (1 - wx) + s * wx) * wy;
    }
  }
  return out;
}

/** Mild blur so single-cell JPEG noise does not survive the sharpen pass. */
export function smooth(v, cols, rows, mix) {
  const out = new Float32Array(v.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let s = 0;
      let n = 0;
      for (let j = -1; j <= 1; j++) {
        const yy = y + j;
        if (yy < 0 || yy >= rows) continue;
        for (let i = -1; i <= 1; i++) {
          const xx = x + i;
          if (xx < 0 || xx >= cols) continue;
          const w = (i === 0 ? 2 : 1) * (j === 0 ? 2 : 1);
          s += v[yy * cols + xx] * w;
          n += w;
        }
      }
      const i0 = y * cols + x;
      out[i0] = v[i0] * (1 - mix) + (s / n) * mix;
    }
  }
  return out;
}

/** Unsharp mask; at this resolution eyes and edges are otherwise averaged away. */
export function unsharp(v, cols, rows, amount) {
  const out = new Float32Array(v.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let s = 0;
      let n = 0;
      for (let j = -1; j <= 1; j++) {
        const yy = y + j;
        if (yy < 0 || yy >= rows) continue;
        for (let i = -1; i <= 1; i++) {
          const xx = x + i;
          if (xx < 0 || xx >= cols) continue;
          s += v[yy * cols + xx];
          n++;
        }
      }
      const i0 = y * cols + x;
      out[i0] = v[i0] + amount * (v[i0] - s / n);
    }
  }
  return out;
}

/**
 * sample -> mask -> stretch -> local equalise -> smooth -> sharpen -> contrast.
 * @returns {{v: Float32Array, mask: Uint8Array, base: Float32Array}}
 *   base is the pre-CLAHE brightness, kept for the polarity decision.
 */
export function tonemap(img, cols, rows, { crop, contrast }) {
  const raw = sampleGrid(img, cols, rows);
  const mask = buildMask(raw, cols, rows, crop);

  const { lo, hi } = levels(raw, mask);
  const span = hi - lo || 1;
  let v = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) v[i] = clamp01((raw[i] - lo) / span);

  // Figure/ground survives only here: CLAHE pulls every tile towards a 0.5
  // mean, after which "is the subject or the backdrop brighter" has no answer.
  const base = v.slice();

  const tx = Math.max(2, Math.min(6, Math.round(cols / 16)));
  const ty = Math.max(2, Math.min(5, Math.round(rows / 7)));
  const eq = clahe(v, mask, cols, rows, tx, ty, 1.6);
  // Deliberately a light touch: more local detail costs silhouette.
  for (let i = 0; i < v.length; i++) v[i] = 0.74 * v[i] + 0.26 * eq[i];

  v = unsharp(smooth(v, cols, rows, 0.35), cols, rows, 0.45);

  const k = contrast / 100;
  for (let i = 0; i < v.length; i++) v[i] = clamp01((clamp01(v[i]) - 0.5) * k + 0.5);
  return { v, mask, base };
}

/**
 * Brightness to ink, 0 = blank cell, 1 = densest glyph.
 *
 * Auto keeps the subject dense and the backdrop empty whichever way the photo
 * runs; a dark portrait against a bright wall otherwise reads as a hole.
 */
export function inkGrid(v, base, mask, cols, rows, { dark, tone }) {
  const ink = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) ink[i] = mask[i] ? (dark ? v[i] : 1 - v[i]) : 0;

  let flip = tone === 'invert';
  if (tone === 'auto') {
    // Inner disc (subject) against the outer ring (near enough all backdrop);
    // the transition band between them is left out of both.
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    let ci = 0, cn = 0, bi = 0, bn = 0, bAll = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const dx = (x - cx) / (cols / 2);
        const dy = (y - cy) / (rows / 2);
        const d2 = dx * dx + dy * dy;
        if (d2 >= 0.64) bAll++;
        if (!mask[i]) continue;
        const b = dark ? base[i] : 1 - base[i];
        if (d2 <= 0.25) { ci += b; cn++; }
        else if (d2 >= 0.64) { bi += b; bn++; }
      }
    }
    // Nothing to compare against once the backdrop has been masked away.
    if (cn && bn && bn > bAll * 0.3) flip = bi / bn > ci / cn + 0.04;
  }
  if (flip) for (let i = 0; i < v.length; i++) if (mask[i]) ink[i] = 1 - ink[i];

  // If a good share of the frame is already near-inkless it is backdrop;
  // pulling the black point up to it drops that area to blank so the portrait
  // floats, instead of leaving the whole square under a haze of ':'.
  const BINS = 64;
  const hist = new Uint32Array(BINS);
  let n = 0;
  for (let i = 0; i < ink.length; i++) {
    if (!mask[i]) continue;
    hist[Math.min(BINS - 1, (ink[i] * BINS) | 0)]++;
    n++;
  }
  if (n) {
    let acc = 0;
    let lo = 0;
    for (let b = 0; b < BINS; b++) {
      acc += hist[b];
      if (acc >= n * 0.22) { lo = (b + 1) / BINS; break; }
    }
    if (lo > 0 && lo <= 0.26) {
      for (let i = 0; i < ink.length; i++) {
        if (mask[i]) ink[i] = clamp01((ink[i] - lo) / (1 - lo));
      }
    }
  }
  return ink;
}
