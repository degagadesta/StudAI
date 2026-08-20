import { GoogleGenAI } from "@google/genai";
import { pipeline } from "@xenova/transformers";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------- Centralized model config ----------
// gemini-1.5-flash is fully retired (404s). gemini-2.5-flash shuts down
// Oct 16, 2026 — don't add new dependencies on it. Tune per-task: heavier
// reasoning (chat, single-pass summary, flashcards) gets the flagship
// flash; cheap/bulk tasks (chunk-level map step, snippet explanations)
// get the lite tier.
export const MODELS = {
  CHAT: "gemini-3.5-flash",
  SUMMARY_SINGLE: "gemini-3.1-flash-lite",
  SUMMARY_MAP: "gemini-3.1-flash-lite",
  SUMMARY_REDUCE: "gemini-3.5-flash",
  FLASHCARDS: "gemini-3.1-flash-lite",
  EXPLAIN: "gemini-3.1-flash-lite",
  NOTES: "gemini-3.1-flash-lite",
};

// Local embedding model configuration
const EMBEDDING_MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIMENSIONS = 384;
let embeddingModel = null;
let embeddingModelPromise = null;

// Singleton: load the embedding model once and reuse. Guarded against
// concurrent first-callers both triggering a load.
async function getEmbeddingModel() {
  if (embeddingModel) return embeddingModel;
  if (!embeddingModelPromise) {
    console.log(`[Embeddings] Loading local model: ${EMBEDDING_MODEL_NAME}`);
    embeddingModelPromise = pipeline("feature-extraction", EMBEDDING_MODEL_NAME).then((m) => {
      embeddingModel = m;
      console.log(`[Embeddings] Model loaded successfully (${EMBEDDING_DIMENSIONS}D)`);
      return m;
    });
  }
  return embeddingModelPromise;
}

export async function preloadEmbeddingModel() {
  await getEmbeddingModel();
}

// ---------- Retry helper ----------
// Gemini occasionally returns 429 (rate limit) or 503 (overloaded) —
// both are worth a short backoff retry rather than failing the request.
function isRetryable(error) {
  const status = error?.status ?? error?.code;
  const message = String(error?.message || "");
  return (
    status === 429 ||
    status === 503 ||
    message.includes("UNAVAILABLE") ||
    message.includes("overloaded") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

async function withRetry(fn, { retries = 2, baseDelayMs = 500 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryable(error)) throw error;
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 200;
      console.warn(`[Gemini] Retryable error (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(delay)}ms:`, error.message);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

/** Forces a Gemini reply into JSON matching the given schema. */
export async function generateStructured({
  prompt,
  schema,
  model,
  system,
  temperature = 0.4,
  maxOutputTokens,
}) {
  if (!model) throw new Error("generateStructured requires an explicit model (use MODELS.*)");

  const response = await withRetry(() =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature,
        ...(system ? { systemInstruction: system } : {}),
        ...(maxOutputTokens ? { maxOutputTokens } : {}),
      },
    }),
  );

  return {
    data: JSON.parse(response.text),
    usageMetadata: response.usageMetadata,
  };
}

/** Plain-text reply, used for chat and free-form explanations. */
export async function generateText({ prompt, model, system, maxOutputTokens }) {
  if (!model) throw new Error("generateText requires an explicit model (use MODELS.*)");

  const response = await withRetry(() =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        ...(maxOutputTokens ? { maxOutputTokens } : {}),
        ...(system ? { systemInstruction: system } : {}),
      },
    }),
  );

  return { text: response.text, usageMetadata: response.usageMetadata };
}

// ---------- Embeddings ----------

/**
 * Embed a batch of texts in a single pass through the local model.
 * This is the real fix over calling embedChunk() in a loop: the ONNX
 * runtime batches the matrix ops internally instead of paying per-call
 * overhead N times.
 */
export async function embedBatch(texts) {
  if (texts.length === 0) return [];
  const model = await getEmbeddingModel();
  const output = await model(texts, { pooling: "mean", normalize: true });

  const dim = output.dims?.[output.dims.length - 1] ?? EMBEDDING_DIMENSIONS;
  const flat = Array.from(output.data);
  const embeddings = [];
  for (let i = 0; i < texts.length; i++) {
    embeddings.push(flat.slice(i * dim, (i + 1) * dim));
  }
  return embeddings;
}

/** Embed a single chunk — thin wrapper over embedBatch for callers that need just one. */
export async function embedChunk(text) {
  const [embedding] = await embedBatch([text]);
  return embedding;
}

/** Embed a student's question — used per chat message. */
export async function embedQuery(text) {
  const [embedding] = await embedBatch([text]);
  return embedding;
}