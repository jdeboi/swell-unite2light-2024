import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server as SocketIo } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import OpenAI from "openai";
import Submission from "./models/Submission.js";
import { generateRandomSection, replaceImagePart } from "./utils/openai.js";

// Configure __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new SocketIo(server);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the /api/graph route using the router
app.get("/api/graph", async (req, res) => {
  try {
    // Retrieve 10 text entries from the database
    const submissions = await Submission.find()
      .limit(10)
      .sort({ createdAt: -1 });

    if (submissions.length < 10) {
      return res.status(400).send("Not enough text entries to generate graph");
    }

    const contentArray = submissions.map((submission) => submission.content);

    // Get the graph from ChatGPT
    const graph = await getChatGPTGraph(contentArray);

    if (graph) {
      res.json({ graph });
    } else {
      res.status(500).send("Failed to generate graph");
    }
  } catch (err) {
    console.error("Error generating graph:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Define the /api/allhope route
app.get("/api/allhope", async (req, res) => {
  try {
    // get 50 most recently created texts
    const submissions = await Submission.find()
      .limit(50)
      .sort({ createdAt: -1 });
    const content = submissions
      .map((submission) => submission.content)
      .join("\n");
    const score = await getChatGPTScore(content);

    res.json({ score });
  } catch (err) {
    console.error("Error calculating hopefulness:", err);
    res.status(500).send(err.error.message || "Internal server error");
  }
});

app.post("/api/submitflower", async (req, res) => {
  try {
    const content = req.body.content; // Correctly fetch content from req.body
    const score = 0; // Placeholder for future use of getChatGPTScore(req.body.content);
    // const imgUrl = await generateFlowerImage(content);
    const imgBase64 = await generateFlowerImageAsBase64(content);

    const submission = new Submission({
      content: content,
      score,
      imgBase64,
      section: { x: 0, y: 0, width: 0, height: 0 },
    });

    await submission.save();

    await removeOldImages();

    // Emit a 'newFlower' event to all connected clients, passing both content and image URL
    io.emit("newFlower", { imgBase64, content });

    res.status(201).send(submission);
  } catch (err) {
    console.error("Error saving text:", err);
    res.status(500).send("Internal Server Error");
  }
});

// remove old images
const removeOldImages = async () => {
  // Check the count of submissions with images
  const imageCount = await Submission.countDocuments({
    imgBase64: { $ne: null },
  });

  // If there are 50 or more images, delete the oldest one
  if (imageCount >= 30) {
    const oldestImage = await Submission.findOne({
      imgBase64: { $ne: null },
    }).sort({ createdAt: 1 });
    if (oldestImage) {
      oldestImage.imgBase64 = null; // Remove the image data
      await oldestImage.save(); // Update the document
    }
  }
};

app.post("/api/submit", async (req, res) => {
  try {
    const content = req.body.content; // Correctly fetch content from req.body
    console.log("content submitted", content);

    // Debug log to ensure content is being passed
    if (!content) {
      console.log("no content...", content);
      return res.status(400).send("No content provided in the request body.");
    }

    // Path to the image you want to modify
    const imagePath = path.join(__dirname, "public", "dream.png");
    const section = generateRandomSection(512, 512);

    // Replace part of the image
    // const newImageUrl = await replaceImagePart(imagePath, content, section);
    // io.emit("dreamUpdated", { txt: content, url: newImageUrl });

    const score = 0; // Placeholder for future use of getChatGPTScore(req.body.content);
    const imgBase64 = await replaceImagePart(imagePath, content, section);
    const submission = new Submission({
      content: content,
      score,
      imgBase64,
      section,
    });

    await submission.save();
    await removeOldImages();

    io.emit("dreamUpdated", { content, imgBase64, section });

    res.status(201).send(submission);
  } catch (err) {
    console.error("Error saving text:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Define the /api/generateFlowerImage route
app.post("/api/generateFlowerImage", async (req, res) => {
  try {
    const description = req.body.description;

    if (!description) {
      return res.status(400).send("Description is required");
    }

    const imageUrl = await generateFlowerImage(description);

    // Return the URL of the generated image
    res.json({ imageUrl });
  } catch (err) {
    console.error("Error generating flower image:", err);
    res.status(500).send(err.message || "Internal Server Error");
  }
});

// Define the /api/getRecentFlowers route to fetch the last 10 flower submissions
app.get("/api/getRecentFlowers", async (req, res) => {
  try {
    const numPods = parseInt(req.query.numPods) || 10;
    // Fetch the most recent flowers from the database, limited by numPods
    const flowers = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(numPods);
    res.json(flowers);
  } catch (err) {
    console.error("Error fetching recent flowers:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/getaveragehope", async (req, res) => {
  try {
    // Get all text entries from the database
    const texts = await Submission.find();

    // Filter out texts that do not have a valid score
    const validScores = texts
      .map((text) => parseFloat(text.score)) // Attempt to parse score as a number
      .filter((score) => !isNaN(score)); // Filter out invalid scores

    // Calculate the total score
    const totalScore = validScores.reduce((sum, score) => sum + score, 0);

    // Calculate the average score
    const averageScore =
      validScores.length > 0 ? totalScore / validScores.length : 0;

    // Return the average score as a JSON response
    res.json({ averageScore });
  } catch (err) {
    console.error("Error calculating average hopefulness score:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/visuals", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "visuals/visuals.html"));
});

app.get("/pool", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pool/index.html"));
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("submit", () => {
    console.log("text submitted");
    io.emit("submit");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
