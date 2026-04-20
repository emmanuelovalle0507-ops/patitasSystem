"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Download, Printer, Loader2, ChevronDown,
  Palette, Type, ImageIcon, PawPrint, FileText, Phone, QrCode, Sparkles, Eye,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { PosterPreview, type PosterTemplate } from "@/components/poster/poster-preview";
import { PosterCritic } from "@/components/poster/poster-critic";

type PosterData = {
  id: string;
  url: string;
  title: string;
  description: string;
  areaLabel: string | null;
  lostAt: string | null;
  images: string[];
  petName: string;
  petKind: string;
  petBreed: string | null;
  petColor: string | null;
  petAgeYears: number | null;
  author: { name: string; phone: string | null; whatsapp: string | null; email: string | null };
};

const TEMPLATES: { id: PosterTemplate; name: string; hint: string; sample: string }[] = [
  { id: "classic", name: "Clásica", hint: "Naranja + foto grande", sample: "bg-gradient-to-br from-brand-400 to-brand-600" },
  { id: "bold", name: "Impactante", hint: "Fondo sólido, máxima visibilidad", sample: "bg-brand-500" },
  { id: "minimal", name: "Minimalista", hint: "Negro + blanco, sobrio", sample: "bg-slate-900" },
];

const ACCENT_SWATCHES = [
  { hex: "#F97316", name: "Naranja" },
  { hex: "#DC2626", name: "Rojo" },
  { hex: "#EA580C", name: "Rojo-naranja" },
  { hex: "#CA8A04", name: "Amarillo" },
  { hex: "#0EA5E9", name: "Azul" },
  { hex: "#059669", name: "Verde" },
  { hex: "#7C3AED", name: "Morado" },
  { hex: "#DB2777", name: "Rosa" },
];

type SectionTone = "brand" | "amber" | "slate" | "emerald" | "blue" | "violet" | "rose";
const TONES: Record<SectionTone, { ring: string; bg: string; fg: string; dot: string }> = {
  brand:   { ring: "ring-brand-200",    bg: "bg-brand-50",    fg: "text-brand-700",    dot: "bg-brand-500" },
  amber:   { ring: "ring-amber-200",    bg: "bg-amber-50",    fg: "text-amber-700",    dot: "bg-amber-500" },
  slate:   { ring: "ring-slate-200",    bg: "bg-slate-100",   fg: "text-slate-700",    dot: "bg-slate-500" },
  emerald: { ring: "ring-emerald-200",  bg: "bg-emerald-50",  fg: "text-emerald-700",  dot: "bg-emerald-500" },
  blue:    { ring: "ring-sky-200",      bg: "bg-sky-50",      fg: "text-sky-700",      dot: "bg-sky-500" },
  violet:  { ring: "ring-violet-200",   bg: "bg-violet-50",   fg: "text-violet-700",   dot: "bg-violet-500" },
  rose:    { ring: "ring-rose-200",     bg: "bg-rose-50",     fg: "text-rose-700",     dot: "bg-rose-500" },
};

