import { ImageResponse } from "@vercel/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Genera dinámicamente la imagen de preview social (1200x630) para un post.
 * Se usa en <meta property="og:image">.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { images: { take: 1 }, pet: true, author: true },
  });
  if (!post) return new Response("Not found", { status: 404 });

  const img = post.images[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 32, color: "#C2410C", fontWeight: 800 }}>
          🐾 PatiTas
        </div>
        <div style={{ display: "flex", flex: 1, gap: 40, alignItems: "center", marginTop: 30 }}>
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" width={420} height={420} style={{ borderRadius: 24, objectFit: "cover", border: "8px solid white" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
            <div style={{ fontSize: 24, color: "#DC2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
              {post.status === "LOST" ? "🚨 Se busca" : post.status === "FOUND" ? "❤️ Encontrado" : "Mascota"}
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#1F2937", lineHeight: 1.1 }}>{post.title}</div>
            <div style={{ fontSize: 28, color: "#4B5563", lineHeight: 1.4 }}>
              {post.description.slice(0, 180)}{post.description.length > 180 ? "..." : ""}
            </div>
            <div style={{ fontSize: 24, color: "#C2410C", marginTop: 12 }}>
              📍 {post.areaLabel ?? "Tecámac, Edo. Méx."}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
