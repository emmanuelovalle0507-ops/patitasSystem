import Link from "next/link";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";
import { Heart, PartyPopper, ArrowRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  areaLabel: string | null;
  updatedAt: Date;
  images: { url: string }[];
};

export function ReunitedStrip({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20 p-4 sm:p-5 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <PartyPopper className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-emerald-950 dark:text-emerald-100">Reencuentros recientes</h2>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Mascotas que volvieron a casa gracias a la comunidad</p>
          </div>
        </div>
        <Link
          href="/feed?t=lost&status=found"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((p) => {
          const img = p.images[0]?.url;
          return (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-emerald-200 dark:ring-emerald-900/60 shadow-sm hover:shadow-md transition"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {img ? (
                  <Image
                    src={optimizedUrl(img, 400)}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🎉</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                  <Heart className="h-2.5 w-2.5 fill-current" />
                  ¡En casa!
                </span>
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-sm truncate">{p.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                  {p.areaLabel ?? "Tecámac"} · {relativeTime(p.updatedAt)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
