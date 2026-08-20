import './styles.css';
import { T, DEFAULT_LANG } from './i18n.js';
import { AppError, fetchProfile, fetchStats, loadImage } from './github.js';
import { toAscii, ramp, resetRamps, CELL_ASPECT } from './ascii/index.js';
import { buildBlock } from './readme/compose.js';
import { buildReadme, mdToHtml, fencedBody, afterFence } from './readme/markdown.js';

const LANG_KEY = 'greenbar.lang';
const $ = (id) => document.getElementById(id);

const els = {
  username: $('username'),
  fetchBtn: $('fetchBtn'),
  status: $('status'),
  width: $('width'),
  widthVal: $('widthVal'),
  widthHint: $('widthHint'),
  contrast: $('contrast'),
  contrastVal: $('contrastVal'),
  layoutHint: $('layoutHint'),
  cropHint: $('cropHint'),
  toneHint: $('toneHint'),
  styleHint: $('styleHint'),
  file: $('file'),
  preview: $('preview'),
  output: $('output'),
  copyBtn: $('copyBtn'),
  dlBtn: $('dlBtn'),
  viewPrint: $('viewPrint'),
  viewGh: $('viewGh'),
  ghCard: $('ghCard'),
  ghCode: $('ghCode'),
  ghFoot: $('ghFoot'),
  previewNote: $('previewNote'),
};

const state = {
  layout: 'side',
  theme: 'dark',
  crop: 'auto',
  tone: 'auto',
  style: 'classic',
  view: 'print',
  lang: DEFAULT_LANG,
};

let profile = null;
let sourceImg = null;
let stats = null;
let lastStatus = null;

const t = () => T[state.lang];

function setStatus(key, tone, arg) {
  lastStatus = key ? { key, tone, arg } : null;
  const v = key ? t()[key] : '';
  els.status.textContent = typeof v === 'function' ? v(arg) : v || '';
  els.status.style.color =
    tone === 'error' ? '#E0796B' : tone === 'ok' ? '#9FD08A' : '#B9C2AE';
}

function asciiOptions() {
  return {
    cols: +els.width.value,
    dark: state.theme === 'dark',
    crop: state.crop,
    tone: state.tone,
    style: state.style,
    contrast: +els.contrast.value,
  };
}

function paintPreview(block, md, dark) {
  els.preview.textContent = block.join('\n');
  els.preview.classList.toggle('printout-dark', dark);
  els.preview.classList.remove('feeding');
  void els.preview.offsetWidth;
  els.preview.classList.add('feeding');

  els.ghCode.textContent = fencedBody(md) || block.join('\n');
  els.ghFoot.innerHTML = mdToHtml(afterFence(md));
  els.ghCard.className = 'gh ' + (dark ? 'gh-dark' : 'gh-light');
}

function render() {
  if (!sourceImg || !profile) return;
  const dark = state.theme === 'dark';
  let art;
  try {
    art = toAscii(sourceImg, asciiOptions());
  } catch {
    setStatus('stCors', 'error');
    return;
  }
  const block = buildBlock(art, profile, state.layout, stats);
  const md = buildReadme(block, profile, state.layout);
  els.output.value = md;
  paintPreview(block, md, dark);
}

function setView(view) {
  state.view = view;
  els.viewPrint.classList.toggle('hidden', view !== 'print');
  els.viewGh.classList.toggle('hidden', view !== 'gh');
  for (const tab of document.querySelectorAll('.tab')) {
    tab.setAttribute('aria-selected', String(tab.dataset.view === view));
  }
  els.previewNote.textContent = view === 'print' ? t().notePrint : t().noteGh;
}

