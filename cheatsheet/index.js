const debug = require('debug')('cheatsheet:build');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hlShortcut(s) {
  // Tokenize: ' + ', ' / ', '->', '<-' become h-op spans; everything else is plain text
  const OPS = [' + ', ' / ', '->', '<-'];
  let out = '', i = 0;
  while (i < s.length) {
    const hit = OPS.find(op => s.startsWith(op, i));
    if (hit) {
      out += `<span class="h-op">${escHtml(hit)}</span>`;
      i += hit.length;
    } else {
      out += escHtml(s[i++]);
    }
  }
  return out;
}

function hlSig(sig) {
  // Tokenize: ()[]<>, inside [] = h-opt, inside () or <> = h-mand, commas = h-op
  let out = '', buf = '', inParens = false, inOpt = false, inReq = false;
  const flush = () => {
    if (!buf) return;
    const cls = inReq ? 'h-mand' : !inParens ? null : inOpt ? 'h-opt' : 'h-mand';
    out += cls ? `<span class="${cls}">${escHtml(buf)}</span>` : escHtml(buf);
    buf = '';
  };
  for (const ch of sig) {
    if      (ch === '<') { flush(); out += `<span class="h-op">&lt;</span>`; inReq = true; }
    else if (ch === '>') { flush(); out += `<span class="h-op">&gt;</span>`; inReq = false; }
    else if (ch === '(') { flush(); out += `<span class="h-op">(</span>`; inParens = true; }
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
const pico8ShortcutCategories = {};
const apiCategories = {};
const terminalCategories = {};
for (const item of data) {
  if (item.type === 'api') {
    if (!apiCategories[item.category]) apiCategories[item.category] = [];
    apiCategories[item.category].push(item);
  } else if (item.type === 'terminal') {
    const key = item.category.replace('Terminal: ', '');
    if (!terminalCategories[key]) terminalCategories[key] = [];
    terminalCategories[key].push(item);
  } else if (item.category.startsWith('PICO-8:')) {
    const key = item.category.replace('PICO-8: ', '');
    if (!pico8ShortcutCategories[key]) pico8ShortcutCategories[key] = [];
    pico8ShortcutCategories[key].push(item);
  } else {
    if (!shortcutCategories[item.category]) shortcutCategories[item.category] = [];
    shortcutCategories[item.category].push(item);
  }
}

debug('shortcut categories: %o', Object.keys(shortcutCategories));
debug('pico-8 shortcut categories: %o', Object.keys(pico8ShortcutCategories));
debug('api categories: %o', Object.keys(apiCategories));
debug('terminal categories: %o', Object.keys(terminalCategories));

debug('rendering template');
const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf8');
const html = ejs.render(template, { shortcutCategories, pico8ShortcutCategories, apiCategories, terminalCategories, hlShortcut, hlSig });

const outPath = path.join(__dirname, 'cheatsheet.html');
debug('writing %s', outPath);
fs.writeFileSync(outPath, html, 'utf8');

debug('building markdown');
function buildMarkdown() {
  const lines = ['# zerocalc', ''];

  function section(heading, categories, keyField) {
    lines.push(`## ${heading}`, '');
    for (const [cat, items] of Object.entries(categories)) {
      lines.push(`### ${cat.toLowerCase()}`, '');
      for (const item of items) {
        lines.push(`\`${item[keyField]}\` ${item.description}`);
      }
      lines.push('');
    }
  }

  section('keyboard shortcuts', shortcutCategories, 'shortcut');
  section('pico-8 keyboard shortcuts', pico8ShortcutCategories, 'shortcut');
  section('pico-8 api', apiCategories, 'signature');
  section('terminal', terminalCategories, 'signature');

  return lines.join('\n');
}

const mdPath = path.join(__dirname, 'cheatsheet.md');
debug('writing %s', mdPath);
fs.writeFileSync(mdPath, buildMarkdown(), 'utf8');

debug('done — %d shortcuts, %d api entries',
  data.filter(d => d.type === 'shortcut').length,
  data.filter(d => d.type === 'api').length
);
