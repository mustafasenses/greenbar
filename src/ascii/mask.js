// Cell mask: 1 = draw, 0 = leave blank.

export function ellipseMask(cols, rows) {
  const m = new Uint8Array(cols * rows);
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const rx = cols / 2;
  const ry = rows / 2;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      m[y * cols + x] = dx * dx + dy * dy <= 0.98 ? 1 : 0;
    }
  }
  return m;
}

/** Spread of the outer frame; small on avatars with a flat backdrop. */
export function borderStats(lum, cols, rows) {
  const vals = [];
  for (let x = 0; x < cols; x++) vals.push(lum[x], lum[(rows - 1) * cols + x]);
  for (let y = 1; y < rows - 1; y++) vals.push(lum[y * cols], lum[y * cols + cols - 1]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  let sq = 0;
  for (const v of vals) sq += (v - mean) * (v - mean);
  return { mean, sd: Math.sqrt(sq / vals.length) };
}

/** Flood from the frame edges, clearing everything close to the seed tone. */
export function flood(lum, cols, rows, level, tol) {
  const keep = new Uint8Array(cols * rows).fill(1);
  const seen = new Uint8Array(cols * rows);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const i = y * cols + x;
    if (seen[i]) return;
    seen[i] = 1;
    if (Math.abs(lum[i] - level) <= tol) {
      keep[i] = 0;
      stack.push(x, y);
    }
  };
  for (let x = 0; x < cols; x++) { push(x, 0); push(x, rows - 1); }
  for (let y = 0; y < rows; y++) { push(0, y); push(cols - 1, y); }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return keep;
}

/**
 * Size of the kept region reachable from the centre by 4-neighbour steps.
 * Colour tells subject and backdrop apart even when they share a tone, so a
 * grayscale photo is the case most likely to have the flood eat a tone-alike
 * shoulder or sleeve out of the middle of the subject — that leaves the head
 * stranded from stray, disconnected specks elsewhere in "keep". Comparing the
 * centre-connected component against the total catches that split.
 */
function centreComponent(keep, cols, rows) {
  const start = ((rows >> 1) * cols) + (cols >> 1);
  if (!keep[start]) return 0;
  const seen = new Uint8Array(cols * rows);
  const stack = [start];
  seen[start] = 1;
  let n = 1;
  while (stack.length) {
    const i = stack.pop();
    const x = i % cols;
    const y = (i / cols) | 0;
    if (x > 0 && keep[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stack.push(i - 1); n++; }
    if (x < cols - 1 && keep[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stack.push(i + 1); n++; }
    if (y > 0 && keep[i - cols] && !seen[i - cols]) { seen[i - cols] = 1; stack.push(i - cols); n++; }
    if (y < rows - 1 && keep[i + cols] && !seen[i + cols]) { seen[i + cols] = 1; stack.push(i + cols); n++; }
  }
  return n;
}

/**
 * Auto mode only knocks out genuinely flat backdrops — great for logos, and
 * conservative enough not to eat into a photographed subject. Anything busier
 * falls back to a circle crop, which keeps the face framed.
 * @param {'auto'|'circle'|'square'} mode
 */
export function buildMask(lum, cols, rows, mode) {
  if (mode === 'square') return new Uint8Array(cols * rows).fill(1);
  if (mode === 'circle') return ellipseMask(cols, rows);

  const b = borderStats(lum, cols, rows);
  if (b.sd < 0.055) {
    const keep = flood(lum, cols, rows, b.mean, 0.12);
    let on = 0;
    for (let i = 0; i < keep.length; i++) on += keep[i];
    const frac = on / keep.length;
    if (frac > 0.08 && frac < 0.95 && centreComponent(keep, cols, rows) > on * 0.85) return keep;
  }
  return ellipseMask(cols, rows);
}
