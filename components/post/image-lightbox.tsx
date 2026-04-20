"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: { id: string; url: string }[];
  alt: string;
};

function optimizeUrl(url: string, width = 800, quality = 80): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/object/public/", "/render/image/public/");
  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${width}&quality=${quality}&resize=contain`;
}

export function ImageGallery({ images, alt }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  function openAt(i: number) {
    setCurrent(i);
    setOpen(true);
  }

  function prev() { setCurrent((c) => (c - 1 + images.length) % images.length); }
  function next() { setCurrent((c) => (c + 1) % images.length); }

  return (
    <>
      {/* Grid de miniaturas */}
      <div className="grid gap-2 sm:grid-cols-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openAt(i)}
            className={cn(
              "overflow-hidden rounded-xl border bg-muted cursor-zoom-in transition-all hover:ring-2 hover:ring-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
              i === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-square"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeUrl(img.url, 900)}
              alt={`${alt} ${i + 1}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden bg-black/95 border-none gap-0">
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeUrl(images[current]?.url ?? "", 1400)}
              alt={`${alt} ${current + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-2 text-white hover:bg-white/40 transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-2 text-white hover:bg-white/40 transition-colors"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Indicador */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === current ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                    )}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
