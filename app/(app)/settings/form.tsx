"use client";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "@/components/ui/toaster";
import { PushSubscribeButton } from "@/components/push-subscribe";
import { PET_KINDS } from "@/lib/validators";

const MapPicker = dynamic(() => import("@/components/map/map-picker").then((m) => m.MapPicker), { ssr: false });

const PETS = [
  { v: "DOG", l: "🐶 Perros" }, { v: "CAT", l: "🐱 Gatos" }, { v: "BIRD", l: "🦜 Aves" },
  { v: "REPTILE", l: "🦎 Reptiles" }, { v: "RODENT", l: "🐹 Roedores" }, { v: "OTHER", l: "🐾 Otras" },
] as const;

const FormSchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(60),
  phone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  showPhone: z.boolean(),
  showWhatsapp: z.boolean(),
  showEmail: z.boolean(),
  favoritePets: z.array(z.enum(PET_KINDS)).min(1, "Elige al menos una mascota"),
  notifLat: z.number().nullable(),
  notifLng: z.number().nullable(),
  notifRadiusKm: z.number().int().min(1).max(20),
});
type FormValues = z.infer<typeof FormSchema>;

type UserData = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  avatarUrl: string | null;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  favoritePets: string[];
  notifLat: number | null;
  notifLng: number | null;
  notifRadiusKm: number;
};

export function SettingsForm({ user }: { user: UserData }) {
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
      name: user.name,
      phone: user.phone ?? "",
      whatsapp: user.whatsapp ?? "",
      avatarUrl: user.avatarUrl ?? "",
      showPhone: !!user.showPhone,
      showWhatsapp: !!user.showWhatsapp,
      showEmail: !!user.showEmail,
      favoritePets: (user.favoritePets ?? []) as any,
      notifLat: user.notifLat,
      notifLng: user.notifLng,
      notifRadiusKm: user.notifRadiusKm ?? 5,
    },
  });

  const favoritePets = watch("favoritePets");
  const notifLat = watch("notifLat");
  const notifLng = watch("notifLng");
  const notifRadiusKm = watch("notifRadiusKm");

  function toggleFav(v: (typeof PET_KINDS)[number]) {
    const next = favoritePets.includes(v) ? favoritePets.filter((x) => x !== v) : [...favoritePets, v];
    setValue("favoritePets", next, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(data: FormValues) {
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        avatarUrl: data.avatarUrl || null,
        showPhone: data.showPhone,
        showWhatsapp: data.showWhatsapp,
        showEmail: data.showEmail,
        favoritePets: data.favoritePets,
        notifLat: data.notifLat,
        notifLng: data.notifLng,
        notifRadiusKm: data.notifRadiusKm,
      });
      toast("Guardado ✅", "success");
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (con lada)</Label>
            <Input id="whatsapp" {...register("whatsapp")} placeholder="5215512345678" />
          </div>
          <Controller name="showPhone" control={control} render={({ field }) => (
            <div className="flex items-center justify-between">
              <Label>Mostrar teléfono en posts</Label>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )} />
          <Controller name="showWhatsapp" control={control} render={({ field }) => (
            <div className="flex items-center justify-between">
              <Label>Mostrar WhatsApp</Label>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )} />
          <Controller name="showEmail" control={control} render={({ field }) => (
            <div className="flex items-center justify-between">
              <Label>Mostrar correo</Label>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mascotas favoritas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PETS.map((p) => (
              <label
                key={p.v}
                className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer ${favoritePets.includes(p.v as any) ? "border-brand-500 bg-brand-50" : ""}`}
              >
                <Checkbox checked={favoritePets.includes(p.v as any)} onCheckedChange={() => toggleFav(p.v)} />
                <span className="text-sm">{p.l}</span>
              </label>
            ))}
          </div>
          {errors.favoritePets && <p className="mt-2 text-xs text-destructive">{errors.favoritePets.message as string}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notificaciones cercanas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Marca tu ubicación para recibir alertas de mascotas perdidas cerca de ti.</p>
          <MapPicker
            initial={notifLat && notifLng ? { lat: notifLat, lng: notifLng } : null}
            onChange={(c) => {
              setValue("notifLat", c.lat, { shouldDirty: true });
              setValue("notifLng", c.lng, { shouldDirty: true });
            }}
            height={280}
          />
          <div className="space-y-2">
            <Label>Radio de notificación: {notifRadiusKm} km</Label>
            <input
              type="range"
              min={1}
              max={20}
              value={notifRadiusKm}
              onChange={(e) => setValue("notifRadiusKm", Number(e.target.value), { shouldDirty: true })}
              className="w-full accent-brand-500"
            />
          </div>
          <PushSubscribeButton />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
