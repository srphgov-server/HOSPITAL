const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const COMPRESSIBLE_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt']);

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Docker & Load Balancer Healthcheck Endpoint
  if (reqPath === '/health' || reqPath === '/healthz' || reqPath === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Sieam Reap Provincial Referral Hospital',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security guard against path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // HTTP Caching & ETag Validation
    const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
    const ifNoneMatch = req.headers['if-none-match'];

    const cacheControl = 'no-cache, must-revalidate';

    if (ifNoneMatch && ifNoneMatch === etag) {
      res.writeHead(304, {
        'ETag': etag,
        'Cache-Control': cacheControl,
        'Vary': 'Accept-Encoding',
        'Access-Control-Allow-Origin': '*'
      });
      res.end();
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Vary': 'Accept-Encoding',
      'ETag': etag,
      'Last-Modified': stats.mtime.toUTCString(),
      'Cache-Control': cacheControl
    };

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const shouldCompress = COMPRESSIBLE_EXTENSIONS.has(ext) && stats.size > 512;

    const fileStream = fs.createReadStream(filePath);

    if (shouldCompress && /\bgzip\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      fileStream.pipe(zlib.createGzip({ level: 6 })).pipe(res);
    } else if (shouldCompress && /\bdeflate\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'deflate';
      res.writeHead(200, headers);
      fileStream.pipe(zlib.createDeflate()).pipe(res);
    } else {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      fileStream.pipe(res);
    }
  });
});

const listener = server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dynamics 365 Healthcare System Live Server running at:`);
  console.log(`>>> http://0.0.0.0:${PORT} (Local: http://localhost:${PORT}) <<<`);
});

// Graceful container shutdown on SIGTERM / SIGINT
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully stopping healthcare server...`);
  listener.close(() => {
    console.log('HTTP server terminated cleanly.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forcing shutdown after 5s timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

