import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      // TODO:
      // language: "el",  // set per user later; omit to auto-detect
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error("Transcription failed:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}