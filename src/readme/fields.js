import { cleanUrl, since } from './panel.js';

/**
 * Turn a GitHub profile into the editable row list behind the panel. Only rows
 * with something in them are produced; the user decides which ones survive.
 */
export function deriveFields(p, st) {
  const rows = [];
  const add = (id, section, label, value) => {
    if (value === null || value === undefined || String(value).trim() === '') return;
    rows.push({
      id,
      section,
      label,
      value: String(value).replace(/\s+/g, ' ').trim(),
      on: true,
      custom: false,
    });
  };

  add('name', 'main', 'Name', p.name);
  add('bio', 'main', 'Bio', p.bio);
  add('location', 'main', 'Location', p.location);
  add('company', 'main', 'Company', p.company ? String(p.company).replace(/^@/, '') : null);
  if (p.created_at) add('uptime', 'main', 'Uptime', since(p.created_at));
  if (st?.langs?.length) add('langs', 'main', 'Languages', st.langs.join(', '));
  if (st?.pushed) add('push', 'main', 'Last push', st.pushed);
  if (p.hireable) add('status', 'main', 'Status', 'Open to work');

  if (p.blog) add('website', 'contact', 'Website', cleanUrl(p.blog));
  if (p.twitter_username) add('twitter', 'contact', 'Twitter', '@' + p.twitter_username);
  if (p.email) add('email', 'contact', 'Email', p.email);

  if (typeof p.public_repos === 'number') {
    add('repos', 'stats', 'Repos', p.public_repos + (p.public_gists ? ` | Gists: ${p.public_gists}` : ''));
    if (st?.stars != null) add('stars', 'stats', 'Stars', st.stars + (st.forks ? ` | Forks: ${st.forks}` : ''));
    add('followers', 'stats', 'Followers', `${p.followers} | Following: ${p.following}`);
  }
  return rows;
}

let seq = 0;
export const customField = () => ({
  id: `custom-${++seq}`,
  section: 'main',
  label: '',
  value: '',
  on: true,
  custom: true,
});

/**
 * Fetching the same person again should not throw away their edits, so carry
 * over on/off state and any rows they added by hand.
 */
export function mergeFields(fresh, previous) {
  const byId = new Map(previous.map((f) => [f.id, f]));
  for (const f of fresh) {
    const old = byId.get(f.id);
    if (old) {
      f.on = old.on;
      f.label = old.label;
      // A value the user rewrote is kept; otherwise the fresh one wins.
      if (old.edited) { f.value = old.value; f.edited = true; }
    }
  }
  return [...fresh, ...previous.filter((f) => f.custom)];
}
