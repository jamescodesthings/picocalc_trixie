const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const PORT = 8080;
const HOST = '0.0.0.0';
const WATCH_EXTS = new Set(['.js', '.json', '.ejs', '.css']);
const WATCH_DIRS = ['.', 'fonts'];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ttf':  'font/truetype',
  '.md':   'text/plain',
};

function rebuild() {
  process.stdout.write('[dev] rebuilding... ');
  try {
    execSync('DEBUG=cheatsheet:* node index', { stdio: 'inherit', cwd: __dirname });
    console.log('ok');
  } catch {
    console.error('FAILED');
  }
}

rebuild();

// Debounce so rapid saves don't fire multiple rebuilds
let rebuildTimer = null;
function scheduleRebuild(filename) {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    console.log(`[dev] changed: ${filename}`);
    rebuild();
  }, 120);
}

WATCH_DIRS.forEach(dir => {
  const abs = path.join(__dirname, dir);
  if (!fs.existsSync(abs)) return;
  fs.watch(abs, (_, filename) => {
    if (filename && WATCH_EXTS.has(path.extname(filename))) scheduleRebuild(filename);
  });
});

// Static file server
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const filePath = path.join(__dirname, url === '/' ? 'cheatsheet.html' : url);

  // Prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end(); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`not found: ${url}`);
      return;
    }
    const mime = MIME[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[dev] http://localhost:${PORT}`);
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`[dev] http://${net.address}:${PORT}  (network)`);
      }
    }
  }
  console.log('[dev] watching .js .json .ejs .css for changes');
});
