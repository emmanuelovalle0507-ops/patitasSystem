import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PosterPDF, type PosterTemplate } from "@/components/poster/poster-pdf";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

type Overrides = {
  postId?: string;
  template?: PosterTemplate;
  size?: "LETTER" | "A4";

  headline?: string;
  petName?: string;
  reward?: string | null;
  urgent?: boolean;
  description?: string;
  areaLabel?: string | null;
  lostAt?: string | null;
  imageUrl?: string | null;

  breed?: string | null;
  colorText?: string | null;
  sizeText?: string | null;
  gender?: string | null;
  ageText?: string | null;
  microchip?: string | null;
  collar?: string | null;
  marks?: string | null;
  behavior?: string | null;
  safetyNote?: string | null;

  contactName?: string;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;

  qrDataUrl?: string | null;
  qrLabel?: string | null;
  accentColor?: string | null;
};

function clamp(v: string | undefined | null, max: number, fallback: string): string {
  return v == null ? fallback : String(v).slice(0, max);
}

function optClamp(v: string | undefined | null, max: number): string | null {
  if (v == null || v === "") return null;
  return String(v).slice(0, max);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = applyRateLimit(req, "posterPdf", user.id);
  if (limited) return limited;

  let body: Overrides;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const postId = body.postId;
  if (!postId) return NextResponse.json({ error: "postId requerido" }, { status: 400 });

  const post = await db.post.findUnique({
    where: { id: postId },
    include: { images: true, pet: true, author: true },
  });
  if (!post || post.authorId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const template: PosterTemplate = body.template === "bold" || body.template === "minimal" ? body.template : "classic";
  const size: "LETTER" | "A4" = body.size === "A4" ? "A4" : "LETTER";

  const allowedImages = new Set(post.images.map((i) => i.url));
  const requestedImage = body.imageUrl === null ? null
    : body.imageUrl && allowedImages.has(body.imageUrl) ? body.imageUrl
    : post.images[0]?.url ?? null;

  // Fetch image server-side and pass as Buffer to @react-pdf. In 4.x, passing
  // { data: Buffer, format } is the most reliable path — raw remote fetches
  // from inside the renderer fail silently on various hosts, and data-URI
  // strings can choke the base64 decoder on larger photos.
  let imageSrc: { data: Buffer; format: "jpg" | "png" } | null = null;
  if (requestedImage) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const imgRes = await fetch(requestedImage, {
        signal: controller.signal,
        headers: { accept: "image/jpeg,image/png,image/*;q=0.8" },
      });
      clearTimeout(timeout);
      if (!imgRes.ok) {
        logger.warn({ status: imgRes.status, requestedImage }, "poster image fetch non-2xx");
      } else {
        const ct = (imgRes.headers.get("content-type") || "").toLowerCase();
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.byteLength === 0) {
          logger.warn({ requestedImage }, "poster image fetch returned empty body");
        } else if (buf.byteLength > 12 * 1024 * 1024) {
          logger.warn({ bytes: buf.byteLength, requestedImage }, "poster image too large, skipping");
        } else {
          // Detect PNG by magic bytes first (more reliable than content-type)
          const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
          const isJpg = buf[0] === 0xFF && buf[1] === 0xD8;
          const format: "jpg" | "png" = isPng ? "png" : isJpg ? "jpg" : ct.includes("png") ? "png" : "jpg";
          imageSrc = { data: buf, format };
          logger.info({ bytes: buf.byteLength, format, requestedImage }, "poster image loaded");
        }
      }
    } catch (err) {
      logger.warn({ err: String(err), requestedImage }, "poster image fetch failed");
    }
  }

  const qrDataUrl = body.qrDataUrl && body.qrDataUrl.startsWith("data:image/") ? body.qrDataUrl : null;
  const accentColor = body.accentColor && /^#[0-9A-Fa-f]{6}$/.test(body.accentColor) ? body.accentColor : null;

  db.poster.create({ data: { postId, userId: user.id, template } })
    .catch((err) => logger.warn({ err, postId, userId: user.id }, "poster analytics insert failed"));

  const element = React.createElement(PosterPDF, {
    template,
    size,
    data: {
      headline: clamp(body.headline, 40, "SE BUSCA"),
      petName: clamp(body.petName, 40, post.pet?.name ?? "Mascota"),
      reward: optClamp(body.reward ?? null, 60),
      urgent: !!body.urgent,
      description: clamp(body.description, 500, post.description),
      areaLabel: body.areaLabel !== undefined ? optClamp(body.areaLabel, 120) : post.areaLabel,
      lostAt: body.lostAt !== undefined ? body.lostAt || null : post.lostAt ? post.lostAt.toISOString().slice(0, 10) : null,
      imageSrc,

      breed: optClamp(body.breed ?? null, 60),
      colorText: optClamp(body.colorText ?? null, 60),
      sizeText: optClamp(body.sizeText ?? null, 20),
      gender: optClamp(body.gender ?? null, 20),
      ageText: optClamp(body.ageText ?? null, 30),
      microchip: optClamp(body.microchip ?? null, 30),
      collar: optClamp(body.collar ?? null, 80),
      marks: optClamp(body.marks ?? null, 140),
      behavior: optClamp(body.behavior ?? null, 140),
      safetyNote: optClamp(body.safetyNote ?? null, 140),

      contactName: clamp(body.contactName, 60, post.author.name),
      contactPhone: body.contactPhone !== undefined ? optClamp(body.contactPhone, 30) : post.author.showPhone ? post.author.phone : null,
      contactWhatsapp: body.contactWhatsapp !== undefined ? optClamp(body.contactWhatsapp, 30) : post.author.showWhatsapp ? post.author.whatsapp : null,
      contactEmail: body.contactEmail !== undefined ? optClamp(body.contactEmail, 120) : post.author.showEmail ? post.author.email : null,

      qrDataUrl,
      qrLabel: optClamp(body.qrLabel ?? null, 40) ?? "Escanea para ver",
      accentColor,
    },
  });

  const stream = await renderToStream(element as any);
  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cartel-${post.pet?.name ?? post.id}.pdf"`,
    },
  });
}
