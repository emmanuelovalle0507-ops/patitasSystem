"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, MessageCircle, Facebook, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/toaster";

type Props = {
  url: string;
  title: string;
  text: string;
  trigger?: React.ReactNode;
};

export function ShareModal({ url, title, text, trigger }: Props) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const msg = `${title} — ${text}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Enlace copiado", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
      } catch {}
    } else {
      copyLink();
    }
  }

  const channels = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      href: `https://wa.me/?text=${enc(msg + " " + url)}`,
      color: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      name: "X",
      icon: <span className="text-sm font-bold">𝕏</span>,
      href: `https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}`,
      color: "bg-black hover:bg-gray-800 text-white",
    },
    {
      name: "Telegram",
      icon: <Send className="h-5 w-5" />,
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}`,
      color: "bg-sky-500 hover:bg-sky-600 text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir publicación</DialogTitle>
          <DialogDescription>
            Comparte en redes sociales para que más personas ayuden a buscar.
          </DialogDescription>
        </DialogHeader>

        {/* Social grid */}
        <div className="grid grid-cols-4 gap-3">
          {channels.map((ch) => (
            <a
              key={ch.name}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${ch.color}`}>
                {ch.icon}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{ch.name}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex gap-2">
          <Input value={url} readOnly className="text-xs bg-muted/50" />
          <Button variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>

        {/* Native share (mobile) */}
        <Button variant="secondary" onClick={nativeShare} className="w-full gap-2">
          <Share2 className="h-4 w-4" />
          Más opciones...
        </Button>
      </DialogContent>
    </Dialog>
  );
}
