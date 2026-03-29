const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// SQLite Database
const db = new sqlite3.Database("todo.db", (err) => {
    if (err) {
        console.log("Database Error:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// USERS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)
`);

// TASK TABLE
db.run(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    task TEXT,
    priority TEXT,
    due_date TEXT,
    status TEXT
)
`);

// Default Route → Login Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// REGISTER
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    db.run(
        "INSERT INTO users(username,password) VALUES(?,?)",
        [username, password],
        function(err) {
            if (err) {
                res.json({
                    success: false,
                    message: "User already exists"
                });
            } else {
                res.json({
                    success: true
                });
            }
        }
    );
});

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, row) => {
            if (row) {
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        }
    );
});

// GET TASKS
app.get("/tasks/:user", (req, res) => {
    db.all(
        "SELECT * FROM tasks WHERE user=?",
        [req.params.user],
        (err, rows) => {
            res.json(rows);
        }
    );
});

// ADD TASK
app.post("/tasks", (req, res) => {
    const { user, task, priority, due_date } = req.body;

    db.run(
        "INSERT INTO tasks(user,task,priority,due_date,status) VALUES(?,?,?,?,?)",
        [user, task, priority, due_date, "Pending"],
        () => {
            res.json({
                success: true
            });
        }
    );
});

// COMPLETE TASK
app.put("/tasks/:id", (req, res) => {
    db.run(
        "UPDATE tasks SET status='Completed' WHERE id=?",
        [req.params.id],
        () => {
            res.json({
                success: true
            });
        }
    );
});

// DELETE TASK
app.delete("/tasks/:id", (req, res) => {
    db.run(
        "DELETE FROM tasks WHERE id=?",
        [req.params.id],
        () => {
            res.json({
                success: true
            });
        }
    );
});

// Start Server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});