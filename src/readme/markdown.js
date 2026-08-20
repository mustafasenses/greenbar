import { cleanUrl } from './panel.js';

const FENCE = '```';

const liveRow = (rows, id) => {
  const r = rows.find((x) => x.id === id && x.on);
  const v = r ? String(r.value).trim() : '';
  return v || null;
};

/**
 * Line below the block, where links are still clickable. It follows the row
 * editor: a detail switched off up in the panel must not reappear down here.
 */
export function linkLine(p, rows = []) {
  const parts = [`[@${p.login}](https://github.com/${p.login})`];

  const site = liveRow(rows, 'website');
  if (site && /^[^\s]+\.[^\s]+$/.test(cleanUrl(site))) {
    const u = /^https?:\/\//.test(site) ? site : 'https://' + site;
    parts.push(`[${cleanUrl(site)}](${u})`);
  }

  const twitter = liveRow(rows, 'twitter');
  if (twitter && /^@?[A-Za-z0-9_]{1,15}$/.test(twitter)) {
    const handle = twitter.replace(/^@/, '');
    parts.push(`[@${handle}](https://twitter.com/${handle})`);
  }

  return parts.join(' &nbsp;·&nbsp; ');
}

export function buildReadme(block, p, layout, rows = []) {
  if (layout === 'ascii') return [FENCE, block.join('\n'), FENCE, ''].join('\n');
  return [FENCE, block.join('\n'), FENCE, '', linkLine(p, rows), ''].join('\n');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Covers only the markdown this app emits: headings, paragraphs, links. */
export function mdToHtml(md) {
  return md
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '';
      const heading = /^###\s+/.test(line);
      let h = esc(heading ? line.replace(/^###\s+/, '') : line);
      h = h.replace(/&amp;nbsp;/g, '&nbsp;');
      h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, u) =>
        /^https?:\/\//i.test(u)
          ? `<a href="${u.replace(/"/g, '&quot;')}" target="_blank" rel="nofollow noopener">${txt}</a>`
          : txt,
      );
      return heading ? `<h3>${h}</h3>` : `<p>${h}</p>`;
    })
    .join('');
}

export function fencedBody(md) {
  const m = md.match(/^```\n([\s\S]*?)\n```/);
  return m ? m[1] : '';
}

export function afterFence(md) {
  return md.replace(/^```\n[\s\S]*?\n```\n?/, '');
}
