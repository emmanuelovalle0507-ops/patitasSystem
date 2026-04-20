import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

/**
 * Cliente Supabase con service_role — solo usar en server (API routes / server actions).
 * Permite subir y borrar archivos saltándose RLS.
 */
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env no configurado");
  return createClient(url, key, { auth: { persistSession: false } });
}

export const STORAGE_BUCKET = "patitas-photos";

/**
 * Sube un Buffer/Uint8Array al bucket. Retorna el path y una URL pública.
 */
export async function uploadImage(
  bytes: Uint8Array,
  mime: string,
  opts: { folder?: string; ext?: string } = {}
): Promise<{ path: string; url: string; width?: number; height?: number }> {
  const supabase = admin();
  const ext = opts.ext || mime.split("/")[1] || "jpg";
  const folder = opts.folder || "posts";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });

  if (error) throw new Error(`storage.upload: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Borra un archivo del bucket. Silencioso si no existe. */
export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  try {
    const supabase = admin();
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  } catch (e) {
    console.error("[storage.delete]", e);
  }
}

/**
 * URL transformada por Supabase (resize + webp). Requiere que el bucket
 * tenga transformations activadas (plan free lo permite).
 */
export function optimizedUrl(url: string, width = 800, quality = 80): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/object/public/", "/render/image/public/");
  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${width}&quality=${quality}&resize=contain`;
}
