import { pipeline } from "@xenova/transformers";

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIMENSIONS = 384;

// Singleton model instance - loaded once and reused
let embeddingModel = null;
let modelLoadingPromise = null;

/**
 * Load the embedding model. Called automatically on first use.
 * Returns a promise that resolves to the model instance.
 */
async function loadModel() {
  if (embeddingModel) {
    return embeddingModel;
  }

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  console.log(`[LocalEmbeddings] Loading model: ${MODEL_NAME}...`);
  const startTime = Date.now();

  modelLoadingPromise = pipeline("feature-extraction", MODEL_NAME, {
    quantized: true, // Use quantized model for better performance
  })
    .then((model) => {
      embeddingModel = model;
      const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[LocalEmbeddings] Model loaded successfully in ${loadTime}s`);
      modelLoadingPromise = null;
      return model;
    })
    .catch((err) => {
      console.error("[LocalEmbeddings] Failed to load model:", err);
      modelLoadingPromise = null;
      throw new Error(`Failed to load embedding model: ${err.message}`);
    });

  return modelLoadingPromise;
}

/**
 * Generate embedding vector for a text chunk.
 * Used during PDF processing to embed document chunks.
 * 
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
export async function embedChunk(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("embedChunk requires non-empty text");
  }

  const model = await loadModel();

  try {
    // Generate embedding
    const output = await model(text, {
      pooling: "mean", // Mean pooling
      normalize: true, // L2 normalization
    });

    // Convert tensor to array
    const embedding = Array.from(output.data);

    // Verify dimensions
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
      );
    }

    return embedding;
  } catch (err) {
    console.error("[LocalEmbeddings] Error generating chunk embedding:", err);
    throw new Error(`Failed to generate embedding: ${err.message}`);
  }
}

/**
 * Generate embedding vector for a query/question.
 * Used during RAG retrieval to embed student questions.
 * 
 * @param {string} text - The query text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
export async function embedQuery(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("embedQuery requires non-empty text");
  }

  const model = await loadModel();

  try {
    // Generate embedding with same settings as chunks for compatibility
    const output = await model(text, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
      );
    }

    return embedding;
  } catch (err) {
    console.error("[LocalEmbeddings] Error generating query embedding:", err);
    throw new Error(`Failed to generate query embedding: ${err.message}`);
  }
}

/**
 * Get the embedding dimensions for this model.
 * Useful for validation and schema checks.
 */
export function getEmbeddingDimensions() {
  return EMBEDDING_DIMENSIONS;
}

/**
 * Check if the model is loaded.
 * Useful for health checks and debugging.
 */
export function isModelLoaded() {
  return embeddingModel !== null;
}

/**
 * Preload the model on server startup (optional).
 * Call this during initialization to avoid first-request delay.
 */
export async function preloadModel() {
  console.log("[LocalEmbeddings] Preloading embedding model...");
  await loadModel();
}
