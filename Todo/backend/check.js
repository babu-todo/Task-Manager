const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("todo.db");

db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log(rows);
});

db.close();