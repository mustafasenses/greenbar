import { ramp, pick, SHADE, HALF_TOP, HALF_BOTTOM } from './charsets.js';
import { tonemap, inkGrid } from './tone.js';

/**
 * A GitHub code block advances ~0.6em per character over a 1.45 line height,
 * so a square avatar needs this cell ratio to come out square.
 */
export const CELL_ASPECT = 0.42;

export { resetRamps, ramp, CHARSETS, STYLE_KEYS } from './charsets.js';

function trim(lines) {
  const out = lines.map((l) => l.replace(/\s+$/, ''));
  while (out.length && !out[0].trim()) out.shift();
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out.length ? out : [' '];
}

/**
 * Half-block mode: one character carries two vertical sub-cells, doubling
 * vertical resolution for the same line count.
 */
function renderBlocks(img, cols, rows, opts) {
  const { v, mask, cutout } = tonemap(img, cols, rows * 2, opts);
  const ink = inkGrid(v, mask, cols, rows * 2, { ...opts, cutout });
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let row = '';
    for (let x = 0; x < cols; x++) {
      const a = ink[2 * y * cols + x];
      const b = ink[(2 * y + 1) * cols + x];
      if (Math.abs(a - b) > 0.3) row += a > b ? HALF_TOP : HALF_BOTTOM;
      else row += SHADE[Math.min(4, Math.round(((a + b) / 2) * 4))];
    }
    lines.push(row);
  }
  return trim(lines);
}

function renderChars(img, cols, rows, opts) {
  const { v, mask, cutout } = tonemap(img, cols, rows, opts);
  const ink = inkGrid(v, mask, cols, rows, { ...opts, cutout });
  const r = ramp(opts.style, CELL_ASPECT);
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let row = '';
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      row += mask[i] ? pick(r, ink[i]) : ' ';
    }
    lines.push(row);
  }
  return trim(lines);
}

/**
 * @param {HTMLImageElement} img
 * @param {object} opts
 * @param {number} opts.cols
 * @param {boolean} opts.dark      target GitHub theme
 * @param {'auto'|'circle'|'square'} opts.crop
 * @param {string} opts.style      key of CHARSETS
 * @param {number} opts.contrast   100..300
 * @returns {string[]}
 */
export function toAscii(img, opts) {
  const cols = opts.cols;
  const rows = Math.max(1, Math.round(cols * CELL_ASPECT));
  return opts.style === 'blocks'
    ? renderBlocks(img, cols, rows, opts)
    : renderChars(img, cols, rows, opts);
}
