import Link from "next/link";
import { Eye, EyeOff, MessageCircle, Phone, Mail, Settings } from "lucide-react";

type Props = {
  author: {
    email: string;
    phone: string | null;
    whatsapp: string | null;
    showPhone: boolean;
    showWhatsapp: boolean;
    showEmail: boolean;
  };
};

export function OwnerContactPreview({ author }: Props) {
  const items = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: author.whatsapp,
      visible: author.showWhatsapp && !!author.whatsapp,
      tint: "text-green-600 bg-green-50 border-green-200",
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: author.phone,
      visible: author.showPhone && !!author.phone,
      tint: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      icon: Mail,
      label: "Correo",
      value: author.email,
      visible: author.showEmail,
      tint: "text-orange-600 bg-orange-50 border-orange-200",
    },
  ];

  const visibleCount = items.filter((i) => i.visible).length;

  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-start gap-3 border-b bg-muted/40 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Eye className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Datos de contacto visibles</p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
            {visibleCount === 0
              ? "Nadie puede contactarte directamente. Activa al menos un medio para que te ayuden a encontrar a tu mascota."
              : `Las personas que vean tu reporte podrán contactarte por ${visibleCount === 1 ? "este medio" : `estos ${visibleCount} medios`}.`}
          </p>
        </div>
        <Link
          href="/settings"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-xs font-medium hover:bg-accent"
        >
          <Settings className="h-3.5 w-3.5" />
          Editar
        </Link>
      </div>

      <ul className="divide-y">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  it.visible ? it.tint : "text-muted-foreground bg-muted/60 border-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{it.label}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {it.value ?? "No configurado"}
                </p>
              </div>
              {it.visible ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <Eye className="h-3 w-3" />
                  Visible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border">
                  <EyeOff className="h-3 w-3" />
                  Oculto
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
