"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { toggleLike } from "@/app/actions/posts";

export function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, start] = useTransition();

  function onClick() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => c + (wasLiked ? -1 : 1));
    start(async () => {
      try {
        await toggleLike(postId);
      } catch (e: any) {
        setLiked(wasLiked);
        setCount((c) => c + (wasLiked ? 1 : -1));
        toast(e?.message || "No se pudo actualizar", "error");
      }
    });
  }

  return (
    <Button variant={liked ? "default" : "outline"} onClick={onClick} aria-pressed={liked} aria-label={liked ? "Quitar me gusta" : "Me gusta"}>
      <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </Button>
  );
}
