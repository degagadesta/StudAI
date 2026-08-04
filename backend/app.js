import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { env } from "./src/config/env.js";

const app = express();

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

app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
