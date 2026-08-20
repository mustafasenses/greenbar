import { scratch } from './color.js';

// Sets are deliberately unordered: the ramp is built by measuring how much ink
// each glyph actually puts on a cell. A hand-ordered ramp bunches tones in the
// middle and flattens faces.
export const CHARSETS = {
  classic:  '@%#*+=-:. ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,^. ',
  letters:  'MWNQBDHKARGOPUSEXZFYTCVJILlicvunxrjft ',
  digits:   '0896452317 ',
  blocks:   '█▓▒░ ',
};

export const STYLE_KEYS = Object.keys(CHARSETS);

export const SHADE = [' ', '░', '▒', '▓', '█'];
export const HALF_TOP = '▀';
export const HALF_BOTTOM = '▄';

const cache = new Map();

/** Drop cached measurements, e.g. once webfonts finish loading. */
export function resetRamps() {
  cache.clear();
}

/**
 * Order a charset by measured ink coverage.
 * @returns {{ch: string, d: number}[]} ascending density, d normalised to 0..1
 */
export function ramp(key, cellAspect) {
  const hit = cache.get(key);
  if (hit) return hit;

  const H = 26;
  const W = Math.max(4, Math.round(H * cellAspect));
  const cv = scratch('glyph');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const px = H / 1.45;
  ctx.font = `${px}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const seen = new Set();
  const measured = [];
  for (const ch of CHARSETS[key]) {
    if (seen.has(ch)) continue;
    seen.add(ch);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillText(ch, W / 2, (H + px) / 2 - px * 0.2);
    const data = ctx.getImageData(0, 0, W, H).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += data[i];
    measured.push({ ch, v: sum / (255 * W * H) });
  }

  const lo = Math.min(...measured.map((o) => o.v));
  const hi = Math.max(...measured.map((o) => o.v));
  for (const o of measured) o.d = (o.v - lo) / (hi - lo || 1);
  measured.sort((a, b) => a.d - b.d);

  // Glyphs too close in density just add noise to the ramp.
  const keep = [];
  for (const o of measured) {
    if (!keep.length || o.d - keep[keep.length - 1].d > 0.03) keep.push(o);
  }
  const last = measured[measured.length - 1];
  if (keep[keep.length - 1] !== last) keep.push(last);

  cache.set(key, keep);
  return keep;
}

/** Glyph whose density is closest to x, over an ascending ramp. */
export function pick(r, x) {
  let lo = 0;
  let hi = r.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (r[mid].d < x) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(r[lo - 1].d - x) <= Math.abs(r[lo].d - x)) lo--;
  return r[lo].ch;
}
