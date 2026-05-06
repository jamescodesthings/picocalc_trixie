const debug = require('debug')('cheatsheet:build');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hlShortcut(s) {
  return s.split(' + ').map(escHtml).join(' <span class="h-op">+</span> ');
}

function hlSig(sig) {
  let out = '', buf = '', inParens = false, inOpt = false;
  const flush = () => {
    if (!buf) return;
    const cls = !inParens ? null : inOpt ? 'h-opt' : 'h-mand';
    out += cls ? `<span class="${cls}">${escHtml(buf)}</span>` : escHtml(buf);
    buf = '';
  };
  for (const ch of sig) {
    if      (ch === '(') { flush(); out += `<span class="h-op">(</span>`; inParens = true; }
    else if (ch === ')') { flush(); out += `<span class="h-op">)</span>`; inParens = false; }
    else if (ch === '[') { flush(); out += `<span class="h-op">[</span>`; inOpt = true; }
    else if (ch === ']') { flush(); out += `<span class="h-op">]</span>`; inOpt = false; }
    else if (ch === ',') { flush(); out += `<span class="h-op">,</span>`; }
    else                 { buf += ch; }
  }
  flush();
  return out;
}

debug('reading data.json');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

debug('grouping by category');
const shortcutCategories = {};
const apiCategories = {};
for (const item of data) {
  const bucket = item.type === 'api' ? apiCategories : shortcutCategories;
  if (!bucket[item.category]) bucket[item.category] = [];
  bucket[item.category].push(item);
}

debug('shortcut categories: %o', Object.keys(shortcutCategories));
debug('api categories: %o', Object.keys(apiCategories));

debug('rendering template');
const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf8');
const html = ejs.render(template, { shortcutCategories, apiCategories, hlShortcut, hlSig });

const outPath = path.join(__dirname, 'cheatsheet.html');
debug('writing %s', outPath);
fs.writeFileSync(outPath, html, 'utf8');

debug('done — %d shortcuts, %d api entries',
  data.filter(d => d.type === 'shortcut').length,
  data.filter(d => d.type === 'api').length
);
