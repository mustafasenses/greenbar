// Neofetch-style detail panel.
//
// Labels are fixed English on purpose: the generated README lives on a public
// GitHub profile, so the interface language must not leak into it.

/** Section ids, in the order they are printed. */
export const SECTIONS = ['main', 'contact', 'stats'];

/** Printed section headers. 'main' rows sit directly under the login bar. */
export const SECTION_TITLES = { contact: 'Contact', stats: 'GitHub Stats' };

export const cleanUrl = (u) => String(u).replace(/^https?:\/\//, '').replace(/\/$/, '');

/** Split a value into chunks that fit the column, hard-cutting long words. */
export function fitValue(text, max) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const out = [];
  let line = '';
  for (let w of words) {
    while (w.length > max) {
      if (line) { out.push(line); line = ''; }
      out.push(w.slice(0, max));
      w = w.slice(max);
    }
    if (!line) line = w;
    else if (line.length + 1 + w.length <= max) line += ' ' + w;
    else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

/** ". Label: ......... value" with the value flush right. */
export function leader(label, value, w) {
  const head = '. ' + label + ': ';
  const chunks = fitValue(value, Math.max(6, w - head.length - 4));
  const first = chunks[0];
  const dots = Math.max(2, w - head.length - first.length - 1);
  const lines = [head + '.'.repeat(dots) + ' ' + first];
  for (let i = 1; i < chunks.length; i++) {
    lines.push(' '.repeat(Math.max(0, w - chunks[i].length)) + chunks[i]);
  }
  return lines;
}

/** "Contact -----------------------------------·-" */
export function bar(title, w) {
  const head = title + ' ';
  const n = Math.max(3, w - head.length - 3);
  return head + '-'.repeat(n) + '-·-';
}

/** Account age, standing in for neofetch's uptime line. */
export function since(iso) {
  const a = new Date(iso);
  const b = new Date();
  if (isNaN(a)) return null;
  let y = b.getFullYear() - a.getFullYear();
  let m = b.getMonth() - a.getMonth();
  let d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  const unit = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const parts = [];
  if (y) parts.push(unit(y, 'year', 'years'));
  if (m) parts.push(unit(m, 'month', 'months'));
  parts.push(unit(d, 'day', 'days'));
  return parts.join(', ');
}

const usable = (r) =>
  r.on && String(r.label).trim() !== '' && String(r.value).trim() !== '';

/**
 * Render the panel from rows the user controls. A section with nothing left in
 * it is never opened, so switching rows off cannot leave a stray header behind.
 * @param {string} login
 * @param {{section: string, label: string, value: string, on: boolean}[]} rows
 * @param {number} w  panel width in characters
 */
export function panelLines(login, rows, w) {
  const live = rows.filter(usable);
  const out = [bar(`${login}@github`, w)];

  for (const r of live.filter((x) => x.section === 'main')) {
    out.push(...leader(r.label, String(r.value).replace(/\s+/g, ' ').trim(), w));
  }
  for (const section of SECTIONS) {
    if (section === 'main') continue;
    const list = live.filter((x) => x.section === section);
    if (!list.length) continue;
    out.push('', bar(SECTION_TITLES[section], w));
    for (const r of list) {
      out.push(...leader(r.label, String(r.value).replace(/\s+/g, ' ').trim(), w));
    }
  }
  return out;
}
