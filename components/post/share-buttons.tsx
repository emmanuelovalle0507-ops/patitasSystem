"use client";
import { Button } from "@/components/ui/button";
import { Facebook, Send, Share2, Copy } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export function ShareButtons({ url, title, text }: { url: string; title: string; text: string }) {
  const enc = encodeURIComponent;
  const msg = `${title} — ${text}`;

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast("Enlace copiado", "success");
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(url);
    toast("Enlace copiado", "success");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={nativeShare}><Share2 className="mr-2 h-4 w-4"/>Compartir</Button>
      <Button asChild variant="outline">
        <a href={`https://wa.me/?text=${enc(msg + " " + url)}`} target="_blank">WhatsApp</a>
      </Button>
      <Button asChild variant="outline">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank"><Facebook className="mr-2 h-4 w-4"/>Facebook</a>
      </Button>
      <Button asChild variant="outline">
        <a href={`https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}`} target="_blank">X / Twitter</a>
      </Button>
      <Button asChild variant="outline">
        <a href={`https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}`} target="_blank"><Send className="mr-2 h-4 w-4"/>Telegram</a>
      </Button>
      <Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4"/>Copiar link</Button>
    </div>
  );
}
