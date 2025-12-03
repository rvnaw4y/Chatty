import express from "express";
import "dotenv/config";
import OpenAI from "openai";
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");

const serverApp = express();
serverApp.use(express.json());
serverApp.use(express.static("public"));

// database
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

// SIGNUP endpoint
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

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

// LOGIN endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
        if (!row) return res.send("User not found");

        const match = await bcrypt.compare(password, row.password);
        if (!match) return res.send("Invalid password");

        res.send("Login successful!");
    });
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.CHATBOTTOKEN,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
    "X-Title": process.env.YOUR_SITE_NAME || "Femboy AI",
  },
});

let deepseekmodel = [{
    role: "system",
    content:
    "Maintain a normal stability with the user and help all the way." 
}]
let conversationModel1 = [
  {
    role: "system", 
    content: "[INFO: Name: Bobby Personality: Helpful and Friendly]You help people and you are a friendly bot.",
  },
];

// Deepseek
serverApp.post("/api/chat/deepseek", async (req, res) => {
  const { message, reset } = req.body;

  try {
    if (reset) {
      deepseekmodel = [deepseekmodel[0]];
      return res.json({ reply: "Memory cleared!" });
    }

    deepseekmodel.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: deepseekmodel,
    });

    const reply = completion.choices[0].message.content;
    deepseekmodel.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Error from API:", err);
    res.status(500).json({ reply: "Error contacting AI :(" });
  }
});
// --- Model1 route ---
serverApp.post("/api/chat/model1", async (req, res) => {
  const { message, reset } = req.body;

  try {
    if (reset) {
      conversationModel1 = [conversationModel1[0]];
      return res.json({ reply: "Memory cleared!" });
    }

    conversationModel1.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-nano-9b-v2:free",
      messages: conversationModel1,
    });

    const reply = completion.choices[0].message.content;
    conversationModel1.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Error from API:", err);
    res.status(500).json({ reply: "Error contacting AI :(" });
  }
});

// --- Start server and Electron ---
const PORT = process.env.PORT || 3000;
serverApp.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});