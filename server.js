import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Gemini AI setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ----------------- Helper function to fetch GIF -----------------
const fetchGif = async (topic) => {
  const limit = 20;
  const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${encodeURIComponent(topic)}&limit=${limit}&rating=g`;
  const giphyRes = await fetch(giphyUrl);
  const giphyData = await giphyRes.json();
  const randomIndex = Math.floor(Math.random() * giphyData.data.length);
  return giphyData.data[randomIndex]?.images.original.url || "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";
};

// ----------------- Helper function to fetch caption + hashtags -----------------
  const fetchCaption = async (topic) => {
    const prompt = `Create a short extreme funny meme caption and 3-5 trending funny social media hashtags for the topic: "${topic}".
  Respond ONLY in JSON format, like:
  {
    "caption": "funny caption here",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }`;

    const aiResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let textResponse = aiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    textResponse = textResponse.replace(/```json\s*([\s\S]*?)```/, "$1").trim();

    let caption = "Here’s your meme!";
    let hashtags = [];
    try {
      const parsed = JSON.parse(textResponse);
      caption = parsed.caption || caption;
      hashtags = parsed.hashtags || [];
    } catch (err) {
      console.error("JSON parse error:", err);
    }

    return { caption, hashtags };
  };

// ----------------- Route 1: GIF + Caption + Hashtags (original) -----------------
app.post("/api/generate-meme", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const gifUrl = await fetchGif(topic);
    const { caption, hashtags } = await fetchCaption(topic);

    res.json({ caption, hashtags, gifUrl });
  } catch (error) {
    console.error("Error generating meme:", error);
    res.status(500).json({ error: "Failed to generate meme" });
  }
});

// ----------------- Route 2: GIF only -----------------
app.post("/api/generate-gif", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const gifUrl = await fetchGif(topic);
    res.json({ gifUrl });
  } catch (error) {
    console.error("Error generating GIF:", error);
    res.status(500).json({ error: "Failed to generate GIF" });
  }
});

// ----------------- Route 3: Caption + Hashtags only -----------------
app.post("/api/generate-caption", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const { caption, hashtags } = await fetchCaption(topic);
    res.json({ caption, hashtags });
  } catch (error) {
    console.error("Error generating caption:", error);
    res.status(500).json({ error: "Failed to generate caption" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
