import { Router } from "express";
import multer from "multer";
import { uploadPDF, getPDFs, servePDF, deletePDF } from "./pdf.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
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
            cb(new AppError('Only PDF files are allowed', 400), false);
        }
    }
});

router.post("/", authenticate, upload.single('pdf'), uploadPDF);
router.get("/", authenticate, getPDFs);
router.get("/:id/file", authenticate, servePDF);
router.delete("/:id", authenticate, deletePDF);

export default router;
