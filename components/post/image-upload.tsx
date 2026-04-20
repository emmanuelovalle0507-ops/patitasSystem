"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export type UploadedImage = { url: string; publicId: string; width?: number; height?: number };

type Props = {
  value: UploadedImage[];
  onChange: (imgs: UploadedImage[]) => void;
  max?: number;
  moderate?: boolean; // validar con IA que sea mascota
};

/**
 * Sube imágenes al endpoint `/api/upload` que las almacena en Supabase Storage.
 * El endpoint opcionalmente valida con Claude Vision que la foto sea de una mascota.
 */
export function ImageUpload({ value, onChange, max = 5, moderate = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const results: UploadedImage[] = [];
    for (const file of toUpload) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("moderate", String(moderate));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast(data?.error || "No se pudo subir la imagen", "error");
          continue;
        }
        results.push({ url: data.url, publicId: data.publicId });
      } catch (e: any) {
        toast(e?.message || "Error al subir imagen", "error");
      }
    }
    setUploading(false);
    if (results.length) onChange([...value, ...results]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(idx: number) {
    const img = value[idx];
    onChange(value.filter((_, i) => i !== idx));
    if (img?.publicId) {
      fetch("/api/images/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: img.publicId }) }).catch(()=>{});
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {value.map((img, i) => (
          <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image src={img.url} alt="" fill sizes="160px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow hover:bg-background"
              aria-label="Eliminar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:bg-accent disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-xs mt-1">{uploading ? "Subiendo..." : "Subir"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        {moderate ? "Solo fotos de mascotas. Validamos automáticamente con IA." : "Máximo " + max + " imágenes."}
      </p>
    </div>
  );
}
