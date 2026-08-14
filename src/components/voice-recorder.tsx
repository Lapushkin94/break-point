"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mic01Icon,
  StopIcon,
  Loading03Icon,
  PauseIcon,
  PlayIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

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
    "idle" | "recording" | "paused" | "review" | "processing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");
  const recordedBlobRef = useRef<Blob | null>(null);

  // Revoke the previous object URL whenever it's replaced or the component
  // unmounts — otherwise every recording leaks its blob for the tab's life.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

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
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || "audio/mp4",
        });
        recordedBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("review");
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

  function pauseRecording() {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current && status === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      (status === "recording" || status === "paused")
    ) {
      mediaRecorderRef.current.stop(); // triggers onstop → review
    }
  }

  function discardRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    recordedBlobRef.current = null;
    chunksRef.current = [];
    setStatus("idle");
  }

  async function handleUpload() {
    if (!recordedBlobRef.current) return;
    setStatus("processing");
    try {
      const ext = mimeTypeRef.current.includes("webm") ? "webm" : "mp4";
      const formData = new FormData();
      formData.append("audio", recordedBlobRef.current, `note.${ext}`);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("transcribe failed");

      const { text } = await res.json();
      onTranscript(text); // hand the text to the parent page
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      recordedBlobRef.current = null;
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

      {(status === "recording" || status === "paused") && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={status === "recording" ? pauseRecording : resumeRecording}
          >
            <HugeiconsIcon
              icon={status === "recording" ? PauseIcon : PlayIcon}
              strokeWidth={2}
            />
            {status === "recording" ? "Pause" : "Resume"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={stopRecording}
          >
            <HugeiconsIcon icon={StopIcon} strokeWidth={2} />
            Stop
          </Button>
        </div>
      )}

      {status === "review" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={discardRecording}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Discard
            </Button>
            <Button type="button" className="flex-1" onClick={handleUpload}>
              Transcribe
            </Button>
          </div>
        </div>
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
