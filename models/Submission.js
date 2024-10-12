// models/Text.js

import mongoose from "mongoose";

// Define the Text schema
const SubmissionSchema = new mongoose.Schema({
  content: String,
  score: Number,
  // imageUrl: String,
  imgBase64: { type: String, default: null }, // Image stored as base64, can be null
  createdAt: { type: Date, default: Date.now },
  section: { x: Number, y: Number, width: Number, height: Number },
});

// Create and export the Text model
const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
