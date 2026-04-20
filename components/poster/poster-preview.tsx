"use client";
import Image from "next/image";
import { MapPin, Calendar, Phone, MessageCircle, Mail, AlertTriangle, Sparkles } from "lucide-react";

export type PosterTemplate = "classic" | "bold" | "minimal";

export type PosterPreviewData = {
  headline: string;
  petName: string;
  reward: string;
  urgent: boolean;
  description: string;
  areaLabel: string;
  lostAt: string;
  imageUrl: string | null;

  breed: string;
  colorText: string;
  sizeText: string;
  gender: string;
  ageText: string;
  microchip: string;
  collar: string;
  marks: string;
  behavior: string;
  safetyNote: string;

  contactName: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;

  qrDataUrl: string | null;
  qrLabel: string;

  accentColor: string | null;
};

type ThemeClasses = {
  page: string;
  header: string;
  headlineFg: string;
  petNameClass: string;
  badge: string;
  meta: string;
  description: string;
  contactBox: string;
  contactTitle: string;
  contactName: string;
  contactLine: string;
  imageRing: string;
  qrBox: string;
  pill: string;
  warning: string;
  warningTitle: string;
};

const themes: Record<PosterTemplate, ThemeClasses> = {
  classic: {
    page: "bg-white text-slate-900",
    header: "bg-[--accent] text-white",
    headlineFg: "text-white",
    petNameClass: "text-[--accent-dark]",
    badge: "bg-[--accent-light] text-[--accent-dark]",
    meta: "text-slate-500",
    description: "text-slate-700",
    contactBox: "bg-[--accent-light] text-[--accent-dark]",
    contactTitle: "text-[--accent]",
    contactName: "text-slate-900",
    contactLine: "text-slate-800",
    imageRing: "ring-4 ring-[--accent]",
    qrBox: "bg-white border border-slate-200",
    pill: "bg-[--accent-light] text-[--accent-dark]",
    warning: "bg-amber-100 text-amber-900 border-l-4 border-amber-500",
    warningTitle: "text-amber-700",
  },
  bold: {
    page: "bg-[--accent] text-white",
    header: "bg-white text-[--accent-dark]",
    headlineFg: "text-[--accent-dark]",
    petNameClass: "text-white",
    badge: "bg-white/20 text-white",
    meta: "text-white/90",
    description: "text-white/95",
    contactBox: "bg-white/15 text-white",
    contactTitle: "text-white/90",
    contactName: "text-white",
    contactLine: "text-white",
    imageRing: "ring-4 ring-white",
    qrBox: "bg-white border border-white/40",
    pill: "bg-white/15 text-white",
    warning: "bg-white/15 text-white border-l-4 border-white",
    warningTitle: "text-white/80",
  },
  minimal: {
    page: "bg-white text-slate-900",
    header: "bg-slate-900 text-white",
    headlineFg: "text-white",
    petNameClass: "text-slate-900",
    badge: "bg-slate-100 text-slate-700",
    meta: "text-slate-500",
    description: "text-slate-700",
    contactBox: "bg-slate-100 text-slate-900",
    contactTitle: "text-slate-500",
    contactName: "text-slate-900",
    contactLine: "text-slate-800",
    imageRing: "ring-1 ring-slate-200",
    qrBox: "bg-white border border-slate-200",
    pill: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-900 border-l-4 border-amber-500",
    warningTitle: "text-amber-700",
  },
};

