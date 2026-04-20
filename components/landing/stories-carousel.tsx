"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { ChevronLeft, ChevronRight, Heart, Quote, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

export type Story = {
  id: string;
  petName: string;
  areaLabel: string;
  daysLost: number;
  imageUrl: string | null;
  quote: string;
  authorName: string;
};

export function StoriesCarousel({ stories }: { stories: Story[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || stories.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % stories.length), 5500);
    return () => clearInterval(t);
  }, [paused, stories.length]);

  if (stories.length === 0) return null;

  function go(delta: number) {
    setIndex((i) => (i + delta + stories.length) % stories.length);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
        touchX.current = null;
        setTimeout(() => setPaused(false), 4000);
      }}
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>

      {stories.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg ring-1 ring-black/5 text-foreground hover:bg-white transition md:left-3"
            aria-label="Historia anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg ring-1 ring-black/5 text-foreground hover:bg-white transition md:right-3"
            aria-label="Siguiente historia"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {stories.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "bg-white w-8" : "bg-white/50 w-1.5 hover:bg-white/70"
                )}
                aria-label={`Ir a historia ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div className="w-full shrink-0 grid md:grid-cols-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white min-h-[420px]">
      <div className="relative order-2 md:order-1 p-6 md:p-10 flex flex-col justify-center gap-4">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3),transparent_55%)]" />
        <div className="relative space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ring-white/30">
            <PartyPopper className="h-3 w-3" />
            Reencuentro real
          </div>
          <div>
            <Quote className="h-8 w-8 text-white/40 -ml-1" />
            <blockquote className="text-lg md:text-xl font-medium leading-snug">
              {story.quote}
            </blockquote>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div className="text-sm">
              <div className="font-semibold">{story.authorName}</div>
              <div className="text-white/80 text-xs">
                {story.petName} · {story.areaLabel} · {story.daysLost} {story.daysLost === 1 ? "día" : "días"} perdid@
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative order-1 md:order-2 min-h-[260px] md:min-h-[420px]">
        {story.imageUrl ? (
          <Image
            src={optimizedUrl(story.imageUrl, 900)}
            alt={story.petName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50">🐾</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-emerald-900/30 md:to-emerald-900/20" />
        <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-lg ring-1 ring-emerald-200">
          ❤️ En casa
        </div>
      </div>
    </div>
  );
}
