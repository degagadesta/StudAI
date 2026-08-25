import { Router } from "express";
import multer from "multer";
import { uploadPDF, getPDFs, servePDF, updateProgress, deletePDF, retryProcessing } from "./pdf.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { cacheStudentData } from "../../middlewares/cache.js";
import { AppError } from "../../utils/AppError.js";

const router = Router();

// Configure multer for memory storage
// fileFilter rejects non-PDFs BEFORE the file is loaded into memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new AppError('Only PDF files are supported. Please upload a PDF file', 400), false);
        }
    }
});

router.post("/", authenticate, upload.single('pdf'), uploadPDF);
// Cache materials list for 2 minutes
router.get("/", authenticate, cacheStudentData("materials:list", 120), getPDFs);
router.get("/:id/file", authenticate, servePDF);
router.patch("/:id/progress", authenticate, updateProgress);
router.delete("/:id", authenticate, deletePDF);
router.post("/:id/retry", authenticate, retryProcessing);

export default router;
