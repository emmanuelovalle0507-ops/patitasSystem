"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updatePostStatus } from "@/app/actions/posts";
import { toast } from "@/components/ui/toaster";

export function StatusActions({ postId, currentStatus }: { postId: string; currentStatus: string }) {
  const [pending, start] = useTransition();
  function change(status: "FOUND" | "IN_PROGRESS" | "LOST") {
    start(async () => {
      try { await updatePostStatus(postId, status); toast("Estado actualizado", "success"); }
      catch (e: any) { toast(e?.message || "Error", "error"); }
    });
  }
  return (
    <div className="flex gap-2">
      {currentStatus !== "FOUND" && (
        <Button variant="secondary" disabled={pending} onClick={() => change("FOUND")}>✅ Marcar encontrado</Button>
      )}
      {currentStatus !== "IN_PROGRESS" && currentStatus !== "FOUND" && (
        <Button variant="outline" disabled={pending} onClick={() => change("IN_PROGRESS")}>En proceso</Button>
      )}
    </div>
  );
}
