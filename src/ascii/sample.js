import { LIN, toSrgb, scratch } from './color.js';

/** Supersampling factor per cell (SS x SS pixels). */
const SS = 4;

/**
 * Reduce a centre-cropped square image to a cols x rows grid, each cell the
 * linear-light average of its own pixel block.
 * @returns {Float32Array} sRGB luminance per cell, 0..1
 */
export function sampleGrid(img, cols, rows) {
  const w = cols * SS;
  const h = rows * SS;
  const cv = scratch('sample');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Neutral backdrop for transparent PNGs; black would leave a fake halo.
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, w, h);

  const px = ctx.getImageData(0, 0, w, h).data;
  const lum = new Float32Array(cols * rows);
  const n = SS * SS;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let acc = 0;
      for (let j = 0; j < SS; j++) {
        let p = ((y * SS + j) * w + x * SS) * 4;
        for (let i = 0; i < SS; i++, p += 4) {
          acc += 0.2126 * LIN[px[p]] + 0.7152 * LIN[px[p + 1]] + 0.0722 * LIN[px[p + 2]];
        }
      }
      lum[y * cols + x] = toSrgb(acc / n);
    }
  }
  return lum;
}
