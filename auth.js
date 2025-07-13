const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database(path.resolve(__dirname, 'db/urls.db'));

exports.handleRegister = (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
        try {
            const { email, password } = JSON.parse(body);
            
            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Email and password are required' }));
            }
            
            const hashed = await bcrypt.hash(password, 10);

            db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashed], function (err) {
                if (err) {
                    console.error('Registration error:', err);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Email already registered' }));
                }

                const token = jwt.sign({ id: this.lastID, email }, process.env.SECRET_KEY, { expiresIn: '1h' });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token }));
            });
        } catch (error) {
            console.error('JSON parsing error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
    });
};

exports.handleLogin = (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
        try {
            const { email, password } = JSON.parse(body);
            
            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Email and password are required' }));
            }

            db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Database error' }));
                }
                
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid email or password' }));
                }

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid credentials' }));
                }

                const token = jwt.sign({ id: user.id, email }, process.env.SECRET_KEY, { expiresIn: '1h' });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token }));
            });
        } catch (error) {
            console.error('JSON parsing error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
    });
};

exports.verifyToken = (req) => {
    const auth = req.headers['authorization'];
    if (!auth) return null;

    const token = auth.split(' ')[1];
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch {
        return null;
    }
};
