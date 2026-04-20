"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, type UploadedImage } from "@/components/post/image-upload";
import { createLostPost } from "@/app/actions/posts";
import { toast } from "@/components/ui/toaster";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { PET_KINDS } from "@/lib/validators";

const MapPicker = dynamic(() => import("@/components/map/map-picker").then((m) => m.MapPicker), { ssr: false });

const FormSchema = z.object({
  petName: z.string().min(1, "Nombre requerido").max(60),
  kind: z.enum(PET_KINDS),
  breed: z.string().max(60).optional(),
  color: z.string().max(60).optional(),
  ageYears: z.string().optional(),
  description: z.string().min(10, "Describe con al menos 10 caracteres").max(2000),
  lostAt: z.string().min(1, "Fecha requerida"),
  areaLabel: z.string().max(120).optional(),
  contactPhone: z.string().max(20).optional(),
  contactWhatsapp: z.string().max(20).optional(),
  showPhone: z.boolean(),
  showWhatsapp: z.boolean(),
  showEmail: z.boolean(),
});
type FormValues = z.infer<typeof FormSchema>;

export function NewPostForm() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      petName: "",
      kind: "DOG",
      breed: "",
      color: "",
      ageYears: "",
      description: "",
      lostAt: new Date().toISOString().slice(0, 10),
      areaLabel: "",
      contactPhone: "",
      contactWhatsapp: "",
      showPhone: true,
      showWhatsapp: true,
      showEmail: false,
    },
  });

  const areaLabel = watch("areaLabel");

  async function onSubmit(data: FormValues) {
    if (!coords) { toast("Marca la ubicación en el mapa", "error"); return; }
    if (images.length === 0) { toast("Sube al menos una foto", "error"); return; }
    try {
      await createLostPost({
        petName: data.petName,
        kind: data.kind,
        breed: data.breed || null,
        color: data.color || null,
        ageYears: data.ageYears ? Number(data.ageYears) : null,
        description: data.description,
        lostAt: new Date(data.lostAt).toISOString(),
        lat: coords.lat,
        lng: coords.lng,
        areaLabel: data.areaLabel || null,
        imageUrls: images,
        contactPhone: data.contactPhone || null,
        contactWhatsapp: data.contactWhatsapp || null,
        showPhone: data.showPhone,
        showWhatsapp: data.showWhatsapp,
        showEmail: data.showEmail,
      });
    } catch (e: any) {
      toast(e?.message || "Error al publicar", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader><CardTitle>📸 Fotos</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload value={images} onChange={setImages} max={5} moderate />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>🐾 Datos de la mascota</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="petName">Nombre</Label>
            <Input id="petName" {...register("petName")} placeholder="Firulais" aria-invalid={!!errors.petName} />
            {errors.petName && <p className="text-xs text-destructive">{errors.petName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Especie</Label>
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOG">🐶 Perro</SelectItem>
                    <SelectItem value="CAT">🐱 Gato</SelectItem>
                    <SelectItem value="BIRD">🦜 Ave</SelectItem>
                    <SelectItem value="REPTILE">🦎 Reptil</SelectItem>
                    <SelectItem value="RODENT">🐹 Roedor</SelectItem>
                    <SelectItem value="OTHER">🐾 Otro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Raza (opcional)</Label>
            <Input id="breed" {...register("breed")} placeholder="Mestizo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color principal</Label>
            <Input id="color" {...register("color")} placeholder="Café con blanco" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageYears">Edad aproximada (años)</Label>
            <Input id="ageYears" type="number" step="0.5" min="0" {...register("ageYears")} placeholder="3" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={4} {...register("description")}
              placeholder="Describe señas particulares, collar, personalidad, dónde suele ir..." aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lostAt">Fecha en que se perdió</Label>
            <Input id="lostAt" type="date" {...register("lostAt")} />
            {errors.lostAt && <p className="text-xs text-destructive">{errors.lostAt.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaLabel">Zona (nombre de colonia)</Label>
            <Input id="areaLabel" {...register("areaLabel")} placeholder="Ojo de Agua" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>📞 Datos de contacto</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Comparte cómo pueden contactarte si alguien ve a tu mascota. Es muy importante para que te puedan ayudar.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp" className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-600" />WhatsApp</Label>
              <Input id="contactWhatsapp" {...register("contactWhatsapp")} placeholder="5215512345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" />Teléfono</Label>
              <Input id="contactPhone" {...register("contactPhone")} placeholder="5512345678" />
            </div>
          </div>
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">¿Qué datos mostrar en tu publicación?</p>
            <Controller name="showWhatsapp" control={control} render={({ field }) => (
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-green-600" />Mostrar WhatsApp</Label>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )} />
            <Controller name="showPhone" control={control} render={({ field }) => (
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-blue-600" />Mostrar teléfono</Label>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )} />
            <Controller name="showEmail" control={control} render={({ field }) => (
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-orange-600" />Mostrar correo</Label>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>📍 Ubicación aproximada</CardTitle></CardHeader>
        <CardContent>
          <MapPicker
            initial={coords}
            onChange={setCoords}
            onGeocode={(l) => { if (!areaLabel) setValue("areaLabel", l); }}
            height={360}
          />
          {coords && <p className="mt-2 text-xs text-muted-foreground">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar reporte"}
      </Button>
    </form>
  );
}
