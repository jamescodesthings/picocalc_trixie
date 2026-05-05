const debug = require('debug')('cheatsheet:build');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

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
const html = ejs.render(template, { shortcutCategories, apiCategories });

const outPath = path.join(__dirname, 'cheatsheet.html');
debug('writing %s', outPath);
fs.writeFileSync(outPath, html, 'utf8');

debug('done — %d shortcuts, %d api entries',
  data.filter(d => d.type === 'shortcut').length,
  data.filter(d => d.type === 'api').length
);
