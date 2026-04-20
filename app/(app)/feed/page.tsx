import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FeedPostCard } from "@/components/feed/feed-post-card";
import { FeedHero } from "@/components/feed/feed-hero";
import { FeedFilterBar } from "@/components/feed/feed-filter-bar";
import { UrgentStrip } from "@/components/feed/urgent-strip";
import { ReunitedStrip } from "@/components/feed/reunited-strip";
import { Button } from "@/components/ui/button";
import { PlusCircle, SearchX, Sparkles, PawPrint } from "lucide-react";
import type { Prisma, PetKind } from "@prisma/client";

export const metadata = { title: "Feed" };

type SP = {
  t?: string;
  q?: string;
  k?: string;
  sort?: string;
  status?: string;
};

const SPECIES_MAP: Record<string, PetKind[]> = {
  DOG: ["DOG"],
  CAT: ["CAT"],
  BIRD: ["BIRD"],
  OTHER: ["REPTILE", "RODENT", "OTHER"],
};

function buildOrderBy(sort: string): Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
      return [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
    case "commented":
      return [{ comments: { _count: "desc" } }, { createdAt: "desc" }];
    case "urgent":
    case "recent":
    default:
      return { createdAt: "desc" };
  }
}

export default async function FeedPage({ searchParams }: { searchParams: SP }) {
  const tab = searchParams.t === "community" ? "community" : "lost";
  const q = (searchParams.q ?? "").trim();
  const k = searchParams.k ?? "";
  const sort = searchParams.sort ?? "recent";
  const statusFilter = searchParams.status ?? "all";

  const kind = tab === "lost" ? "LOST" : "COMMUNITY";

  const where: Prisma.PostWhereInput = { kind };

  if (tab === "lost") {
    if (statusFilter === "found") where.status = "FOUND";
    else if (statusFilter === "active") where.status = { in: ["LOST", "IN_PROGRESS"] };
  }

  if (k && SPECIES_MAP[k]) {
    where.pet = { kind: { in: SPECIES_MAP[k] } };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { areaLabel: { contains: q, mode: "insensitive" } },
      { pet: { is: { name: { contains: q, mode: "insensitive" } } } },
      { pet: { is: { breed: { contains: q, mode: "insensitive" } } } },
    ];
  }

  if (sort === "urgent" && tab === "lost") {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    where.createdAt = { gte: since };
    if (!where.status) where.status = { in: ["LOST", "IN_PROGRESS"] };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const last24h = new Date(Date.now() - 24 * 3600 * 1000);

  const [user, posts, urgent, reunited, stats, communityCount, newToday] = await Promise.all([
    getCurrentUser(),
    db.post.findMany({
      where,
      orderBy: buildOrderBy(sort),
      take: 30,
      include: {
        images: { take: 1 },
        author: { select: { name: true, avatarUrl: true } },
        pet: { select: { kind: true, name: true, breed: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    tab === "lost" && !q && !k && sort === "recent" && statusFilter === "all"
      ? db.post.findMany({
          where: { kind: "LOST", status: { in: ["LOST", "IN_PROGRESS"] }, createdAt: { gte: last24h } },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, title: true, areaLabel: true, createdAt: true, images: { take: 1, select: { url: true } } },
        })
      : Promise.resolve([]),
    tab === "lost" && !q && !k && sort === "recent" && statusFilter === "all"
      ? db.post.findMany({
          where: { kind: "LOST", status: "FOUND" },
          orderBy: { updatedAt: "desc" },
          take: 4,
          select: { id: true, title: true, areaLabel: true, updatedAt: true, images: { take: 1, select: { url: true } } },
        })
      : Promise.resolve([]),
    db.post.groupBy({
      by: ["status"],
      where: { kind: "LOST" },
      _count: true,
    }),
    db.post.count({ where: { kind: "COMMUNITY" } }),
    db.post.count({ where: { createdAt: { gte: startOfDay } } }),
  ]);

  const activeCount = stats
    .filter((s) => s.status === "LOST" || s.status === "IN_PROGRESS")
    .reduce((acc, s) => acc + s._count, 0);
  const foundCount = stats.find((s) => s.status === "FOUND")?._count ?? 0;

  const personalized =
    tab === "lost" && user && user.favoritePets.length > 0 && !q && !k
      ? posts.filter((p) => p.pet && user.favoritePets.includes(p.pet.kind)).slice(0, 4)
      : [];

  const hasActiveFilter = Boolean(q || k || sort !== "recent" || statusFilter !== "all");

  return (
    <div className="mx-auto max-w-5xl">
      <FeedHero
        tab={tab}
        active={activeCount}
        reunited={foundCount}
        community={communityCount}
        newToday={newToday}
      />

      <div className="space-y-5 pb-12">
        <div className="flex items-center justify-center gap-1.5 rounded-full border bg-card p-1 w-full max-w-xs mx-auto shadow-sm">
          <TabPill href="/feed?t=lost" active={tab === "lost"} label="Perdidos" emoji="🔍" />
          <TabPill href="/feed?t=community" active={tab === "community"} label="Comunidad" emoji="💬" />
        </div>

        <FeedFilterBar tab={tab} />

        {tab === "lost" && !hasActiveFilter && urgent.length > 0 && (
          <UrgentStrip posts={urgent} />
        )}

        {personalized.length > 0 && (
          <section className="rounded-2xl border bg-gradient-to-br from-brand-50 to-amber-50 dark:from-brand-950/30 dark:to-amber-950/20 p-4 sm:p-5 ring-1 ring-brand-200/60 dark:ring-brand-900/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold">Para ti, {user?.name.split(" ")[0] ?? "amigo"}</h2>
                <p className="text-xs text-muted-foreground">Según las mascotas que sigues</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {personalized.map((p) => (
                <FeedPostCard key={p.id} post={p as any} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-base font-bold">
                {hasActiveFilter ? `${posts.length} resultado${posts.length === 1 ? "" : "s"}` : tab === "lost" ? "Reportes recientes" : "Publicaciones de la comunidad"}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {posts.length} {posts.length === 1 ? "publicación" : "publicaciones"}
            </span>
          </div>

          {posts.length === 0 ? (
            <EmptyState hasFilter={hasActiveFilter} tab={tab} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <FeedPostCard key={p.id} post={p as any} />
              ))}
            </div>
          )}
        </section>

        {tab === "lost" && !hasActiveFilter && reunited.length > 0 && (
          <ReunitedStrip posts={reunited} />
        )}
      </div>
    </div>
  );
}

function TabPill({ href, active, label, emoji }: { href: string; active: boolean; label: string; emoji: string }) {
  return (
    <Link
      href={href}
      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-center transition ${
        active
          ? "bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/30"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="mr-1">{emoji}</span>
      {label}
    </Link>
  );
}

function EmptyState({ hasFilter, tab }: { hasFilter: boolean; tab: "lost" | "community" }) {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        {hasFilter ? <SearchX className="h-6 w-6" /> : <PawPrint className="h-6 w-6" />}
      </div>
      <h3 className="font-display text-lg font-bold mb-1">
        {hasFilter ? "Sin resultados" : tab === "lost" ? "Aún no hay reportes" : "Aún no hay publicaciones"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        {hasFilter
          ? "No encontramos publicaciones con esos filtros. Prueba ajustando la búsqueda."
          : tab === "lost"
            ? "Sé el primero en reportar una mascota perdida y ayuda a la comunidad a encontrarla."
            : "Comparte un aviso, consejo o historia con la comunidad PatiTas."}
      </p>
      {!hasFilter && (
        <Button asChild className="bg-brand-600 hover:bg-brand-700 gap-2">
          <Link href="/posts/new">
            <PlusCircle className="h-4 w-4" />
            Crear publicación
          </Link>
        </Button>
      )}
    </div>
  );
}
