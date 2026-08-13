import { prisma } from "../../lib/prisma.js";

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Returns the most recent messages that fit in historyTokenBudget,
 * oldest-first, ready to drop straight into a prompt.
 */
export async function getRecentHistory(
  sessionId,
  historyTokenBudget,
  maxMessages = 8,
) {
  const recent = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: maxMessages,
  });

  const kept = [];
  let tokensUsed = 0;
  for (const msg of recent) {
    // newest first
    const tokens = estimateTokens(msg.content);
    if (tokensUsed + tokens > historyTokenBudget) break;
    kept.push(msg);
    tokensUsed += tokens;
  }

  return kept.reverse(); // oldest first, natural reading order
}
