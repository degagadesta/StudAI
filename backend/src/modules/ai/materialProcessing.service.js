import { prisma } from "../../lib/prisma.js";
import { embedBatch } from "../../lib/geminiClient.js";
import { extractTextFromPDF } from "./textExtraction.js";
import { emitToStudent } from "../../lib/socket.js";
import { invalidateMaterials } from "../../utils/cacheInvalidation.js";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const EMBED_BATCH_SIZE = 32; // texts per local-model batch call
const DB_INSERT_BATCH_SIZE = 200; // rows per createMany call

// materialProcessing.service.js — add near the top, replace processMaterialAsync at the bottom

const MAX_CONCURRENT_PROCESSING = 2; // tune to your DB pool size
let activeCount = 0;
const queue = [];

function runNext() {
  if (activeCount >= MAX_CONCURRENT_PROCESSING || queue.length === 0) return;
  const { materialId } = queue.shift();
  activeCount++;
  processMaterial(materialId)
    .catch((error) => {
      console.error(`[Processing] Background processing failed for ${materialId}:`, error);
    })
    .finally(() => {
      activeCount--;
      runNext();
    });
}



function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function createChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;

    if (start + chunkSize >= text.length && end === text.length) {
      break;
    }
  }

  return chunks;
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function processMaterial(materialId) {
  console.log(`[Processing] Starting processing for material ${materialId}`);

  try {
    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId },
      select: {
        id: true,
        fileData: true,
        status: true,
        curriculumCourse: {
          select: {
            curriculum: {
              select: {
                studentProfile: {
                  select: { studentId: true }
                }
              }
            }
          }
        }
      },
    });

    if (!material) throw new Error(`Material ${materialId} not found`);
    if (!material.fileData) throw new Error(`Material ${materialId} has no file data`);

    // Get studentId for Socket.IO events - with proper error handling
    let studentId = null;
    try {
      studentId = material?.curriculumCourse?.curriculum?.studentProfile?.studentId;

      if (!studentId) {
        console.warn(`[Processing] Could not find studentId for material ${materialId} - skipping Socket events`);
      }
    } catch (err) {
      console.error(`[Processing] Error extracting studentId for material ${materialId}:`, err.message);
    }

    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "EXTRACTING" },
    });

    // Emit real-time status update
    if (studentId) {
      emitToStudent(studentId, "material:extracting", {
        materialId,
        status: "EXTRACTING"
      });
    }

    console.log(`[Processing] Extracting text from PDF ${materialId}`);
    const { text, numPages } = await extractTextFromPDF(material.fileData);
    console.log(`[Processing] Extracted ${text.length} characters from ${numPages} pages`);

    if (!text || text.trim().length === 0) {
      throw new Error("PDF contains no extractable text");
    }

    const avgCharsPerPage = text.length / Math.max(numPages, 1);
    const MIN_CHARS_PER_PAGE = 50; // adjust once you see more real documents
    if (avgCharsPerPage < MIN_CHARS_PER_PAGE) {
      throw new Error(
        `This PDF appears to be scanned images or has non-extractable text (~${Math.round(avgCharsPerPage)} chars/page). OCR isn't supported yet — try a text-based PDF.`,
      );
    }

    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "ANALYZING" },
    });

    // Emit real-time status update
    if (studentId) {
      emitToStudent(studentId, "material:analyzing", {
        materialId,
        status: "ANALYZING"
      });
    }

    console.log(`[Processing] Splitting text into chunks`);
    const textChunks = createChunks(text);
    console.log(`[Processing] Created ${textChunks.length} chunks`);

    if (textChunks.length === 0) {
      throw new Error("No chunks created from PDF text");
    }

    // Embed in batches — one call per EMBED_BATCH_SIZE chunks instead of
    // one call per chunk. This is the main latency win for big PDFs.
    console.log(`[Processing] Generating embeddings for ${textChunks.length} chunks in batches of ${EMBED_BATCH_SIZE}`);

    const chunksWithEmbeddings = [];
    const textBatches = chunkArray(textChunks, EMBED_BATCH_SIZE);
    let processedCount = 0;

    for (const batch of textBatches) {
      let embeddings;
      try {
        embeddings = await embedBatch(batch);
      } catch (embError) {
        console.error(`[Processing] Error generating embeddings for batch starting at chunk ${processedCount}:`, embError);
        throw embError;
      }

      for (let i = 0; i < batch.length; i++) {
        chunksWithEmbeddings.push({
          chunkIndex: processedCount + i,
          content: batch[i],
          embedding: embeddings[i],
          tokenCount: estimateTokens(batch[i]),
        });
      }

      processedCount += batch.length;
      console.log(`[Processing] Generated embeddings ${processedCount}/${textChunks.length}`);
    }

    console.log(`[Processing] All embeddings generated, saving to database...`);

    // Bulk insert instead of one create() per chunk.
    const dbBatches = chunkArray(chunksWithEmbeddings, DB_INSERT_BATCH_SIZE);
    let savedCount = 0;

    for (const batch of dbBatches) {
      try {
        await prisma.materialChunk.createMany({
          data: batch.map((chunk) => ({
            materialId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
            embedding: chunk.embedding,
            page: null,
          })),
        });
        savedCount += batch.length;
        console.log(`[Processing] Saved chunks ${savedCount}/${chunksWithEmbeddings.length}`);
      } catch (batchError) {
        console.error(`[Processing] Error saving batch at offset ${savedCount}:`, batchError);
        throw batchError;
      }
    }

    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "READY" },
    });

    // Invalidate cache and emit success event
    if (studentId) {
      await invalidateMaterials(studentId, materialId);
      emitToStudent(studentId, "material:ready", {
        materialId,
        status: "READY",
        numChunks: textChunks.length,
        numPages
      });
    }

    console.log(`[Processing] ✓ Material ${materialId} processing complete - ${textChunks.length} chunks ready`);

    return { success: true, numChunks: textChunks.length, numPages };
  } catch (error) {
    console.error(`[Processing] ✗ Failed to process material ${materialId}:`, error);

    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "FAILED" },
    });

    // Get studentId for error event with proper error handling
    let studentId = null;
    try {
      const material = await prisma.courseMaterial.findUnique({
        where: { id: materialId },
        select: {
          curriculumCourse: {
            select: {
              curriculum: {
                select: {
                  studentProfile: {
                    select: { studentId: true }
                  }
                }
              }
            }
          }
        },
      });

      studentId = material?.curriculumCourse?.curriculum?.studentProfile?.studentId;
    } catch (queryError) {
      console.error(`[Processing] Error getting studentId for failed material ${materialId}:`, queryError.message);
    }

    if (studentId) {
      emitToStudent(studentId, "material:failed", {
        materialId,
        status: "FAILED",
        error: error.message
      });
    }

    throw error;
  }
}

export function processMaterialAsync(materialId) {
  queue.push({ materialId });
  runNext();
}