function hexWithAlpha(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = Math.max(0, parseInt(h.slice(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(h.slice(2, 4), 16) - 40);
  const b = Math.max(0, parseInt(h.slice(4, 6), 16) - 40);
  return `rgb(${r}, ${g}, ${b})`;
}

export function PosterPreview({ template, data }: { template: PosterTemplate; data: PosterPreviewData }) {
  const t = themes[template];
  const accent = data.accentColor || "#F97316";
  const accentDark = data.accentColor ? darken(accent) : "#C2410C";
  const accentLight = data.accentColor ? hexWithAlpha(accent, 0.15) : "#FFEDD5";

  const style = {
    "--accent": accent,
    "--accent-dark": accentDark,
    "--accent-light": accentLight,
  } as React.CSSProperties;

  const pills: { label: string; value: string }[] = [];
  if (data.breed) pills.push({ label: "Raza", value: data.breed });
  if (data.colorText) pills.push({ label: "Color", value: data.colorText });
  if (data.sizeText) pills.push({ label: "Tamaño", value: data.sizeText });
  if (data.gender) pills.push({ label: "Sexo", value: data.gender });
  if (data.ageText) pills.push({ label: "Edad", value: data.ageText });
  if (data.microchip) pills.push({ label: "Microchip", value: data.microchip });
  if (data.collar) pills.push({ label: "Collar", value: data.collar });

  return (
    <div
      id="poster-preview"
      className={`${t.page} p-7 shadow-sm relative`}
      style={{ ...style, aspectRatio: "8.5 / 11", width: "100%", maxWidth: "720px", fontFamily: "system-ui, sans-serif" }}
    >
      <div className={`${t.header} relative rounded-xl px-6 py-3 text-center`}>
        <p className={`${t.headlineFg} font-display font-black tracking-[0.2em]`} style={{ fontSize: "clamp(1.25rem, 3.5vw, 2rem)" }}>
          {data.headline}
        </p>
        {data.urgent && (
          <span className="absolute -top-2.5 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow tracking-widest">
            URGENTE
          </span>
        )}
      </div>

      <div className="mt-3 text-center">
        <h2 className={`${t.petNameClass} font-display font-black leading-none`} style={{ fontSize: "clamp(2rem, 6.5vw, 3.5rem)" }}>
          {data.petName}
        </h2>
        {data.reward && (
          <span className={`${t.badge} mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold`}>
            🎁 Recompensa: {data.reward}
          </span>
        )}
      </div>

      {data.imageUrl && (
        <div className={`mt-3 overflow-hidden rounded-xl ${t.imageRing}`}>
          <div className="relative" style={{ aspectRatio: "16/10" }}>
            <Image src={data.imageUrl} alt={data.petName} fill sizes="720px" className="object-cover" unoptimized />
          </div>
        </div>
      )}

      {pills.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {pills.map((p, i) => (
            <span key={i} className={`${t.pill} rounded-md px-2 py-0.5 text-[11px] font-semibold`}>
              <span className="opacity-70">{p.label}:</span> {p.value}
            </span>
          ))}
        </div>
      )}

      {data.marks && (
        <p className={`${t.petNameClass === "text-white" ? "text-white" : "text-slate-900"} mt-2 text-center text-[13px] font-semibold inline-flex items-center justify-center gap-1 w-full`}>
          <Sparkles className="h-3.5 w-3.5" />{data.marks}
        </p>
      )}

      {data.description && (
        <p className={`${t.description} mt-2 text-center leading-snug`} style={{ fontSize: "clamp(0.8rem, 1.4vw, 0.95rem)" }}>
          {data.description.slice(0, 420)}
        </p>
      )}

      {(data.behavior || data.safetyNote) && (
        <div className={`${t.warning} mt-3 rounded-r-md px-3 py-2`}>
          {data.behavior && (
            <div>
              <p className={`${t.warningTitle} text-[10px] font-bold uppercase tracking-wider`}>Comportamiento</p>
              <p className="text-xs leading-tight">{data.behavior}</p>
            </div>
          )}
          {data.safetyNote && (
            <div className={data.behavior ? "mt-1.5" : ""}>
              <p className={`${t.warningTitle} text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1`}>
                <AlertTriangle className="h-3 w-3" />Importante
              </p>
              <p className="text-xs leading-tight">{data.safetyNote}</p>
            </div>
          )}
        </div>
      )}

      <div className={`${t.meta} mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs`}>
        {data.areaLabel && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{data.areaLabel}</span>}
        {data.lostAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Desde {data.lostAt}</span>}
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <div className={`${t.contactBox} flex-1 rounded-xl p-3`}>
          <p className={`${t.contactTitle} text-[10px] font-bold uppercase tracking-wider mb-1`}>Si lo ves, contacta</p>
          <p className={`${t.contactName} text-base font-bold mb-1.5`}>{data.contactName}</p>
          <div className="space-y-0.5">
            {data.contactWhatsapp && (
              <p className={`${t.contactLine} text-xs font-semibold inline-flex items-center gap-1.5`}>
                <MessageCircle className="h-3.5 w-3.5" />WhatsApp: {data.contactWhatsapp}
              </p>
            )}
            {data.contactPhone && (
              <p className={`${t.contactLine} text-xs font-semibold inline-flex items-center gap-1.5`}>
                <Phone className="h-3.5 w-3.5" />Tel: {data.contactPhone}
              </p>
            )}
            {data.contactEmail && (
              <p className={`${t.contactLine} text-xs font-semibold inline-flex items-center gap-1.5 break-all`}>
                <Mail className="h-3.5 w-3.5" />{data.contactEmail}
              </p>
            )}
          </div>
        </div>

        {data.qrDataUrl && (
          <div className={`${t.qrBox} w-[110px] rounded-xl p-2 flex flex-col items-center justify-center`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.qrDataUrl} alt="QR" className="w-[90px] h-[90px]" />
            <p className="mt-1 text-[9px] text-center text-slate-700 leading-tight">{data.qrLabel}</p>
          </div>
        )}
      </div>

      <p className={`${t.meta} mt-4 text-center text-[10px]`}>Generado con PatiTas · patitas.mx</p>
    </div>
  );
}
