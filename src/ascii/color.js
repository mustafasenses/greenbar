// Averaging pixels in gamma space makes dark regions read brighter than they
// are and muddies portraits, so sampling averages in linear light instead.

/** sRGB 0..255 -> linear 0..1. */
export const LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Linear 0..1 -> sRGB 0..1. */
export const toSrgb = (v) =>
  v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const pool = new Map();

/** Reusable offscreen canvas, one per name. */
export function scratch(name) {
  let cv = pool.get(name);
  if (!cv) {
    cv = document.createElement('canvas');
    pool.set(name, cv);
  }
  return cv;
}
