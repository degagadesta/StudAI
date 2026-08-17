import { GoogleGenAI } from "@google/genai";
import * as localEmbeddings from "./localEmbeddings.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Keep Gemini for text generation only
const CHAT_MODEL = "gemini-2.5-flash";

// Use local embeddings instead of Gemini
// Note: Changed from 768 (Gemini) to 384 (all-MiniLM-L6-v2) dimensions
const EMBEDDING_DIMENSIONS = localEmbeddings.getEmbeddingDimensions();

/** Forces a Gemini reply into JSON matching the given schema. */
export async function generateStructured({
  prompt,
  schema,
  model = CHAT_MODEL,
}) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.4,
    },
  });
  return {
    data: JSON.parse(response.text),
    usageMetadata: response.usageMetadata,
  };
}

/** Plain-text reply, used for chat. */
export async function generateText({
  prompt,
  model = CHAT_MODEL,
  maxOutputTokens,
}) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: maxOutputTokens ? { maxOutputTokens } : undefined,
  });
  return { text: response.text, usageMetadata: response.usageMetadata };
}

/** 
 * Embed a document chunk — used once, during PDF processing.
 * Now uses local all-MiniLM-L6-v2 model (384 dimensions) instead of Gemini.
 */
export async function embedChunk(text) {
  return await localEmbeddings.embedChunk(text);
}

/** 
 * Embed a student's question — used per chat message.
 * Now uses local all-MiniLM-L6-v2 model (384 dimensions) instead of Gemini.
 */
export async function embedQuery(text) {
  return await localEmbeddings.embedQuery(text);
}

/**
 * Get embedding dimensions (for validation/logging).
 */
export function getEmbeddingDimensions() {
  return EMBEDDING_DIMENSIONS;
}

/**
 * Preload embedding model on server startup (optional).
 */
export async function preloadEmbeddingModel() {
  return await localEmbeddings.preloadModel();
}
