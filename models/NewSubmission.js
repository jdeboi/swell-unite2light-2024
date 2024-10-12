import mongoose from "mongoose";

// Define the Text schema
const NewSubmissionSchema = new mongoose.Schema({
  text: String,
  disturbance: Number,
  waveSpeed: Number,
  color1: String,
  color2: String,
  color3: String,
  explanation: String,
  createdAt: { type: Date, default: Date.now },
});

const NewSubmission = mongoose.model("NewSubmission", NewSubmissionSchema);
export default NewSubmission;
