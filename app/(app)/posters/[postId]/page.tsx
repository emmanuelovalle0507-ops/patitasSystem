import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";
import { PosterGenerator } from "./generator";

export const metadata = { title: "Generar cartel" };

export default async function PosterPage({ params }: { params: { postId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const post = await db.post.findUnique({
    where: { id: params.postId },
    include: { images: true, pet: true, author: true },
  });
  if (!post) notFound();
  if (post.authorId !== user.id) redirect(`/posts/${post.id}`);

  return (
    <PosterGenerator
      post={{
        id: post.id,
        url: absoluteUrl(`/posts/${post.id}`),
        title: post.title,
        description: post.description,
        areaLabel: post.areaLabel,
        lostAt: post.lostAt ? post.lostAt.toISOString().slice(0, 10) : null,
        images: post.images.map((i) => i.url),
        petName: post.pet?.name ?? "Mascota",
        petKind: post.pet?.kind ?? "OTHER",
        petBreed: post.pet?.breed ?? null,
        petColor: post.pet?.color ?? null,
        petAgeYears: post.pet?.ageYears ?? null,
        author: {
          name: post.author.name,
          phone: post.author.showPhone ? post.author.phone : null,
          whatsapp: post.author.showWhatsapp ? post.author.whatsapp : null,
          email: post.author.showEmail ? post.author.email : null,
        },
      }}
    />
  );
}
