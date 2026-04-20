import { requireUser } from "@/lib/auth";
import { SettingsForm } from "./form";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Configuración</h1>
      <SettingsForm user={{
        name: user.name,
        phone: user.phone,
        whatsapp: user.whatsapp,
        avatarUrl: user.avatarUrl,
        showPhone: user.showPhone,
        showWhatsapp: user.showWhatsapp,
        showEmail: user.showEmail,
        favoritePets: user.favoritePets,
        notifLat: user.notifLat,
        notifLng: user.notifLng,
        notifRadiusKm: user.notifRadiusKm,
      }} />
    </div>
  );
}
