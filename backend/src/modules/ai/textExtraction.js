import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.min.mjs";

/**
 * Extract text from PDF buffer
 * Returns { text: string, numPages: number }
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
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
