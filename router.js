const url = require('url');
const fs = require('fs');
const shortener = require('./shortener');
const auth = require('./auth');

const sendFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading file');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;
    if (pathname === '/') {
        return sendFile(res, './public/index.html', 'text/html');
    }
    if (pathname === '/script.js') {
        return sendFile(res, './public/script.js', 'text/javascript');
    }
    if (pathname === '/styles.css') {
        return sendFile(res, './public/styles.css', 'text/css');
    }
    if (req.method === 'POST' && pathname === '/register') {
        return auth.handleRegister(req, res);
    }
    if (req.method === 'POST' && pathname === '/login') {
        return auth.handleLogin(req, res);
    }
    if (req.method === 'POST' && pathname === '/shorten') {
        return shortener.handleShorten(req, res);
    }
    if (req.method === 'GET' && pathname === '/user-urls') {
        return shortener.handleUserUrls(req, res);
    }
    if (req.method === 'GET' && pathname === '/my-urls') {
        return shortener.handleUserUrls(req, res);
    }
    if (req.method === 'POST' && pathname === '/shorten') {
        return shortener.handleShorten(req, res);
    }
    if (pathname.startsWith('/r/')) {
        const code = pathname.split('/r/')[1];
        return shortener.handleRedirect(req, res, code);
    }

    res.writeHead(404);
    res.end('Not Found');
};
