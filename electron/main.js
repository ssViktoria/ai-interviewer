const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Disable Vulkan on Linux to avoid Wayland compatibility issues
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-features', 'Vulkan');
}

// Перевіряємо, чи запущено в режимі розробки
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let server = null;

// MIME типи для роздачі статичних файлів у production
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.map': 'application/json; charset=utf-8',
};

function serveStatic(distDir, req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    try {
        const url = new URL(req.url, 'http://127.0.0.1');
        const pathname = decodeURIComponent(url.pathname);
        const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
        let targetPath = path.join(distDir, safePath);

        // Захист від directory traversal за межі distDir
        if (!targetPath.startsWith(distDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        let stat = null;
        try {
            stat = fs.statSync(targetPath);
            if (stat.isDirectory()) {
                const indexPath = path.join(targetPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    targetPath = indexPath;
                    stat = fs.statSync(targetPath);
                }
            }
        } catch {
            stat = null;
        }

        // Якщо файл не знайдено і немає розширення, перевіряємо targetPath + '.html' (clean URLs)
        if ((!stat || !stat.isFile()) && !path.extname(targetPath)) {
            const htmlCandidate = targetPath + '.html';
            if (fs.existsSync(htmlCandidate)) {
                try {
                    const htmlStat = fs.statSync(htmlCandidate);
                    if (htmlStat.isFile()) {
                        targetPath = htmlCandidate;
                        stat = htmlStat;
                    }
                } catch {
                    // ігноруємо помилку читання stat
                }
            }
        }

        // SPA fallback: якщо це не статичний ассет (js, css, png тощо), повертаємо index.html
        if (!stat || !stat.isFile()) {
            const ext = path.extname(pathname);
            if (ext && ext !== '.html') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }

            targetPath = path.join(distDir, 'index.html');
            try {
                stat = fs.statSync(targetPath);
            } catch {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('index.html not found');
                return;
            }
        }

        const ext = path.extname(targetPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size,
        });

        if (req.method === 'HEAD') {
            res.end();
            return;
        }

        const stream = fs.createReadStream(targetPath);
        stream.on('error', () => {
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
            }
            res.end();
        });
        stream.pipe(res);
    } catch (err) {
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end();
    }
}

function createWindow(urlToLoad) {
    mainWindow = new BrowserWindow({
        width: 480,               // Зручна стартова ширина (схожа на мобільний/планшет)
        height: 850,              // Висота вікна
        minWidth: 400,
        minHeight: 600,
        title: 'AI Mock Interviewer',
        backgroundColor: '#0f172a', // slate-900 (фон під стиль додатку)
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,    // Приховати стандартне верхнє меню вікна
    });

    mainWindow.loadURL(urlToLoad);

    // Зовнішні посилання відкриваємо у стандартному браузері ОС, а не у вікні додатку
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    if (isDev) {
        // У режимі розробки підключаємося до локального Metro сервера Expo (з Fast Refresh)
        createWindow('http://localhost:8081');
    } else {
        // У production режимі запускаємо легкий внутрішній HTTP сервер для файлів з папки dist
        // Це вирішує проблему абсолютних шляхів "/_expo/..." у статичному бандлі без зовнішніх залежностей
        const distPath = path.join(__dirname, '../dist');
        server = http.createServer((request, response) => {
            serveStatic(distPath, request, response);
        });

        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            createWindow(`http://127.0.0.1:${port}`);
        });
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (isDev) {
                createWindow('http://localhost:8081');
            } else if (server) {
                const port = server.address().port;
                createWindow(`http://127.0.0.1:${port}`);
            }
        }
    });
});

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
