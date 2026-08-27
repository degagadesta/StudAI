import { preloadEmbeddingModel } from "../src/lib/geminiClient.js";

console.log("[Docker build] Preloading embedding model into image layer...");
await preloadEmbeddingModel();
console.log("[Docker build] Embedding model cached — no runtime download needed.");
process.exit(0);