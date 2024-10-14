import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import sharp from "sharp";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getChatGPTResponse = async (content) => {
  // Call ChatGPT API to analyze the text and return JSON formatted data
  const messages = [
    {
      role: "system",
      content: `You are an assistant that analyzes text about climate future dreams and returns JSON-formatted data.
      The response should include the following fields:
      - "text": the original text.
      - "disturbance": a value between 0 and 1, representing the turbidity of the water based on the level of despair vs hopefulness in the response (lower values are clearer, higher values are more murky).
      - "waveSpeed": a value between 0 and 1, where slower speeds are hopeful and calmer, and faster speeds represent urgency or despair.
      - "colors": an array of 3 colors, represented as hex codes, that visually express the theme of the response. Try to make the colors distinct to create a nice palette that still relates to the response's theme (e.g., water, family, politics, nature). If the text isn't coherent or related to the prompt, randomize the colors.
      - "explanation": a brief sentence explaining how the colors relate to the theme of the response.`,
    },
    {
      role: "user",
      content: `The text you must analyze is: "${content}". When you return json, make sure it is valid and doesn't have a comma after the last key value pair inside the JSON brackets.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can adjust to a different model if needed
      messages: messages,
      temperature: 0.7, // Optional: Adjust the creativity level
    });

    const response = completion.choices[0].message.content.trim();
    console.log("gpt response", response);

    const parsedResponse = JSON.parse(response);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return null;
  }
};

export const getChatGPTCollectiveResponse = async (submissions) => {
  // Call ChatGPT API to analyze the text and return JSON formatted data
  const messages = [
    {
      role: "system",
      content: `You are an assistant that analyzes an array of text submissions about climate future dreams.  
      The response should include the following fields:
      - "text": a very brief, poetic summary of all the submissions.
      - "disturbance": a value between 0 and 1, representing the average turbidity of the water based on the level of despair vs hopefulness in the response (lower values are clearer, higher values are more murky).
      - "waveSpeed": a value between 0 and 1, representing the average speed of the water where slower speeds are hopeful and calmer, and faster speeds represent urgency or despair.
      - "colors": an array of 3 colors, represented as hex codes, that visually express the most prevalent themes of the responses. They should create a distinct, visually pleasing palette. 
      - "explanation": a brief sentence explaining how the colors relate to the theme of the responses.`,
    },
    {
      role: "user",
      content: `When you return json, make sure it is valid and doesn't have a comma after the last key value pair inside the JSON brackets. The submissions you must analyze are: "${submissions}".`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can adjust to a different model if needed
      messages: messages,
      temperature: 0.7, // Optional: Adjust the creativity level
    });

    const response = completion.choices[0].message.content.trim();
    console.log("gpt response", response);

    const parsedResponse = JSON.parse(response);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return null;
  }
};

// Define the getChatGPTScore function
export const getChatGPTScore = async (content) => {
  // Call ChatGPT API to analyze the text
  const messages = [
    {
      role: "system",
      content: "You are an assistant that rates hopefulness of text entries.",
    },
    {
      role: "user",
      content: `Given the following text entries, rate the overall hopefulness on a scale from 0 to 10, where 0 is completely hopeless and 10 is extremely hopeful. Only return the score, as this will be consumed by code (no additional text):\n\n${content}\n\nOverall hopefulness number:`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Update model as needed
    messages: messages,
  });

  const score = completion.choices[0].message.content.trim();

  // Try to cast as a number
  const scoreAsNumber = parseFloat(score);

  if (isNaN(scoreAsNumber)) {
    return -1;
  }

  return scoreAsNumber;
};

