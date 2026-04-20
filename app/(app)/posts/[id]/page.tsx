import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl, formatDate, relativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/post/status-badge";
import { CommentsSection } from "@/components/post/comments-section";
import { LikeButton } from "@/components/post/like-button";
import { ImageGallery } from "@/components/post/image-lightbox";
import { ContactOwnerModal } from "@/components/post/contact-owner-modal";
import { ShareModal } from "@/components/post/share-modal";
import { SearchPlanCard } from "@/components/post/search-plan-card";
import { OwnerActionBar } from "@/components/post/owner-action-bar";
import { OwnerContactPreview } from "@/components/post/owner-contact-preview";
import { MapPin, Calendar, ArrowLeft, Heart, MessageSquare, Share2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapViewClient = dynamic(() => import("@/components/map/map-picker").then(m => m.MapView), { ssr: false });

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params) {
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { images: { take: 1 }, author: { select: { name: true } } },
  });
  if (!post) return {};
  const image = post.images[0]?.url;
  const description = post.description.slice(0, 160);
  const ogImage = image ? absoluteUrl(`/api/og/${post.id}`) : null;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Params) {
  const me = await getCurrentUser();
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      pet: true,
      author: {
        select: {
          id: true, name: true, avatarUrl: true, email: true,
          phone: true, whatsapp: true,
          showPhone: true, showWhatsapp: true, showEmail: true,
        },
      },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!post) notFound();

  const liked = me ? !!(await db.like.findUnique({ where: { postId_userId: { postId: post.id, userId: me.id } } })) : false;
  const isOwner = me?.id === post.authorId;
  const url = absoluteUrl(`/posts/${post.id}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al feed
        </Link>
        <StatusBadge status={post.status} />
      </div>

      {/* Panel del dueño: compartir, cambiar estado y cartel */}
      {isOwner && post.kind === "LOST" && (
        <OwnerActionBar
          postId={post.id}
          status={post.status}
          url={url}
          title={post.title}
          text={post.description.slice(0, 140)}
        />
      )}

      {/* Galería con lightbox */}
      {post.images.length > 0 && (
        <ImageGallery
          images={post.images}
          alt={post.title}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <Avatar className="h-8 w-8 border">
            {post.author.avatarUrl && <AvatarImage src={post.author.avatarUrl} />}
            <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-foreground">{post.author.name}</span>
            <span className="mx-1.5">·</span>
            <span>{relativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post._count.likes}</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post._count.comments} comentarios</span>
        {post.areaLabel && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{post.areaLabel}</span>}
      </div>

      {/* Descripción + datos de mascota */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="whitespace-pre-wrap leading-relaxed">{post.description}</p>
          {post.pet && (
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg bg-muted/40 p-4 text-sm">
              <Info label="Especie" value={petLabel(post.pet.kind)} />
              {post.pet.breed && <Info label="Raza" value={post.pet.breed} />}
              {post.pet.color && <Info label="Color" value={post.pet.color} />}
              {post.pet.ageYears && <Info label="Edad" value={`${post.pet.ageYears} años`} />}
              {post.lostAt && <Info label="Perdida el" value={formatDate(post.lostAt)} icon={<Calendar className="h-3 w-3"/>} />}
              {post.areaLabel && <Info label="Zona" value={post.areaLabel} icon={<MapPin className="h-3 w-3"/>} />}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Mapa */}
      {post.lat && post.lng && (
        <Card>
          <CardHeader><CardTitle className="text-base">Ubicación aproximada</CardTitle></CardHeader>
          <CardContent><MapViewClient lat={post.lat} lng={post.lng} height={280} /></CardContent>
        </Card>
      )}

      {/* Plan de búsqueda con IA — solo autor + LOST activo */}
      {isOwner && post.kind === "LOST" && post.status !== "FOUND" && (
        <SearchPlanCard
          postId={post.id}
          initialPlan={post.searchPlan}
          initialGeneratedAt={post.searchPlanAt ? post.searchPlanAt.toISOString() : null}
        />
      )}

      {/* Barra de acciones para visitantes — Compartir destacado */}
      {!isOwner && (
        <div className="flex flex-wrap items-center gap-2">
          {me && <LikeButton postId={post.id} initialLiked={liked} initialCount={post._count.likes} />}
          <ContactOwnerModal author={post.author} petName={post.pet?.name ?? null} />
          <ShareModal
            url={url}
            title={post.title}
            text={post.description.slice(0, 140)}
            trigger={
              <Button className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow">
                <Share2 className="h-4 w-4" />
                Compartir para ayudar
              </Button>
            }
          />
        </div>
      )}

      {/* Vista para el dueño — datos de contacto visibles + like */}
      {isOwner && (
        <>
          <OwnerContactPreview author={post.author} />
          <div className="flex flex-wrap items-center gap-2">
            {me && <LikeButton postId={post.id} initialLiked={liked} initialCount={post._count.likes} />}
          </div>
        </>
      )}

      {/* Comentarios */}
      <CommentsSection
        postId={post.id}
        comments={post.comments.map(c => ({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt,
          authorId: c.authorId,
          author: { name: c.author.name, avatarUrl: c.author.avatarUrl },
        }))}
        canComment={!!me}
        currentUserId={me?.id ?? null}
        canModerate={me?.role === "MODERATOR" || me?.role === "ADMIN"}
      />
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function petLabel(k: string) {
  const m: Record<string, string> = { DOG: "Perro", CAT: "Gato", BIRD: "Ave", REPTILE: "Reptil", RODENT: "Roedor", OTHER: "Otra" };
  return m[k] ?? k;
}
