import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

/**
 * Borra una imagen del bucket de Supabase Storage.
 * `publicId` es el path dentro del bucket (ej. `users/<uid>/<uuid>.jpg`).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { publicId } = await req.json();
  if (!publicId) return NextResponse.json({ error: "publicId requerido" }, { status: 400 });

  // Sólo permitir borrar archivos del propio usuario (su folder)
  if (!publicId.startsWith(`users/${user.id}/`)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await deleteImage(publicId);
  return NextResponse.json({ ok: true });
}
