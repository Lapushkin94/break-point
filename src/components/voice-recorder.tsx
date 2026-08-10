"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon, StopIcon, Loading03Icon } from "@hugeicons/core-free-icons";

// Ask the browser which of these it can actually record. Order = preference.
function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4", // Safari / iOS
    "audio/aac",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return ""; // let the browser choose its default
}

export function VoiceRecorder({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "recording" | "processing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        // stop the mic so the browser's recording indicator goes away
        stream.getTracks().forEach((t) => t.stop());
        void handleUpload();
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus("recording");
    } catch {
      setStatus("error");
      setErrorMsg(
        "Couldn't access the microphone. Check permissions and try again.",
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop(); // triggers onstop → handleUpload
    }
  }

  async function handleUpload() {
    setStatus("processing");
    try {
      const blob = new Blob(chunksRef.current, {
        type: mimeTypeRef.current || "audio/mp4",
      });

      const ext = mimeTypeRef.current.includes("webm") ? "webm" : "mp4";
      const formData = new FormData();
      formData.append("audio", blob, `note.${ext}`);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("transcribe failed");

      const { text } = await res.json();
      onTranscript(text); // hand the text to the parent page
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg(
        "Couldn't transcribe that. Try again, or type the note instead.",
      );
    }
  }

  return (
    <div className="space-y-2">
      {status === "idle" && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={startRecording}
        >
          <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} />
          Record note
        </Button>
      )}
      {status === "recording" && (
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={stopRecording}
        >
          <HugeiconsIcon icon={StopIcon} strokeWidth={2} />
          Stop recording
        </Button>
      )}
      {status === "processing" && (
        <Button type="button" className="w-full" disabled>
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="animate-spin"
          />
          Transcribing...
        </Button>
      )}
      {status === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{errorMsg}</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={startRecording}
          >
            <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
