import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { GoogleGenAI } from "@google/genai";

// Configure worker for Node.js environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Navigate from src/modules/ai to backend root, then to node_modules
const backendRoot = resolve(__dirname, "..", "..", "..");
const workerPath = resolve(backendRoot, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

// Initialize Gemini AI for image OCR
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extract text from PDF buffer
 * Returns { text: string, numPages: number }
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
    let fullText = "";
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => (item.str ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n";
      } catch (pageError) {
        console.warn(`[PDF] Warning extracting page ${pageNum}:`, pageError.message);
        // Continue with next page
      }
    }

    return {
      text: fullText.trim(),
      numPages,
    };
  } catch (error) {
    console.error("[PDF] Text extraction failed:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from image using Gemini Vision OCR
 * Returns { text: string, numPages: number }
 */
export async function extractTextFromImage(imageBuffer, mimeType) {
  try {
    console.log(`[Image OCR] Processing image with Gemini Vision (${mimeType})`);
    
    const prompt = `Extract all text content from this image. 
If this is an exam or test document, extract the complete text including:
- All questions
- All answer choices
- Any instructions or headers
- Page numbers if visible

Return ONLY the extracted text, preserving the original structure and formatting as much as possible.`;

    // Convert buffer to base64 inline data
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType || "image/jpeg",
      },
    };

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ],

      timeout: 30000
    });

    const extractedText = result.text;

    console.log(`[Image OCR] Successfully extracted ${extractedText.length} characters`);

    return {
      text: extractedText.trim(),
      numPages: 1,
    };
  } catch (error) {
    console.error("[Image OCR] Text extraction failed:", error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}
