import { prisma } from "../../lib/prisma.js";
import { embedChunk } from "../../lib/geminiClient.js";

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Call this once, right after a PDF's chunks are extracted and inserted
 * (while status is EXTRACTING/ANALYZING). Only mark the material READY
 * after this completes — that's what keeps chat requests fast.
 * 
 * IDEMPOTENT: Only generates embeddings for chunks that don't have them yet.
 */
export async function processChunksForMaterial(materialId) {
  console.log(`[ChunkProcessing] Processing chunks for material: ${materialId}`);

  const chunks = await prisma.materialChunk.findMany({
    where: { materialId },
    orderBy: { chunkIndex: "asc" },
  });

  console.log(`[ChunkProcessing] Found ${chunks.length} chunks`);

  // Filter chunks that need embedding (idempotent)
  const chunksNeedingEmbedding = chunks.filter(
    (c) => !c.embedding || c.embedding.length === 0
  );

  if (chunksNeedingEmbedding.length === 0) {
    console.log(`[ChunkProcessing] All chunks already have embeddings, skipping`);
    
    // Ensure material is marked as READY
    await prisma.courseMaterial.update({
      where: { id: materialId },
      data: { status: "READY" },
    });
    
    return;
  }

  console.log(
    `[ChunkProcessing] Generating embeddings for ${chunksNeedingEmbedding.length} chunks (${chunks.length - chunksNeedingEmbedding.length} already embedded)`
  );

  const startTime = Date.now();
  let embeddedCount = 0;

  for (const chunk of chunksNeedingEmbedding) {
    const embedding = await embedChunk(chunk.content);
    await prisma.materialChunk.update({
      where: { id: chunk.id },
      data: {
        embedding,
        tokenCount: estimateTokens(chunk.content),
      },
    });

    embeddedCount++;

    // Log progress every 10 chunks
    if (embeddedCount % 10 === 0) {
      console.log(`[ChunkProcessing] Embedded ${embeddedCount}/${chunksNeedingEmbedding.length} chunks`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[ChunkProcessing] Generated ${embeddedCount} new embeddings in ${totalTime}s`);

  await prisma.courseMaterial.update({
    where: { id: materialId },
    data: { status: "READY" },
  });

  console.log(`[ChunkProcessing] Material ${materialId} marked as READY`);
}
