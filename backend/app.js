import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { activityLogger } from "./src/middlewares/activityLogger.js";
import { env } from "./src/config/env.js";
import { initRedis } from "./src/lib/redis.js";
import { initSocketIO } from "./src/lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Secure CORS configuration
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded PDFs as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log one activity entry per hour for every authenticated request
app.use(activityLogger);

app.use("/api/v1", routes);
app.use(errorHandler);

// Initialize Redis and Socket.IO
initRedis().catch((error) => {
  console.error("[App] Failed to initialize Redis:", error.message);
});

// Initialize Socket.IO
initSocketIO(httpServer);

export default app;
export { httpServer };
