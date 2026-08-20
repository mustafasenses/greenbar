import { cleanUrl } from './panel.js';

const FENCE = '```';

/** Line below the block, where links are still clickable. */
export function linkLine(p) {
  const parts = [`[@${p.login}](https://github.com/${p.login})`];
  if (p.blog) {
    const u = /^https?:\/\//.test(p.blog) ? p.blog : 'https://' + p.blog;
    parts.push(`[${cleanUrl(p.blog)}](${u})`);
  }
  if (p.twitter_username) {
    parts.push(`[@${p.twitter_username}](https://twitter.com/${p.twitter_username})`);
  }
  return parts.join(' &nbsp;·&nbsp; ');
}

export function buildReadme(block, p, layout) {
  if (layout === 'ascii') return [FENCE, block.join('\n'), FENCE, ''].join('\n');
  return [FENCE, block.join('\n'), FENCE, '', linkLine(p), ''].join('\n');
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
