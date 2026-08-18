import { prisma } from "../../lib/prisma.js";
import { embedQuery } from "../../lib/geminiClient.js";

const MIN_RELEVANCE_SCORE = 0.55; // tune this once you have real question/chunk data

function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * RAG retrieval: rank by relevance, drop anything below threshold,
 * pull in immediate neighbors for context continuity, then pack into budget.
 */
export async function retrieveRelevantChunks(
  materialId,
  question,
  chunkTokenBudget,
) {
  const chunks = await prisma.materialChunk.findMany({
    where: { materialId },
    orderBy: { chunkIndex: "asc" },
  });

  console.log(`[RAG] Retrieved ${chunks.length} chunks for material ${materialId}`);

  if (chunks.length === 0) {
    console.log(`[RAG] No chunks found for material ${materialId}`);
    return [];
  }

  const missingEmbeddings = chunks.some(
    (c) => !c.embedding || c.embedding.length === 0,
  );
  if (missingEmbeddings) {
    console.error(`[RAG] Material ${materialId} has chunks without embeddings`);
    throw new Error(
      `Material ${materialId} has chunks without embeddings — processing may have failed`,
    );
  }

  console.log(`[RAG] Embedding query: "${question.substring(0, 50)}..."`);
  const questionEmbedding = await embedQuery(question);
  console.log(`[RAG] Query embedding generated (${questionEmbedding.length}D)`);

  const byIndex = new Map(chunks.map((c) => [c.chunkIndex, c]));

  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .filter((r) => r.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.score - a.score);

  console.log(`[RAG] Found ${ranked.length}/${chunks.length} chunks above threshold (${MIN_RELEVANCE_SCORE})`);
  if (ranked.length > 0) {
    console.log(`[RAG] Top 3 scores: ${ranked.slice(0, 3).map(r => r.score.toFixed(3)).join(", ")}`);
  }

  if (ranked.length === 0) {
    console.log(`[RAG] No chunks met relevance threshold`);
    return [];
  }

  const selected = new Map(); // chunkIndex -> chunk, avoids duplicates
  let tokensUsed = 0;

  const tryAdd = (chunk) => {
    if (selected.has(chunk.chunkIndex)) return true;
    const tokens = chunk.tokenCount ?? estimateTokens(chunk.content);
    if (tokensUsed + tokens > chunkTokenBudget) return false;
    selected.set(chunk.chunkIndex, chunk);
    tokensUsed += tokens;
    return true;
  };

  for (const { chunk } of ranked) {
    if (!tryAdd(chunk)) continue;

    // Neighbor expansion: pull in the chunk right before/after a strong
    // match, since educational content often spans chunk boundaries.
    const before = byIndex.get(chunk.chunkIndex - 1);
    const after = byIndex.get(chunk.chunkIndex + 1);
    if (before) tryAdd(before);
    if (after) tryAdd(after);
  }

  const result = [...selected.values()].sort((a, b) => a.chunkIndex - b.chunkIndex);
  console.log(`[RAG] Returning ${result.length} chunks (${tokensUsed} tokens)`);
  
  return result;
}
