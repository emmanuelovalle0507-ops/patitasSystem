import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/storage";
import { moderatePetImage } from "@/lib/moderation";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Sube imagen a Supabase Storage y (opcional) modera con Vision.
 * Si la IA falla, NO aceptamos ciegamente: devolvemos la imagen marcada como
 * `pending_review` para que el caller (action) la grabe en PostImage.moderation.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = applyRateLimit(req, "upload", user.id);
  if (limited) return limited;

  const form = await req.formData();
  const file = form.get("file");
  const moderate = form.get("moderate") !== "false";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado (usa JPG, PNG o WebP)" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagen demasiado grande (máx 8 MB)" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.type.split("/")[1];

  const { path, url } = await uploadImage(bytes, file.type, { folder: `users/${user.id}`, ext });

  let moderation: { status: "passed" | "pending_review"; details?: unknown } = { status: "passed" };
  if (moderate) {
    try {
      const result = await moderatePetImage(url);
      if (!result.passed) {
        await deleteImage(path);
        return NextResponse.json({ error: result.reason || "La imagen no parece una mascota" }, { status: 422 });
      }
      moderation = { status: "passed", details: result };
    } catch (err) {
      logger.warn({ err, userId: user.id, path }, "moderation unavailable — marking pending_review");
      moderation = { status: "pending_review" };
    }
  }

  return NextResponse.json({ url, publicId: path, moderation });
}
