import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/post/status-badge";
import {
  Bell, MessageCircle, PlusCircle, Printer, Heart, MessageSquare,
  MapPin, CheckCircle2, AlertCircle, ArrowRight,
  Lightbulb, UserPlus, HelpCircle, PawPrint,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { AssistantQuickCard } from "@/components/ai/assistant-quick";
import { HowItWorksModal } from "@/components/dashboard/how-it-works-modal";
import { ReportTipsModal } from "@/components/dashboard/report-tips-modal";
import { InviteModal } from "@/components/dashboard/invite-modal";

export const metadata = { title: "Inicio" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function todayLabel() {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  const [
    myPosts,
    unread,
    recentNearby,
    posterCount,
    latestLostPost,
    activeCount,
    foundCount,
    communityCount,
  ] = await Promise.all([
    db.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        images: { take: 1 },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.post.findMany({
      where: { kind: "LOST", status: "LOST", NOT: { authorId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: { take: 1 } },
    }),
    db.poster.count({ where: { userId: user.id } }),
    db.post.findFirst({
      where: { authorId: user.id, kind: "LOST" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
    db.post.count({ where: { authorId: user.id, status: "LOST" } }),
    db.post.count({ where: { authorId: user.id, status: "FOUND" } }),
    db.post.count({ where: { status: "LOST", kind: "LOST" } }),
  ]);
  const postersHref = latestLostPost ? `/posters/${latestLostPost.id}` : "/posts/new";
  const hasPosts = myPosts.length > 0;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative -mx-4 md:-mx-8 overflow-hidden border-b bg-gradient-to-br from-brand-50 via-orange-50 to-amber-50">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.2),transparent_40%),radial-gradient(circle_at_85%_70%,rgba(244,114,182,0.18),transparent_40%)]" />
        <div className="pointer-events-none absolute -right-8 -bottom-10 text-[180px] opacity-[0.06]" aria-hidden>🐾</div>
        <div className="relative mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 md:h-16 md:w-16 ring-4 ring-white shadow-sm">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback className="bg-brand-600 text-white text-lg font-bold">
                  {firstName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700/90 capitalize">{todayLabel()}</p>
                <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {greeting()}, {firstName} 👋
                </h1>
                <p className="text-sm text-slate-700/80 mt-0.5">
                  {hasPosts
                    ? `Tienes ${activeCount} reporte${activeCount === 1 ? "" : "s"} activo${activeCount === 1 ? "" : "s"}.`
                    : "¿Primera vez aquí? Te ayudamos a reportar tu primera mascota."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <HowItWorksModal
                trigger={
                  <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Cómo funciona
                  </Button>
                }
              />
              <ReportTipsModal
                trigger={
                  <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Consejos
                  </Button>
                }
              />
            </div>
          </div>

          {/* KPI row inside hero */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <StatCard
              tone="rose"
              icon={AlertCircle}
              label="Activos"
              value={activeCount}
              hint="Tus reportes perdidos"
            />
            <StatCard
              tone="emerald"
              icon={CheckCircle2}
              label="Encontradas"
              value={foundCount}
              hint="Reencuentros ✨"
            />
            <StatCard
              tone="amber"
              icon={Bell}
              label="Alertas"
              value={unread}
              hint="Sin leer"
            />
            <StatCard
              tone="brand"
              icon={Printer}
              label="Carteles"
              value={posterCount}
              hint="Generados"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-8 px-1 md:px-0">
        {/* QUICK ACTIONS */}
        <section>
          <h2 className="sr-only">Acciones rápidas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PrimaryAction
              href="/posts/new"
              icon={PlusCircle}
              title="Reportar"
              subtitle="Mascota perdida"
              gradient="from-brand-500 to-orange-500"
            />
            <ActionCard
              href={postersHref}
              icon={Printer}
              title="Mis carteles"
              subtitle={latestLostPost ? (posterCount > 0 ? `${posterCount} generados` : "Crear ahora") : "Reportar primero"}
              tone="brand"
            />
            <ActionCard
              href="/notifications"
              icon={Bell}
              title="Alertas"
              subtitle={unread > 0 ? `${unread} sin leer` : "Al día"}
              tone="amber"
              badge={unread > 0 ? (unread > 9 ? "9+" : String(unread)) : undefined}
            />
            <ActionCard
              href="/assistant"
              icon={MessageCircle}
              title="Asistente IA"
              subtitle="Pregunta algo"
              tone="violet"
            />
          </div>
        </section>

        {/* ASSISTANT */}
        <AssistantQuickCard favoritePets={user.favoritePets} userName={user.name} />

        {/* MIS PUBLICACIONES */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold">Mis publicaciones</h2>
              <p className="text-xs text-muted-foreground">Todo lo que has compartido con la comunidad.</p>
            </div>
            <Link href="/feed" className="text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 shrink-0">
              Ver feed
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!hasPosts ? (
            <EmptyPosts />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myPosts.map((p) => (
                <article key={p.id} className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <Link href={`/posts/${p.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full bg-muted">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <PawPrint className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between">
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <h3 className="font-semibold text-sm truncate drop-shadow">{p.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" />{p._count.likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />{p._count.comments}
                        </span>
                      </div>
                      <span>{relativeTime(p.createdAt)}</span>
                    </div>
                  </Link>
                  {p.kind === "LOST" && p.status === "LOST" && (
                    <Link
                      href={`/posters/${p.id}`}
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-brand-600/95 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-white shadow-md ring-1 ring-white/20 hover:bg-brand-700 transition"
                      title="Generar cartel"
                    >
                      <Printer className="h-3 w-3" />
                      Cartel
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CERCA DE TI */}
        {recentNearby.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-600" />
                  Perdidos cerca de ti
                </h2>
                <p className="text-xs text-muted-foreground">{communityCount} reporte{communityCount === 1 ? "" : "s"} activo{communityCount === 1 ? "" : "s"} en la comunidad.</p>
              </div>
              <Link href="/feed?kind=LOST" className="text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 shrink-0">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentNearby.map((p) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square w-full bg-muted">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <PawPrint className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/95 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        <AlertCircle className="h-3 w-3" />
                        Perdida
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                      <p className="text-xs font-semibold truncate drop-shadow">{p.title}</p>
                      <p className="text-[10px] opacity-80">{relativeTime(p.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COMMUNITY INVITE */}
        <section className="rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 p-5 md:p-7 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-6 -top-6 text-[120px] opacity-10" aria-hidden>💛</div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Heart className="h-6 w-6 fill-white" />
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl font-bold">Cada vecino cuenta</h3>
                <p className="text-sm text-slate-700/80 max-w-md">
                  Invita a tu familia y vecinos. Mientras más ojos en la zona, más mascotas se reencuentran con su familia.
                </p>
              </div>
            </div>
            <InviteModal
              trigger={
                <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shrink-0">
                  <UserPlus className="h-4 w-4" />
                  Invitar amigos
                </Button>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Small internal components ---

type StatTone = "rose" | "emerald" | "amber" | "brand" | "violet";
const TONE: Record<StatTone, { icon: string; value: string; bg: string }> = {
  rose:    { icon: "bg-rose-100 text-rose-600 ring-rose-200",        value: "text-rose-700",    bg: "bg-white/70" },
  emerald: { icon: "bg-emerald-100 text-emerald-600 ring-emerald-200", value: "text-emerald-700", bg: "bg-white/70" },
  amber:   { icon: "bg-amber-100 text-amber-600 ring-amber-200",      value: "text-amber-700",   bg: "bg-white/70" },
  brand:   { icon: "bg-brand-100 text-brand-600 ring-brand-200",      value: "text-brand-700",   bg: "bg-white/70" },
  violet:  { icon: "bg-violet-100 text-violet-600 ring-violet-200",   value: "text-violet-700",  bg: "bg-white/70" },
};

function StatCard({
  icon: Icon, label, value, hint, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  tone: StatTone;
}) {
  const t = TONE[tone];
  return (
    <div className={`rounded-2xl border ${t.bg} backdrop-blur px-3 py-3 md:px-4 md:py-3.5 flex items-center gap-3 shadow-sm`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${t.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={`font-display text-xl md:text-2xl font-black leading-none ${t.value}`}>{value}</p>
        <p className="text-[11px] font-semibold text-slate-900 mt-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{hint}</p>
      </div>
    </div>
  );
}

function PrimaryAction({
  href, icon: Icon, title, subtitle, gradient,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5`}
    >
      <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-25">
        <Icon className="h-20 w-20" />
      </div>
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/30 mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-bold text-base">{title}</div>
        <div className="text-xs text-white/90">{subtitle}</div>
        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition" />
      </div>
    </Link>
  );
}

type ActionTone = "brand" | "amber" | "violet" | "emerald";
const ACTION_TONE: Record<ActionTone, { icon: string; hover: string }> = {
  brand:   { icon: "bg-brand-100 text-brand-600",     hover: "hover:border-brand-300" },
  amber:   { icon: "bg-amber-100 text-amber-600",     hover: "hover:border-amber-300" },
  violet:  { icon: "bg-violet-100 text-violet-600",   hover: "hover:border-violet-300" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", hover: "hover:border-emerald-300" },
};

function ActionCard({
  href, icon: Icon, title, subtitle, tone, badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  tone: ActionTone;
  badge?: string;
}) {
  const t = ACTION_TONE[tone];
  return (
    <Link
      href={href}
      className={`group relative rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 ${t.hover}`}
    >
      <div className="flex items-center gap-3">
        <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-5 w-5" />
          {badge && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {badge}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{title}</div>
          <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
      </div>
    </Link>
  );
}

function EmptyPosts() {
  return (
    <div className="rounded-2xl border border-dashed bg-gradient-to-br from-brand-50/50 to-transparent p-8 md:p-10 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <PawPrint className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold">Aún no has publicado nada</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Reporta a tu mascota perdida o comparte con la comunidad. Es rápido y completamente gratis.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild className="gap-2 bg-brand-600 hover:bg-brand-700">
          <Link href="/posts/new">
            <PlusCircle className="h-4 w-4" />
            Crear primer reporte
          </Link>
        </Button>
        <ReportTipsModal
          trigger={
            <Button variant="outline" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Ver consejos primero
            </Button>
          }
        />
      </div>
    </div>
  );
}