function syncHints() {
  // Side by side has to leave room for the panel, so the slider ceiling moves.
  const max = state.layout === 'side' ? 66 : 120;
  els.width.max = String(max);
  if (+els.width.value > max) els.width.value = String(max);

  const w = +els.width.value;
  els.widthVal.textContent = w;
  els.contrastVal.textContent = els.contrast.value;

  els.widthHint.textContent =
    state.layout === 'side' && w > 60 ? t().hNarrow
      : state.layout !== 'side' && w > 80 ? t().hWide
        : '';

  els.layoutHint.textContent =
    state.layout === 'side' ? t().hSide : state.layout === 'stack' ? t().hStack : t().hAscii;

  els.cropHint.textContent =
    state.crop === 'auto' ? t().hAuto : state.crop === 'circle' ? t().hCircle : t().hSquare;

  els.toneHint.textContent =
    state.tone === 'auto' ? t().hTAuto : state.tone === 'true' ? t().hTTrue : t().hTInvert;

  els.styleHint.textContent =
    state.style === 'blocks'
      ? '█▓▒░ ▀▄'
      : ramp(state.style, CELL_ASPECT).slice().reverse().map((o) => o.ch).join('');
}

function applyLang() {
  const d = t();
  document.documentElement.lang = d.htmlLang;
  document.title = d.title;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = d[el.dataset.i18n];
  }
  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = d[el.dataset.i18nHtml];
  }
  els.output.placeholder = d.outputPh;
  if (!els.output.value) els.preview.textContent = d.previewEmpty;
  for (const b of document.querySelectorAll('.lang')) {
    b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang));
  }
  if (lastStatus) setStatus(lastStatus.key, lastStatus.tone, lastStatus.arg);
  setView(state.view);
  syncHints();
}

async function run() {
  const login = els.username.value
    .trim()
    .replace(/^@/, '')
    .replace(/^.*github\.com\//, '');
  if (!login) {
    setStatus('stNoUser', 'error');
    els.username.focus();
    return;
  }

  els.fetchBtn.disabled = true;
  setStatus('stFetching');
  try {
    profile = await fetchProfile(login);
    setStatus('stAvatar');
    const [img, st] = await Promise.all([
      loadImage(profile.avatar_url + '&s=512', true),
      fetchStats(profile.login),
    ]);
    sourceImg = img;
    stats = st;
    render();
    setStatus('stPrinted', 'ok', profile.name || profile.login);
  } catch (e) {
    setStatus(e instanceof AppError ? e.key : 'stImgFail', 'error', e?.arg);
  } finally {
    els.fetchBtn.disabled = false;
  }
}

els.fetchBtn.addEventListener('click', run);
els.username.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') run();
});

for (const input of [els.width, els.contrast]) {
  input.addEventListener('input', () => {
    syncHints();
    render();
  });
}

for (const btn of document.querySelectorAll('.chip')) {
  btn.addEventListener('click', () => {
    const { opt, val } = btn.dataset;
    state[opt] = val;
    for (const b of document.querySelectorAll(`.chip[data-opt="${opt}"]`)) {
      b.setAttribute('aria-pressed', String(b === btn));
    }
    syncHints();
    render();
  });
}

for (const btn of document.querySelectorAll('.lang')) {
  btn.addEventListener('click', () => {
    state.lang = btn.dataset.lang;
    try {
      localStorage.setItem(LANG_KEY, state.lang);
    } catch {
      // private mode; language just will not persist
    }
    applyLang();
  });
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
}

els.file.addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  try {
    sourceImg = await loadImage(url, false);
    if (!profile) {
      profile = { login: els.username.value.trim() || 'user' };
      stats = null;
    }
    render();
    setStatus('stPrinted', 'ok', f.name);
  } catch {
    setStatus('stFileFail', 'error');
  } finally {
    URL.revokeObjectURL(url);
  }
});

els.copyBtn.addEventListener('click', async () => {
  if (!els.output.value) {
    setStatus('stNeedReadme', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(els.output.value);
    els.copyBtn.textContent = t().copied;
    setTimeout(() => {
      els.copyBtn.textContent = t().copy;
    }, 1600);
  } catch {
    els.output.select();
    setStatus('stCopyFail', 'error');
  }
});

els.dlBtn.addEventListener('click', () => {
  if (!els.output.value) {
    setStatus('stNeedReadme', 'error');
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([els.output.value], { type: 'text/markdown;charset=utf-8' }));
  a.download = 'README.md';
  a.click();
  URL.revokeObjectURL(a.href);
});

try {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && T[saved]) state.lang = saved;
} catch {
  // ignore
}

applyLang();

// Glyph densities measured before the webfont lands describe the fallback font.
document.fonts?.ready.then(() => {
  resetRamps();
  syncHints();
  render();
});
