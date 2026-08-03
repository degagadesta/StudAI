import express from "express";
import cors from "cors";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.use(errorHandler); // must be last
