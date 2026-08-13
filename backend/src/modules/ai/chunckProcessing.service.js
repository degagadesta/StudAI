import { prisma } from "../../lib/prisma.js";
import { embedChunk } from "../../lib/geminiClient.js";

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Call this once, right after a PDF's chunks are extracted and inserted
 * (while status is EXTRACTING/ANALYZING). Only mark the material READY
 * after this completes — that's what keeps chat requests fast.
 */
export async function processChunksForMaterial(materialId) {
  const chunks = await prisma.materialChunk.findMany({
    where: { materialId },
    orderBy: { chunkIndex: "asc" },
  });

  for (const chunk of chunks) {
    const embedding = await embedChunk(chunk.content);
    await prisma.materialChunk.update({
      where: { id: chunk.id },
      data: {
        embedding,
        tokenCount: estimateTokens(chunk.content),
      },
    });
  }

  await prisma.courseMaterial.update({
    where: { id: materialId },
    data: { status: "READY" },
  });
}
