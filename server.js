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
import NewSubmission from "./models/NewSubmission.js";
import {
  getChatGPTResponse,
  getChatGPTCollectiveResponse,
} from "./utils/openai.js";

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
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/submit", async (req, res) => {
  try {
    const content = req.body.content; // Correctly fetch content from req.body
    console.log("content submitted", content);

    // Debug log to ensure content is being passed
    if (!content) {
      console.log("no content...", content);
      return res.status(400).send("No content provided in the request body.");
    }

    io.emit("startProcessing");
    console.log("processing text");
    const GPTData = await getChatGPTResponse(req.body.content);
    if (GPTData == null || !GPTData.text) {
      io.emit("submissionError");
      console.error("null");
      res.status(500).send("Internal Server Error");
    }

    const submission = new NewSubmission({
      text: GPTData.text,
      disturbance: GPTData.disturbance,
      waveSpeed: GPTData.waveSpeed,
      color1: GPTData.colors[0],
      color2: GPTData.colors[1],
      color3: GPTData.colors[2],
      explanation: GPTData.explanation,
    });
    // await submission.save();

    io.emit("newSubmission", GPTData);

    res.status(201).send(submission);
  } catch (err) {
    io.emit("submissionError");
    console.error("Error with submission text:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/getcollective", async (req, res) => {
  try {
    const submissions = req.body.submissions; // Fetch the submissions array correctly from req.body
    console.log("collective submitted", submissions);

    if (
      !submissions ||
      !Array.isArray(submissions) ||
      submissions.length === 0
    ) {
      console.log("no submissions...", submissions);
      return res
        .status(400)
        .send("No submissions provided in the request body.");
    }

    const GPTData = await getChatGPTCollectiveResponse(submissions);
    if (GPTData == null || !GPTData.text) {
      io.emit("collectiveError");
      console.error("null");
      res.status(500).send("Internal Server Error");
    }

    io.emit("collectiveData", GPTData);

    res.status(201).send(GPTData);
  } catch (err) {
    io.emit("collectiveError");
    console.error("Error with collective:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/visuals", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "visuals/visuals.html"));
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("submit", () => {
    console.log("text submitted");
    // io.emit("startProcessing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
