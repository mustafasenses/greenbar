// Neofetch-style detail panel.
//
// Labels are fixed English on purpose: the generated README lives on a public
// GitHub profile, so the interface language must not leak into it.

const L = {
  name: 'Name',
  bio: 'Bio',
  location: 'Location',
  company: 'Company',
  uptime: 'Uptime',
  langs: 'Languages',
  push: 'Last push',
  status: 'Status',
  hire: 'Open to work',
  contact: 'Contact',
  website: 'Website',
  twitter: 'Twitter',
  email: 'Email',
  stats: 'GitHub Stats',
  repos: 'Repos',
  gists: 'Gists',
  stars: 'Stars',
  forks: 'Forks',
  followers: 'Followers',
  following: 'Following',
};

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

/**
 * Panel lines. Missing fields are skipped and a section with nothing in it is
 * never opened.
 * @param {object} p       GitHub user object
 * @param {number} w       panel width in characters
 * @param {object|null} st repo statistics
 */
export function panelLines(p, w, st) {
  const out = [];
  const push = (label, value) => {
    if (value === null || value === undefined || String(value).trim() === '') return;
    out.push(...leader(label, String(value).replace(/\s+/g, ' ').trim(), w));
  };

  out.push(bar(`${p.login}@github`, w));
  push(L.name, p.name);
  push(L.bio, p.bio);
  push(L.location, p.location);
  push(L.company, p.company ? String(p.company).replace(/^@/, '') : null);
  if (p.created_at) push(L.uptime, since(p.created_at));
  if (st?.langs?.length) push(L.langs, st.langs.join(', '));
  if (st?.pushed) push(L.push, st.pushed);
  if (p.hireable) push(L.status, L.hire);

  const contact = [];
  if (p.blog) contact.push([L.website, cleanUrl(p.blog)]);
  if (p.twitter_username) contact.push([L.twitter, '@' + p.twitter_username]);
  if (p.email) contact.push([L.email, p.email]);
  if (contact.length) {
    out.push('', bar(L.contact, w));
    for (const [k, v] of contact) push(k, v);
  }

  if (typeof p.public_repos === 'number') {
    out.push('', bar(L.stats, w));
    push(L.repos, p.public_repos + (p.public_gists ? ` | ${L.gists}: ${p.public_gists}` : ''));
    if (st?.stars != null) push(L.stars, st.stars + (st.forks ? ` | ${L.forks}: ${st.forks}` : ''));
    push(L.followers, `${p.followers} | ${L.following}: ${p.following}`);
  }
  return out;
}
