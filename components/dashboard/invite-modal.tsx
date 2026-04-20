"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, MessageCircle, Facebook, Send, Heart } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const SHARE_URL = "https://patitas.mx";
const SHARE_TEXT = "Ayúdame a cuidar y reencontrar mascotas perdidas en nuestra zona. Únete a PatiTas 🐾";

export function InviteModal({ trigger }: { trigger: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast("Enlace copiado", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("No se pudo copiar", "error");
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "PatiTas", text: SHARE_TEXT, url: SHARE_URL });
      } catch {}
    } else {
      copyLink();
    }
  }

  const channels = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      href: `https://wa.me/?text=${enc(SHARE_TEXT + " " + SHARE_URL)}`,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(SHARE_URL)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "X",
      icon: <span className="text-sm font-bold">𝕏</span>,
      href: `https://twitter.com/intent/tweet?text=${enc(SHARE_TEXT)}&url=${enc(SHARE_URL)}`,
      color: "bg-black hover:bg-gray-800",
    },
    {
      name: "Telegram",
      icon: <Send className="h-5 w-5" />,
      href: `https://t.me/share/url?url=${enc(SHARE_URL)}&text=${enc(SHARE_TEXT)}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-500 via-orange-500 to-rose-500 px-6 pt-8 pb-14 text-white">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30">
              <Heart className="h-6 w-6 fill-white" />
            </div>
            <div>
              <DialogHeader className="text-left space-y-0.5">
                <DialogTitle className="text-xl font-display font-bold text-white">Invita a tu comunidad</DialogTitle>
                <DialogDescription className="text-white/90">
                  Mientras más vecinos usen PatiTas, más mascotas se reencuentran.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-0 pb-6 -mt-8">
          <div className="rounded-2xl bg-card border shadow-lg p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {channels.map((ch) => (
                <a
                  key={ch.name}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full transition text-white ${ch.color}`}>
                    {ch.icon}
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition">{ch.name}</span>
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <Input value={SHARE_URL} readOnly className="text-xs bg-muted/50 font-mono" />
              <Button variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>

            <Button variant="secondary" onClick={nativeShare} className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Más opciones
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
