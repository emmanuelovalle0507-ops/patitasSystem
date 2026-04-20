import Link from "next/link";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { MapPin } from "lucide-react";

type Props = {
  post: {
    id: string;
    title: string;
    description: string;
    status: any;
    kind: any;
    areaLabel: string | null;
    createdAt: Date;
    images: { url: string }[];
    author: { name: string; avatarUrl: string | null };
    _count?: { likes: number; comments: number };
  };
};

export function PostCard({ post }: Props) {
  const img = post.images[0]?.url;
  return (
    <Link href={`/posts/${post.id}`} className="group block overflow-hidden rounded-xl border bg-card hover:shadow-md transition">
      {img && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={optimizedUrl(img, 600)}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold truncate">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.areaLabel ?? "Tecámac"}</span>
          <span>{relativeTime(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
