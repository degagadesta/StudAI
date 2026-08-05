import { Router } from "express";
import multer from "multer";
import { uploadPDF, getPDFs, deletePDF } from "./pdf.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
    }
});

router.post("/", authenticate, upload.single('pdf'), uploadPDF);
router.get("/", authenticate, getPDFs);
router.delete("/:id", authenticate, deletePDF);

export default router;