export const getChatGPTGraph = async (textEntries) => {
  // Construct a prompt to instruct ChatGPT to analyze the text and create a graph
  const messages = [
    {
      role: "system",
      content:
        "You are an assistant that analyzes text entries and determines relationships based on common themes. You return a JSON-formatted 2D array representing a graph, where each entry in the array is the weight of the connection between text entries. A higher weight indicates more themes or features in common.",
    },
    {
      role: "user",
      content: `Analyze the following 10 text entries and return a JSON-formatted 2D array representing the graph of relationships between these text entries. Each value in the 2D array should be a number representing the weight of the connection between two text entries:\n\n${textEntries.join(
        "\n"
      )}\n\nReturn the graph in the form of a JSON 2D array.`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Choose an appropriate model
    messages: messages,
  });

  const graph = completion.choices[0].message.content.trim();

  // Try parsing the JSON to verify its format
  try {
    const graphArray = JSON.parse(graph);
    return graphArray;
  } catch (err) {
    console.error("Error parsing graph JSON:", err);
    return null; // Return null if JSON parsing fails
  }
};

// Function to generate an image using DALL-E based on user input
export const generateFlowerImage = async (description) => {
  try {
    const response = await openai.images.generate({
      prompt: `A detailed and artistic image of a flower, inspired by the following description: ${description}`,
      n: 1, // Generate one image
      size: "512x512", // Define the image size
    });

    // Assuming DALL-E returns a URL to the generated image
    const imageUrl = response.data[0].url;
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
};

// Utility function to generate a flower image using DALL-E and get base64-encoded data
export const generateFlowerImageAsBase64 = async (description) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: `A detailed and artistic image of a flower, inspired by the following description: ${description}`,
      n: 1,
      size: "512x512",
      response_format: "b64_json", // Use this format to get a base64 JSON response
    });
    const base64Data = response.data[0].b64_json; // Access the base64-encoded data
    return base64Data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
};

// Function to generate a random x, y, width, and height for the image section to be replaced
export const generateRandomSection = (imgW, imgH) => {
  const maxDim = 350;
  const minDim = 150;
  const width = Math.floor(Math.random() * (maxDim - minDim)) + minDim;
  const height = Math.floor(Math.random() * (maxDim - minDim)) + minDim;
  const x = Math.floor(Math.random() * (imgW - width));
  const y = Math.floor(Math.random() * (imgH - height));

  return { x, y, width, height };
};

// Function to generate a mask for the image using sharp
export const generateMask = async (section) => {
  let { x, y, width, height } = section;
  // Construct the SVG mask with transparency and a white rectangle for the mask section
  const svgMask = `
 <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <!-- White rectangle covering the top part above the transparent area -->
      <rect x="0" y="0" width="512" height="${y}" fill="white" />
      <!-- White rectangle covering the left part to the left of the transparent area -->
      <rect x="0" y="${y}" width="${x}" height="${512 - y}" fill="white" />
      <!-- White rectangle covering the right part to the right of the transparent area -->
      <rect x="${x + width}" y="${y}" width="${512 - (x + width)}" height="${
    512 - y
  }" fill="white" />
      <!-- White rectangle covering the bottom part below the transparent area -->
      <rect x="0" y="${y + height}" width="512" height="${
    512 - (y + height)
  }" fill="white" />
    </svg>`;

  const mask = Buffer.from(svgMask); // Convert the SVG string to a buffer

  const maskPath = path.join(__dirname, "mask.png");

  // Convert the SVG to a PNG and save the mask
  await sharp(mask).png().toFile(maskPath); // Save the PNG mask

  return maskPath;
};

// Function to replace part of the image using the user's submission text
export const replaceImagePart = async (imagePath, prompt, section) => {
  try {
    console.log("generating mask", section);
    const maskPath = await generateMask(section);
    console.log("mask path", maskPath);

    console.log("waiting on openai to process image");
    const response = await openai.images.edit({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      mask: fs.createReadStream(maskPath),
      prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json", // Use this format to get a base64 JSON response
    });
    console.log("image created");
    // const newImageUrl = response.data[0].url;
    // return newImageUrl;
    const base64Data = response.data[0].b64_json; // Access the base64-encoded data
    return base64Data;
  } catch (error) {
    console.error("Error replacing image part:", error);
    throw new Error("Failed to replace image part");
  }
};
