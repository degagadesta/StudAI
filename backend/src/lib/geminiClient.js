import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const CHAT_MODEL = "gemini-2.5-flash";

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

/** Embed a document chunk — used once, during PDF processing. */
export async function embedChunk(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });
  return response.embeddings[0].values;
}

/** Embed a student's question — used per chat message. */
export async function embedQuery(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });
  return response.embeddings[0].values;
}
