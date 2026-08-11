"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
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
      <Button variant="outline" size="sm" onClick={handleClick}>
        Focus for today
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Focus for today</DialogTitle>
          </DialogHeader>
          {completion ? (
            <Streamdown
              mode={isLoading ? "streaming" : "static"}
              className="prose prose-sm max-w-none"
            >
              {completion}
            </Streamdown>
          ) : (
            isLoading && (
              <p className="text-sm text-muted-foreground">Thinking...</p>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
