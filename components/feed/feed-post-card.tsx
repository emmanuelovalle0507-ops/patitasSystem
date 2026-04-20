import Link from "next/link";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/post/status-badge";
import { Heart, MessageCircle, MapPin, Flame, Dog, Cat, Bird, Squirrel, PawPrint } from "lucide-react";
import type { PetKind, PostStatus, PostKind } from "@prisma/client";
import { cn } from "@/lib/utils";

type Props = {
  post: {
    id: string;
    title: string;
    description: string;
    status: PostStatus;
    kind: PostKind;
    areaLabel: string | null;
    createdAt: Date;
    images: { url: string }[];
    author: { name: string; avatarUrl: string | null };
    pet?: { kind: PetKind; name: string; breed: string | null } | null;
    _count?: { likes: number; comments: number };
  };
};

const PET_ICON: Record<PetKind, any> = {
  DOG: Dog,
  CAT: Cat,
  BIRD: Bird,
  REPTILE: Squirrel,
  RODENT: Squirrel,
  OTHER: PawPrint,
};

export function FeedPostCard({ post }: Props) {
  const img = post.images[0]?.url;
  const PetIcon = post.pet ? PET_ICON[post.pet.kind] : PawPrint;

  const hoursOld = (Date.now() - new Date(post.createdAt).getTime()) / 36e5;
  const isUrgent = post.kind === "LOST" && post.status === "LOST" && hoursOld < 24;
  const likes = post._count?.likes ?? 0;
  const comments = post._count?.comments ?? 0;

  return (
    <Link
      href={`/posts/${post.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition",
        "hover:shadow-lg hover:-translate-y-0.5",
        isUrgent && "ring-2 ring-rose-400/60 ring-offset-1 ring-offset-background"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {img ? (
          <Image
            src={optimizedUrl(img, 640)}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-60">🐾</div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          {isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md animate-pulse">
              <Flame className="h-3 w-3" />
              Urgente
            </span>
          )}
          <StatusBadge status={post.status} />
        </div>

        {post.pet && (
          <div className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md ring-1 ring-black/5">
            <PetIcon className="h-4 w-4" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <div className="flex items-center gap-1.5 text-[11px] font-medium drop-shadow">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{post.areaLabel ?? "Tecámac"}</span>
            <span className="opacity-70">·</span>
            <span className="opacity-90">{relativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3.5 space-y-2">
        <div>
          <h3 className="font-semibold leading-tight line-clamp-1 group-hover:text-brand-700 transition">
            {post.title}
          </h3>
          {post.pet?.breed && (
            <p className="text-[11px] text-muted-foreground">{post.pet.breed}</p>
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{post.description}</p>

        <div className="flex items-center justify-between pt-1.5 border-t">
          <div className="flex items-center gap-2 min-w-0">
            {post.author.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-brand-400 to-rose-400 text-[10px] font-bold text-white flex items-center justify-center">
                {post.author.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="text-[11px] text-muted-foreground truncate">{post.author.name}</span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground shrink-0">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
