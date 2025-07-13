const fs = require('fs');
const DB_PATH = './db/urls.json';
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'db/urls.db'));
const dotenv = require('dotenv').config();
const { verifyToken } = require('./auth');

if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]');

// const readUrls = async () => {
//     console.log(JSON.parse(fs.readFileSync(DB_PATH)));
//     return await JSON.parse(fs.readFileSync(DB_PATH));
// }

// const writeUrls = (data) => {
//     fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
// }

const randomStringGenerator = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

exports.handleShorten = (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
        try {
            const { url } = JSON.parse(body);

            // check if url already exists
            const existingUrl = await new Promise((resolve, reject) => {
                const query = `SELECT code FROM urls WHERE url = ?`;
                db.get(query, [url], (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? row.code : null);
                });
            });
            if (existingUrl) {
                const shortUrl = `http://localhost:${process.env.PORT}/r/${existingUrl}`;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ shortUrl }));
            }

            const user = verifyToken(req);
            console.log(user);
            const userId = user ? user.id : null;
            const code = randomStringGenerator(10);

            db.run(`INSERT INTO urls (url, code, user_id) VALUES (?, ?, ?)`, [url, code, userId], function (err) {
                if (err) {
                    console.error('Database error:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Error saving URL' }));
                }

                const shortUrl = `http://localhost:${process.env.PORT || 3000}/r/${code}`;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ shortUrl }));
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format' }));
        }
    });
};

exports.handleUserUrls = (req, res) => {
    const user = verifyToken(req);
    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    db.all(`SELECT * FROM urls WHERE user_id = ?`, [user.id], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Error fetching URLs' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
    });
};

exports.handleRedirect = (req, res, code) => {
    const query = `SELECT url FROM urls WHERE code = ?`;

    db.get(query, [code], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Error accessing database' }));
        }

        if (!row) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Short URL not found' }));
        }

        res.writeHead(302, { Location: row.url });
        res.end();
    });
};
