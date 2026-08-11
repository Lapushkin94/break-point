"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FocusPanel({ language = "English" }: { language?: string }) {
  const [open, setOpen] = useState(false);
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/focus",
    streamProtocol: "text",
  });

  function handleClick() {
    setOpen(true);
    complete("", { body: { language } });
  }

  return (
    <>
      <Button variant="outline" className="w-full" onClick={handleClick}>
        Focus for today
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Focus for today</DialogTitle>
          </DialogHeader>
          <div className="text-sm whitespace-pre-wrap">
            {completion || (isLoading ? "Thinking..." : "")}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
