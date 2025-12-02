import express from "express";
import "dotenv/config";
import OpenAI from "openai";
import electron from "electron";
const { app: electronApp, BrowserWindow } = electron;

const serverApp = express();
serverApp.use(express.json());
serverApp.use(express.static("public"));


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