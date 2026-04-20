import Link from "next/link";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";
import { Flame, MapPin, ArrowRight } from "lucide-react";

type UrgentPost = {
  id: string;
  title: string;
  areaLabel: string | null;
  createdAt: Date;
  images: { url: string }[];
};

export function UrgentStrip({ posts }: { posts: UrgentPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="rounded-2xl border bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20 p-4 sm:p-5 ring-1 ring-rose-200/60 dark:ring-rose-900/40">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-rose-950 dark:text-rose-100">Urgentes cerca de ti</h2>
            <p className="text-xs text-rose-800/80 dark:text-rose-200/80">Reportados en las últimas 24 horas</p>
          </div>
        </div>
        <Link
          href="/feed?t=lost&sort=urgent"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="-mx-4 sm:-mx-5 px-4 sm:px-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-3 pb-1">
          {posts.map((p) => {
            const img = p.images[0]?.url;
            return (
              <Link
                key={p.id}
                href={`/posts/${p.id}`}
                className="group relative w-[180px] shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-rose-200 dark:ring-rose-900/60 shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                  {img ? (
                    <Image
                      src={optimizedUrl(img, 360)}
                      alt={p.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🐾</div>
                  )}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-rose-900/70 to-transparent h-16" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    <Flame className="h-3 w-3" />
                    {relativeTime(p.createdAt)}
                  </span>
                </div>
                <div className="p-2.5">
                  <div className="font-semibold text-sm truncate">{p.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {p.areaLabel ?? "Tecámac"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
