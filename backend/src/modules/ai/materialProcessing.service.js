import { prisma } from "../../lib/prisma.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";


const CHUNK_CHAR_SIZE = 1200;   // rough target size per chunk
const CHUNK_OVERLAP = 150;      // char overlap between consecutive chunks

export async function processMaterial(materialId) {
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    select: { id: true, fileData: true },
  });

  if (!material || !material.fileData) {
    throw new Error(`Material ${materialId} has no file data to process`);
  }

  try {
    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "EXTRACTING" },
    });

    const pages = await extractTextPerPage(material.fileData);

    const rawChunks = chunkPages(pages); // [{ content, age, chunkIndex }]

    if (rawChunks.length === 0) {
      throw new Error("No extractable text found in PDF");
    }

    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "ANALYZING" },
    });

    const embedded = await embedChunks(rawChunks);

    await prisma.$transaction([
      prisma.materialChunk.deleteMany({ where: { materialId } }), // safety if reprocessing
      prisma.materialChunk.createMany({
        data: embedded.map((c) => ({
          materialId,
          content: c.content,
          page: c.page,
          chunkIndex: c.chunkIndex,
          tokenCount: c.tokenCount,
          embedding: c.embedding,
        })),
      }),
      prisma.courseMaterial.update({
        where: { id: materialId },
        data: { status: "READY" },
      }),
    ]);
  } catch (err) {
    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}

// ---------- Extraction ----------

async function extractTextPerPage(pdfBuffer) {
  const doc = await getDocument({ data: pdfBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").trim();
    if (text.length > 0) pages.push({ page: i, text });
  }

  return pages;
}

// ---------- Chunking ----------

function chunkPages(pages) {
  const chunks = [];
  let chunkIndex = 0;

  for (const { page, text } of pages) {
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + CHUNK_CHAR_SIZE, text.length);
      const content = text.slice(start, end).trim();

      if (content.length > 0) {
        chunks.push({ content, page, chunkIndex: chunkIndex++ });
      }

      if (end === text.length) break;
      start = end - CHUNK_OVERLAP; // overlap so context isn't cut mid-thought
    }
  }

  return chunks;
}

// ---------- Embedding ----------

async function embedChunks(rawChunks) {
  const { embedChunk } = await import("../../lib/geminiClient.js");

  console.log(`[MaterialProcessing] Embedding ${rawChunks.length} chunks...`);
  const startTime = Date.now();

  const results = [];
  let embeddedCount = 0;

  for (const chunk of rawChunks) {
    const embedding = await embedChunk(chunk.content);
    embeddedCount++;

    results.push({
      ...chunk,
      embedding,
      tokenCount: Math.ceil(chunk.content.length / 4), // rough estimate
    });

    // Log progress every 10 chunks
    if (embeddedCount % 10 === 0) {
      console.log(`[MaterialProcessing] Embedded ${embeddedCount}/${rawChunks.length} chunks`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[MaterialProcessing] Embedded ${embeddedCount} chunks in ${totalTime}s`);

  return results;
}