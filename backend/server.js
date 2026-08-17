import "./src/config/env.js"; // must run first — loads .env before anything else reads process.env
import app from "./app.js";
import { preloadEmbeddingModel } from "./src/lib/geminiClient.js";

const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Preload embedding model in background to avoid first-request delay
  preloadEmbeddingModel()
    .then(() => console.log("[Server] Embedding model preloaded and ready"))
    .catch((err) => console.error("[Server] Failed to preload embedding model:", err));
});
