import { Router } from "express";
import {
    getUniversities,
    getUniversity,
} from "./university.controller.js";

const router = Router();

router.get("/", getUniversities);
router.get("/:id", getUniversity);

export default router;