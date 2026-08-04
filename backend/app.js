import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";  // Add this
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

// CORS configuration - IMPORTANT for cookies to work
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true  // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());  // Add this middleware

app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
