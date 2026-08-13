import {
  streamText,
  toUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { searchSessions } from "@/db/queries";
import { formatSessionsForPrompt } from "@/lib/ai/context";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function POST(req: Request) {
  const {
    messages,
    language = "English",
  }: { messages: UIMessage[]; language?: string } = await req.json();
  const lastMessage = getMessageText(messages[messages.length - 1]);

  // RETRIEVAL: find the notes relevant to the question
  const relevant = await searchSessions(lastMessage, 8);

  const system = `You are a tennis coach with access to the player's training and match history.
Respond in ${language}.
Answer using ONLY the retrieved sessions below. If they don't contain the answer, say so.
Reference specific dates.

Retrieved sessions:
${formatSessionsForPrompt(relevant)}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
