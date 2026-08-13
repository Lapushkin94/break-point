import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUserId } from "@/lib/auth";
import { getUserLanguage } from "@/db/queries";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    const userId = await getCurrentUserId();
    // Whisper takes an ISO-639-1 code directly — same format already stored
    // on the profile, no name-mapping needed.
    const language = await getUserLanguage(userId);

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language,
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error("Transcription failed:", err);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 },
    );
  }
}
