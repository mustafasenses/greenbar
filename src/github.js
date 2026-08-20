const API = 'https://api.github.com';
const HEADERS = { Accept: 'application/vnd.github+json' };

/** Error carrying an i18n key so the UI can phrase it in the current language. */
export class AppError extends Error {
  constructor(key, arg) {
    super(key);
    this.key = key;
    this.arg = arg;
  }
}

export function loadImage(src, cors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new AppError('stImgFail'));
    img.src = src;
  });
}

export async function fetchProfile(login) {
  const r = await fetch(`${API}/users/${encodeURIComponent(login)}`, { headers: HEADERS });
  if (r.status === 404) throw new AppError('stNoUserFound', login);
  if (r.status === 403) throw new AppError('stRate');
  if (!r.ok) throw new AppError('stHttp', r.status);
  return r.json();
}

/**
 * Stars, forks, top languages and last push, from the first page of repos.
 * A separate request, so a failure just leaves those rows out of the panel.
 */
export async function fetchStats(login) {
  try {
    const r = await fetch(
      `${API}/users/${encodeURIComponent(login)}/repos?per_page=100&sort=pushed`,
      { headers: HEADERS },
    );
    if (!r.ok) return null;
    const repos = await r.json();
    if (!Array.isArray(repos) || !repos.length) return null;

    const langs = {};
    let stars = 0;
    let forks = 0;
    let pushed = null;
    for (const x of repos) {
      if (x.fork) continue;
      stars += x.stargazers_count || 0;
      forks += x.forks_count || 0;
      if (x.language) langs[x.language] = (langs[x.language] || 0) + 1;
      if (x.pushed_at && (!pushed || x.pushed_at > pushed)) pushed = x.pushed_at;
    }
    return {
      stars,
      forks,
      langs: Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 4).map((e) => e[0]),
      pushed: pushed ? pushed.slice(0, 10) : null,
    };
  } catch {
    return null;
  }
}
