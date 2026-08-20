import "./src/config/env.js"; // must run first — loads .env before anything else reads process.env
import app, { httpServer } from "./app.js";
import { preloadEmbeddingModel } from "./src/lib/geminiClient.js";

const PORT = process.env.PORT || 4000;

// Preload embedding model at startup
preloadEmbeddingModel()
  .then(() => {
    console.log("[Server] Embedding model preloaded successfully");
  })
  .catch((err) => {
    console.error("[Server] Failed to preload embedding model:", err);
  });

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
