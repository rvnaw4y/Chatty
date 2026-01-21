import express from "express";
import "dotenv/config";
import OpenAI from "openai";
import sqlite3pkg from "sqlite3";
import bcrypt from "bcrypt";
import session from "express-session";

const sqlite3 = sqlite3pkg.verbose();
const serverApp = express();

// ----------------------
// MIDDLEWARE
// ----------------------
serverApp.use(express.urlencoded({ extended: true }));
serverApp.use(express.json());
serverApp.use(express.static("public"));

// Sessions
serverApp.use(
    session({
        secret: "chattyisdabest1234",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Paths
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// LOGIN PROTECTION
// ----------------------
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    next();
}

// ----------------------
// DATABASE SETUP
// ----------------------
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) console.log(err);
    console.log("Connected to SQLite DB");
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);

// ----------------------
// ROUTES
// ----------------------

// Home
serverApp.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat (PROTECTED)
serverApp.get("/chat", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Signup
serverApp.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.send("Missing username or password");

    const hashed = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashed],
        function (err) {
            if (err) return res.send("Username already taken");
            res.send("Signup successful! <a href='/login.html'>Login</a>");
        }
    );
});

// Login
serverApp.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, row) => {
            if (!row) return res.send("User not found");

            const match = await bcrypt.compare(password, row.password);
            if (!match) return res.send("Invalid password");

            req.session.user = { id: row.id, username: row.username };
            res.redirect("/chat");
        }
    );
});

// ----------------------
// OPENAI ROUTES
// ----------------------
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.CHATBOTTOKEN,
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Chatty",
    },
});

// Per-model memory
let chatMemory = {
    deepseek: [],
    grok: [],
    model1: [],
};

// Deepseek
serverApp.post("/api/chat/deepseek", async (req, res) => {
    const { message, reset } = req.body;

    try {
        if (reset) {
            chatMemory.deepseek = [];
            return res.json({ reply: "Memory cleared!" });
        }

        chatMemory.deepseek.push({ role: "user", content: message });

        const completion = await openai.chat.completions.create({
            model: "tngtech/deepseek-r1t2-chimera:free",
            messages: chatMemory.deepseek,
        });

        const reply = completion.choices[0].message.content;
        chatMemory.deepseek.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ reply: "Error contacting AI :(" });
    }
});

// Grok
serverApp.post("/api/chat/grok", async (req, res) => {
    const { message, reset } = req.body;

    try {
        if (reset) {
            chatMemory.grok = [];
            return res.json({ reply: "Memory cleared!" });
        }

        chatMemory.grok.push({ role: "user", content: message });

        const completion = await openai.chat.completions.create({
            model: "x-ai/grok-code-fast-1",
            messages: chatMemory.grok,
        });

        const reply = completion.choices[0].message.content;
        chatMemory.grok.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ reply: "Error contacting AI :(" });
    }
});

// Model1
serverApp.post("/api/chat/model1", async (req, res) => {
    const { message, reset } = req.body;

    try {
        if (reset) {
            chatMemory.model1 = [];
            return res.json({ reply: "Memory cleared!" });
        }

        chatMemory.model1.push({ role: "user", content: message });

        const completion = await openai.chat.completions.create({
            model: "nvidia/nemotron-nano-12b-v2-vl:free",
            messages: chatMemory.model1,
        });

        const reply =
            completion?.choices?.[0]?.message?.content ||
            "AI did not return a response.";

        chatMemory.model1.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ reply: "Error contacting AI :(" });
    }
});

// ----------------------
// WILDCARD ROUTE (MOVED TO END)
// ----------------------
serverApp.get("/:page", (req, res, next) => {
    let page = req.params.page;
    let filePath = path.join(__dirname, "public", `${page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) next();
    });
});

// ----------------------
// SERVER START
// ----------------------
const PORT = process.env.PORT || 3000;
serverApp.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
