import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

// Build the text that represents a session for embedding.
export function sessionToEmbeddingText(s: {
  type: string;
  opponent?: string | null;
  opponentDescription?: string | null;
  surface?: string | null;
  rawText: string;
  whatWorked?: string[] | null;
  whatFailed?: string[] | null;
  coachNotes?: string[] | null;
  opponentDetails?: string[] | null;
}): string {
  return [
    `type: ${s.type}`,
    s.opponent ? `opponent: ${s.opponent}` : "",
    s.opponentDescription
      ? `opponent description: ${s.opponentDescription}`
      : "",
    s.surface ? `surface: ${s.surface}` : "",
    s.rawText,
    (s.whatWorked ?? []).join(" "),
    (s.whatFailed ?? []).join(" "),
    (s.coachNotes ?? []).join(" "),
    (s.opponentDetails ?? []).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });
  return embedding;
}