function Section({
  title, subtitle, icon: Icon, tone = "brand", defaultOpen = true, children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: SectionTone;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const t = TONES[tone];
  return (
    <section className={cn("group rounded-2xl border bg-card shadow-sm overflow-hidden transition", open && "shadow-md")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition"
      >
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1", t.bg, t.fg, t.ring)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-sm leading-tight">{title}</span>
          {subtitle && <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{subtitle}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t bg-gradient-to-b from-muted/20 to-transparent space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function PosterGenerator({ post }: { post: PosterData }) {
  const [template, setTemplate] = useState<PosterTemplate>("classic");
  const [size, setSize] = useState<"LETTER" | "A4">("LETTER");
  const [accentColor, setAccentColor] = useState<string>("#F97316");
  const [useCustomAccent, setUseCustomAccent] = useState(false);

  const [headline, setHeadline] = useState("SE BUSCA");
  const [petName, setPetName] = useState(post.petName);
  const [reward, setReward] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [description, setDescription] = useState(post.description.slice(0, 420));
  const [areaLabel, setAreaLabel] = useState(post.areaLabel ?? "");
  const [lostAt, setLostAt] = useState(post.lostAt ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(post.images[0] ?? null);

  const [breed, setBreed] = useState(post.petBreed ?? "");
  const [colorText, setColorText] = useState(post.petColor ?? "");
  const [sizeText, setSizeText] = useState("");
  const [gender, setGender] = useState("");
  const [ageText, setAgeText] = useState(post.petAgeYears ? `${post.petAgeYears} año${post.petAgeYears === 1 ? "" : "s"}` : "");
  const [microchip, setMicrochip] = useState("");
  const [collar, setCollar] = useState("");
  const [marks, setMarks] = useState("");
  const [behavior, setBehavior] = useState("");
  const [safetyNote, setSafetyNote] = useState("");

  const [contactName, setContactName] = useState(post.author.name);
  const [contactWhatsapp, setContactWhatsapp] = useState(post.author.whatsapp ?? "");
  const [contactPhone, setContactPhone] = useState(post.author.phone ?? "");
  const [contactEmail, setContactEmail] = useState(post.author.email ?? "");

  const [showQR, setShowQR] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLabel, setQrLabel] = useState("Escanea para ver el reporte");

  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!showQR) { setQrDataUrl(null); return; }
    let cancelled = false;
    QRCode.toDataURL(post.url, { margin: 1, width: 256, errorCorrectionLevel: "M" })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [showQR, post.url]);

  const effectiveAccent = useCustomAccent ? accentColor : null;

  const previewData = useMemo(() => ({
    headline,
    petName,
    reward: reward.trim(),
    urgent,
    description: description.trim(),
    areaLabel: areaLabel.trim(),
    lostAt,
    imageUrl,
    breed: breed.trim(),
    colorText: colorText.trim(),
    sizeText: sizeText.trim(),
    gender: gender.trim(),
    ageText: ageText.trim(),
    microchip: microchip.trim(),
    collar: collar.trim(),
    marks: marks.trim(),
    behavior: behavior.trim(),
    safetyNote: safetyNote.trim(),
    contactName,
    contactPhone: contactPhone.trim(),
    contactWhatsapp: contactWhatsapp.trim(),
    contactEmail: contactEmail.trim(),
    qrDataUrl,
    qrLabel,
    accentColor: effectiveAccent,
  }), [headline, petName, reward, urgent, description, areaLabel, lostAt, imageUrl, breed, colorText, sizeText, gender, ageText, microchip, collar, marks, behavior, safetyNote, contactName, contactPhone, contactWhatsapp, contactEmail, qrDataUrl, qrLabel, effectiveAccent]);

  async function fetchPdfBlob(): Promise<Blob> {
    const res = await fetch("/api/poster/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: post.id,
        template,
        size,
        headline,
        petName,
        reward: reward || null,
        urgent,
        description,
        areaLabel: areaLabel || null,
        lostAt: lostAt || null,
        imageUrl,
        breed: breed || null,
        colorText: colorText || null,
        sizeText: sizeText || null,
        gender: gender || null,
        ageText: ageText || null,
        microchip: microchip || null,
        collar: collar || null,
        marks: marks || null,
        behavior: behavior || null,
        safetyNote: safetyNote || null,
        contactName,
        contactPhone: contactPhone || null,
        contactWhatsapp: contactWhatsapp || null,
        contactEmail: contactEmail || null,
        qrDataUrl,
        qrLabel,
        accentColor: effectiveAccent,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Error al generar PDF");
    }
    return res.blob();
  }

  async function download() {
    setDownloading(true);
    try {
      const blob = await fetchPdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cartel-${petName || post.id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast("PDF descargado", "success");
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    } finally {
      setDownloading(false);
    }
  }

  async function print() {
    setPrinting(true);
    try {
      const blob = await fetchPdfBlob();
      const url = URL.createObjectURL(blob);
      // Render the PDF inside a hidden iframe and trigger print from there —
      // this prints ONLY the poster PDF, not the surrounding app layout.
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      const cleanup = () => {
        try { iframe.remove(); } catch {}
        URL.revokeObjectURL(url);
      };
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            // Fallback: open in new tab if the browser blocks iframe print
            window.open(url, "_blank");
          }
          // Leave the iframe alive for a bit so the print dialog has the doc
          setTimeout(cleanup, 60_000);
        }, 300);
      };
      document.body.appendChild(iframe);
      toast("Preparando impresión…", "success");
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    } finally {
      setPrinting(false);
    }
  }

  const hasContact = contactPhone || contactWhatsapp || contactEmail;

  return (
    <>
      {/* Banner header */}
      <div className="relative -mx-4 md:-mx-8 mb-6 overflow-hidden border-b bg-gradient-to-br from-brand-50 via-orange-50 to-amber-50">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(244,114,182,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-5">
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700/80 hover:text-brand-800 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />Volver al reporte
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">Editor de cartel</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900">{post.petName}</h1>
              <p className="text-sm text-slate-700/80 mt-0.5 max-w-md">Personaliza cada detalle — la vista previa se actualiza al instante. Cuando estés listo, descarga o imprime.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button onClick={print} disabled={printing} variant="outline" className="gap-2 bg-white/70 backdrop-blur">
                {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                {printing ? "Preparando..." : "Imprimir"}
              </Button>
              <Button onClick={download} disabled={downloading} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-md">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading ? "Generando..." : "Descargar PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl pb-24 md:pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* CONTROLS */}
          <div className="space-y-3">
            <Section title="Plantilla y estilo" subtitle="Elige el diseño, tamaño y color dominante" icon={Palette} tone="brand">
              <Field label="Plantilla">
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplate(tpl.id)}
                      className={cn(
                        "group/tpl rounded-xl border-2 p-1.5 text-left transition",
                        template === tpl.id
                          ? "border-brand-500 ring-2 ring-brand-200 shadow-sm"
                          : "border-border hover:border-brand-300"
                      )}
                    >
                      <div className={cn(
                        "relative aspect-[3/4] rounded-md mb-1.5 overflow-hidden flex items-center justify-center shadow-inner",
                        tpl.sample
                      )}>
                        <div className="absolute inset-x-1.5 top-1.5 h-2.5 rounded bg-white/30" />
                        <div className="absolute inset-x-2 top-5 bottom-5 rounded bg-white/60" />
                        <div className="absolute inset-x-2 bottom-2 h-2 rounded bg-white/40" />
                        <span className="relative z-[1] text-[8px] font-black tracking-widest text-white drop-shadow">SE BUSCA</span>
                      </div>
                      <div className="text-[11px] font-bold leading-tight">{tpl.name}</div>
                      <div className="text-[9px] text-muted-foreground leading-tight">{tpl.hint}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Tamaño">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                  {(["LETTER", "A4"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "rounded-md py-1.5 text-xs font-semibold transition",
                        size === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === "LETTER" ? "Carta · 8.5×11″" : "A4 · 210×297mm"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Color dominante">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Personalizar</span>
                  <Switch checked={useCustomAccent} onCheckedChange={setUseCustomAccent} />
                </div>
                {useCustomAccent ? (
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                      {ACCENT_SWATCHES.map((s) => (
                        <button
                          key={s.hex}
                          type="button"
                          onClick={() => setAccentColor(s.hex)}
                          className={cn(
                            "h-9 w-9 rounded-full transition hover:scale-110 sm:h-8 sm:w-8",
                            accentColor === s.hex && "ring-2 ring-offset-2 ring-offset-background"
                          )}
                          style={{
                            backgroundColor: s.hex,
                            boxShadow: accentColor === s.hex ? `0 0 0 2px ${s.hex}` : "inset 0 0 0 2px rgba(0,0,0,0.05)",
                          }}
                          aria-label={s.name}
                          title={s.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-9 w-10 rounded-md border cursor-pointer p-0.5"
                        aria-label="Selector de color"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="font-mono text-xs uppercase h-9"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Usa el color de la plantilla. Activa para elegir uno propio.</p>
                )}
              </Field>
            </Section>

            <Section title="Título y alerta" subtitle="El encabezado llamativo del cartel" icon={Type} tone="amber">
              <Field label="Encabezado" hint={`${headline.length}/40`}>
                <Input value={headline} maxLength={40} onChange={(e) => setHeadline(e.target.value)} />
              </Field>
              <Field label="Nombre destacado" hint={`${petName.length}/40`}>
                <Input value={petName} maxLength={40} onChange={(e) => setPetName(e.target.value)} />
              </Field>
              <Field label="Recompensa (opcional)">
                <Input value={reward} maxLength={60} onChange={(e) => setReward(e.target.value)} placeholder="$2,000 MXN" />
              </Field>
              <label className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3 cursor-pointer">
                <span>
                  <span className="text-sm font-semibold block">Badge URGENTE</span>
                  <span className="block text-[11px] text-muted-foreground">Cinta roja en la esquina del encabezado.</span>
                </span>
                <Switch checked={urgent} onCheckedChange={setUrgent} />
              </label>
            </Section>

            {post.images.length > 0 && (
              <Section title="Foto" subtitle={`Elige cuál va en el cartel (${post.images.length} disponibles)`} icon={ImageIcon} tone="blue">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className={cn(
                      "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition",
                      imageUrl === null
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60"
                    )}
                  >
                    <ImageIcon className="h-4 w-4 opacity-60" />
                    Sin foto
                  </button>
                  {post.images.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setImageUrl(src)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition",
                        imageUrl === src
                          ? "border-brand-500 ring-2 ring-brand-200 shadow"
                          : "border-transparent hover:border-muted-foreground/40"
                      )}
                    >
                      <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Datos de la mascota" subtitle="Información que ayuda a identificarla" icon={PawPrint} tone="emerald">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Field label="Raza"><Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Mestizo" maxLength={60} /></Field>
                <Field label="Color"><Input value={colorText} onChange={(e) => setColorText(e.target.value)} placeholder="Café con blanco" maxLength={60} /></Field>
                <Field label="Tamaño">
                  <select
                    value={sizeText}
                    onChange={(e) => setSizeText(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    <option value="Chico">Chico</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </Field>
                <Field label="Sexo">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </Field>
                <Field label="Edad"><Input value={ageText} onChange={(e) => setAgeText(e.target.value)} placeholder="3 años" maxLength={30} /></Field>
                <Field label="Microchip"><Input value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="Sí / ID" maxLength={30} /></Field>
              </div>
              <Field label="Collar / placa"><Input value={collar} onChange={(e) => setCollar(e.target.value)} placeholder="Rojo con placa dorada" maxLength={80} /></Field>
              <Field label="Señas particulares"><Input value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Mancha blanca en la pata izq." maxLength={120} /></Field>
            </Section>

            <Section title="Descripción y alertas" subtitle="Historia y recomendaciones" icon={FileText} tone="violet" defaultOpen={false}>
              <Field label="Descripción" hint={`${description.length}/420`}>
                <Textarea
                  rows={3}
                  value={description}
                  maxLength={420}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field label="Comportamiento">
                <Input value={behavior} onChange={(e) => setBehavior(e.target.value)} placeholder="Amistoso, responde a su nombre" maxLength={140} />
              </Field>
              <Field label="Nota de seguridad">
                <Input value={safetyNote} onChange={(e) => setSafetyNote(e.target.value)} placeholder="Asustadizo, no lo persigas — avísanos" maxLength={140} />
              </Field>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Field label="Zona"><Input value={areaLabel} onChange={(e) => setAreaLabel(e.target.value)} placeholder="Ojo de Agua" /></Field>
                <Field label="Desde"><Input type="date" value={lostAt} onChange={(e) => setLostAt(e.target.value)} /></Field>
              </div>
            </Section>

            <Section title="Contacto" subtitle="Cómo pueden avisarte" icon={Phone} tone="rose">
              <Field label="Nombre"><Input value={contactName} onChange={(e) => setContactName(e.target.value)} /></Field>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Field label="WhatsApp"><Input value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="5215512345678" /></Field>
                <Field label="Teléfono"><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="5512345678" /></Field>
              </div>
              <Field label="Email"><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></Field>
              {!hasContact && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  ⚠ Agrega al menos un medio de contacto para que puedan avisarte.
                </p>
              )}
            </Section>

            <Section title="Código QR" subtitle="Lleva al reporte online con fotos extra" icon={QrCode} tone="slate" defaultOpen={false}>
              <label className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3 cursor-pointer">
                <span>
                  <span className="text-sm font-semibold block">Mostrar QR</span>
                  <span className="block text-[11px] text-muted-foreground">Escanear abre tu reporte online.</span>
                </span>
                <Switch checked={showQR} onCheckedChange={setShowQR} />
              </label>
              {showQR && (
                <Field label="Texto bajo el QR" hint={`${qrLabel.length}/40`}>
                  <Input maxLength={40} value={qrLabel} onChange={(e) => setQrLabel(e.target.value)} />
                </Field>
              )}
            </Section>

            <PosterCritic
              postId={post.id}
              getDraft={() => ({
                headline,
                petName,
                reward: reward || null,
                urgent,
                description,
                areaLabel: areaLabel || null,
                hasImage: !!imageUrl,
                breed: breed || null,
                colorText: colorText || null,
                sizeText: sizeText || null,
                gender: gender || null,
                ageText: ageText || null,
                collar: collar || null,
                marks: marks || null,
                contactPhone: contactPhone || null,
                contactWhatsapp: contactWhatsapp || null,
                contactEmail: contactEmail || null,
                hasQR: showQR && !!qrDataUrl,
                template,
              })}
            />
          </div>

          {/* LIVE PREVIEW */}
          <div className="relative">
            <div className="space-y-3 lg:sticky lg:top-20">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Eye className="h-3.5 w-3.5" />
                  Vista previa en vivo
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {size === "LETTER" ? "8.5 × 11″" : "A4"}
                </span>
              </div>
              <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-[linear-gradient(135deg,rgba(0,0,0,0.015)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.015)_50%,rgba(0,0,0,0.015)_75%,transparent_75%)] [background-size:20px_20px] p-4 md:p-6 flex items-start justify-center">
                <div className="shadow-2xl ring-1 ring-black/5">
                  <PosterPreview template={template} data={previewData} />
                </div>
              </div>
              <p className="text-[11px] text-center text-muted-foreground">
                El PDF descargado respetará estas proporciones exactas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar (mobile + fallback) */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 flex gap-2 shadow-lg">
        <Button onClick={print} disabled={printing} variant="outline" className="flex-1 gap-2">
          {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {printing ? "..." : "Imprimir"}
        </Button>
        <Button onClick={download} disabled={downloading} className="flex-1 gap-2 bg-brand-600 hover:bg-brand-700 text-white">
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "..." : "Descargar PDF"}
        </Button>
      </div>
    </>
  );
}
