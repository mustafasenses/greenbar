import { panelLines } from './panel.js';

/** Total line budget for portrait plus panel. */
export const MAX_LINE = 104;
const GUTTER = 4;

const widthOf = (lines) => lines.reduce((m, l) => Math.max(m, l.length), 0);

/**
 * Portrait and panel side by side inside one monospace block. No table and no
 * HTML, so GitHub draws no border around it. Each column is centred vertically
 * against the other.
 */
function composeSide(art, p, rows) {
  const artW = widthOf(art);
  const panelW = Math.max(34, Math.min(54, MAX_LINE - artW - GUTTER));
  const text = panelLines(p.login, rows, panelW);
  if (text.length < 2) return art;

  const height = Math.max(art.length, text.length);
  const artTop = Math.max(0, Math.floor((text.length - art.length) / 2));
  const textTop = Math.max(0, Math.floor((art.length - text.length) / 2));
  const out = [];
  for (let i = 0; i < height; i++) {
    const left = (art[i - artTop] || '').padEnd(artW, ' ');
    const right = text[i - textTop] || '';
    out.push((left + ' '.repeat(GUTTER) + right).replace(/\s+$/, ''));
  }
  return out;
}

function composeStack(art, p, rows) {
  const panelW = Math.max(44, Math.min(78, widthOf(art)));
  const text = panelLines(p.login, rows, panelW);
  if (text.length < 2) return art;
  return [...art, '', ...text].map((l) => l.replace(/\s+$/, ''));
}

/** @param {'side'|'stack'|'ascii'} layout */
export function buildBlock(art, p, layout, rows) {
  if (layout === 'side') return composeSide(art, p, rows);
  if (layout === 'stack') return composeStack(art, p, rows);
  return art;
}
