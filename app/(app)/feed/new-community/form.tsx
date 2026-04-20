"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload, type UploadedImage } from "@/components/post/image-upload";
import { createCommunityPost } from "@/app/actions/posts";
import { toast } from "@/components/ui/toaster";

export function CommunityPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (images.length === 0) { toast("Sube al menos una foto de tu mascota", "error"); return; }
    setLoading(true);
    try {
      const r = await createCommunityPost({ title, description, imageUrls: images });
      router.push(`/posts/${r.id}`);
    } catch (e: any) {
      toast(e?.message || "Error", "error");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <ImageUpload value={images} onChange={setImages} max={5} moderate />
        <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi gatita dormida 😸" /></div>
        <div className="space-y-2"><Label>Descripción</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <Button onClick={submit} disabled={loading} className="w-full">{loading ? "Publicando..." : "Publicar"}</Button>
      </CardContent>
    </Card>
  );
}
