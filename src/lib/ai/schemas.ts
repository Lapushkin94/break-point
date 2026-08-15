import { z } from "zod";

export const sessionParseSchema = z.object({
  type: z
    .enum(["training", "match", "rally"])
    .describe(
      "A match if a score or a competitive opponent is mentioned; otherwise training",
    ),
  opponent: z
    .string()
    .nullable()
    .describe("Opponent's name if this is a match, else null"),
  opponentDescription: z
    .string()
    .nullable()
    .describe(
      "A brief physical or personal description that identifies WHICH person this opponent is, only if mentioned (e.g. 'young guy with black hair, British accent') — useful since multiple opponents can share a name. Not tactical info. Null if not mentioned or not a match.",
    ),
  score: z
    .string()
    .nullable()
    .describe("Score like '6:4 3:6 7:6' if mentioned, else null"),
  result: z
    .enum(["win", "loss"])
    .nullable()
    .describe("Whether the player won or lost, if determinable, else null"),
  surface: z
    .enum(["clay", "hard", "carpet"])
    .nullable()
    .describe("Court surface if mentioned, else null"),
  durationMinutes: z
    .number()
    .int()
    .min(0)
    .nullable()
    .describe(
      "Session length in minutes if mentioned (e.g. 'an hour and a half' = 90), else null",
    ),
  energy: z
    .number()
    .min(1)
    .max(5)
    .int()
    .nullable()
    .describe(
      "Player's energy level 1-5 if they indicate how they felt physically, else null",
    ),
  mood: z
    .number()
    .min(1)
    .max(5)
    .int()
    .nullable()
    .describe(
      "Player's mood 1-5 if they indicate how they felt emotionally, else null",
    ),
  whatWorked: z
    .array(z.string())
    .describe(
      "Short phrases for things that went well. Empty array if none mentioned.",
    ),
  whatFailed: z
    .array(z.string())
    .describe(
      "Short phrases for things that didn't work. Empty array if none mentioned.",
    ),
  coachNotes: z
    .array(z.string())
    .describe(
      "Any remarks or advice from the coach. Empty array if none mentioned.",
    ),
  opponentDetails: z
    .array(z.string())
    .describe(
      "Short phrases noting the opponent's weaknesses, habits, or tendencies, for use scouting a future rematch. Only for matches. Empty array if none mentioned or not a match.",
    ),
});

// What the AI actually produces from raw text.
export type ParsedSession = z.infer<typeof sessionParseSchema>;

// opponentId isn't part of the AI's output schema — the model has no way to
// produce a real database id from raw text. It's set client-side via the
// opponent picker and merged onto the parsed result by the caller.
export type SessionParse = ParsedSession & {
  opponentId: string | null;
};
