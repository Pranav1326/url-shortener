const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/urls.db');

db.all("SELECT * FROM urls", (err, rows) => {
    console.log(rows);
});

db.all("SELECT * FROM users", (err, rows) => {
    console.log(rows);
});

db.close();