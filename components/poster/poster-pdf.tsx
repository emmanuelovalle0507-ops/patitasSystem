import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Svg, Path } from "@react-pdf/renderer";

export type PosterImageSrc = { data: Buffer; format: "jpg" | "png" };

export type PosterData = {
  headline: string;
  petName: string;
  reward: string | null;
  urgent: boolean;
  description: string;
  areaLabel: string | null;
  lostAt: string | null;
  imageSrc: PosterImageSrc | null;

  breed: string | null;
  colorText: string | null;
  sizeText: string | null;
  gender: string | null;
  ageText: string | null;
  microchip: string | null;
  collar: string | null;
  marks: string | null;
  behavior: string | null;
  safetyNote: string | null;

  contactName: string;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;

  qrDataUrl: string | null;
  qrLabel: string | null;

  accentColor: string | null;
};

export type PosterTemplate = "classic" | "bold" | "minimal";

const palette = {
  brand: "#F97316",
  brandDark: "#C2410C",
  brandLight: "#FFEDD5",
  dark: "#111827",
  muted: "#6B7280",
  light: "#FFF7ED",
  white: "#FFFFFF",
  red: "#DC2626",
  yellow: "#FEF3C7",
  yellowFg: "#92400E",
};

function themeFor(template: PosterTemplate, accent?: string | null) {
  const brand = accent || palette.brand;
  const brandDark = accent ? darken(accent) : palette.brandDark;
  const brandLight = accent ? hexWithAlpha(accent, 0.15) : palette.brandLight;
  switch (template) {
    case "bold":
      return { bg: brand, fg: palette.white, accent: palette.white, accentFg: brandDark, soft: "rgba(255,255,255,0.18)", softFg: palette.white, brandDark };
    case "minimal":
      return { bg: palette.white, fg: palette.dark, accent: palette.dark, accentFg: palette.white, soft: "#F3F4F6", softFg: palette.dark, brandDark: palette.dark };
    case "classic":
    default:
      return { bg: palette.white, fg: palette.dark, accent: brand, accentFg: palette.white, soft: brandLight, softFg: brandDark, brandDark };
  }
}

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

// Strip emoji/unsupported unicode so Helvetica doesn't render tofu/garbage
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
function clean(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

const makeStyles = (template: PosterTemplate, accent?: string | null) => {
  const t = themeFor(template, accent);
  return StyleSheet.create({
    page: {
      padding: 32,
      fontFamily: "Helvetica",
      backgroundColor: t.bg,
      color: t.fg,
    },
    headerBar: {
      backgroundColor: t.accent,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    headline: {
      fontSize: 30,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 3,
      color: t.accentFg,
      textAlign: "center",
    },
    urgentChip: {
      position: "absolute",
      top: -8,
      right: -4,
      backgroundColor: palette.red,
      color: palette.white,
      paddingHorizontal: 8,
      paddingVertical: 3,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      borderRadius: 4,
      letterSpacing: 1,
    },
    petNameWrap: { alignItems: "center", marginBottom: 6 },
    petName: {
      fontSize: 48,
      fontFamily: "Helvetica-Bold",
      textAlign: "center",
      color: template === "bold" ? palette.white : t.brandDark,
    },
    rewardBadge: {
      marginTop: 6,
      paddingVertical: 4,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: t.soft,
      color: t.softFg,
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
    },
    imageWrap: {
      width: "100%",
      height: 240,
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 10,
      borderWidth: template === "classic" ? 3 : template === "bold" ? 3 : 1,
      borderColor: template === "classic" ? t.accent : template === "bold" ? palette.white : "#E5E7EB",
      borderStyle: "solid",
      backgroundColor: "#F3F4F6",
    },
    image: { width: "100%", height: "100%", objectFit: "cover" },
    imageFallback: {
      width: "100%", height: "100%",
      alignItems: "center", justifyContent: "center",
      color: palette.muted, fontSize: 12,
    },
    detailsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 10 },
    detailPill: {
      backgroundColor: t.soft,
      color: t.softFg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      marginRight: 5,
      marginBottom: 5,
    },
    marks: {
      fontSize: 12,
      textAlign: "center",
      marginBottom: 6,
      fontFamily: "Helvetica-Bold",
      color: template === "bold" ? palette.white : palette.dark,
    },
    description: {
      fontSize: 11,
      lineHeight: 1.4,
      marginBottom: 10,
      textAlign: "center",
      color: template === "bold" ? palette.white : palette.dark,
    },
    warningBox: {
      backgroundColor: template === "bold" ? "rgba(255,255,255,0.2)" : palette.yellow,
      padding: 8,
      borderRadius: 8,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: template === "bold" ? palette.white : "#F59E0B",
      borderLeftStyle: "solid",
    },
    warningTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: template === "bold" ? palette.white : palette.yellowFg,
    },
    warningText: {
      fontSize: 11,
      lineHeight: 1.35,
      color: template === "bold" ? palette.white : palette.yellowFg,
    },
    meta: { flexDirection: "row", justifyContent: "center", marginBottom: 10, flexWrap: "wrap" },
    metaItem: {
      fontSize: 11,
      marginHorizontal: 8,
      marginVertical: 1,
      color: template === "bold" ? "rgba(255,255,255,0.95)" : palette.muted,
    },
    contactRow: { flexDirection: "row", alignItems: "stretch" },
    contactBox: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      backgroundColor: t.soft,
      marginRight: 8,
    },
    contactTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      textTransform: "uppercase",
      marginBottom: 4,
      color: t.softFg,
      letterSpacing: 1,
    },
    contactName: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      marginBottom: 5,
      color: t.softFg,
    },
    contactLine: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      marginBottom: 2,
      color: t.softFg,
    },
    qrBox: {
      width: 110,
      padding: 8,
      borderRadius: 10,
      backgroundColor: palette.white,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderStyle: "solid",
    },
    qrImg: { width: 90, height: 90 },
    qrCaption: { fontSize: 8, textAlign: "center", marginTop: 3, color: palette.dark },
    footer: {
      position: "absolute",
      bottom: 14,
      left: 28,
      right: 28,
      textAlign: "center",
      fontSize: 9,
      color: template === "bold" ? "rgba(255,255,255,0.8)" : palette.muted,
    },
  });
};

// --- Tiny vector icons so the PDF stays readable without emoji fonts ---
function PinIcon({ color }: { color: string }) {
  return (
    <Svg width="9" height="11" viewBox="0 0 24 24">
      <Path d="M12 2C7.6 2 4 5.6 4 10c0 5.3 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.3 20 10c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill={color} />
    </Svg>
  );
}
function CalIcon({ color }: { color: string }) {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm-2 8h14v10H5V10z" fill={color} />
    </Svg>
  );
}
function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.2 1.1L6.6 10.8z" fill={color} />
    </Svg>
  );
}
function MailIcon({ color }: { color: string }) {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 4v10h16V8l-8 5-8-5z" fill={color} />
    </Svg>
  );
}
function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" fill={color} />
    </Svg>
  );
}
function GiftIcon({ color }: { color: string }) {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M20 7h-2.2a3 3 0 00-5.8-2 3 3 0 00-5.8 2H4v4h2v10h12V11h2V7zm-8 2H6V9h6v0zm6 0h-6V9h6v0zM8 7a1 1 0 112 0v0H8zm6 0v0h-2a1 1 0 112 0z" fill={color} />
    </Svg>
  );
}

export function PosterPDF({ template, size, data }: { template: PosterTemplate; size: "LETTER" | "A4"; data: PosterData }) {
  const s = makeStyles(template, data.accentColor);
  const t = themeFor(template, data.accentColor);

  const headline = clean(data.headline) || "SE BUSCA";
  const petName = clean(data.petName) || "Mascota";
  const description = clean(data.description);
  const reward = clean(data.reward);
  const marks = clean(data.marks);
  const behavior = clean(data.behavior);
  const safetyNote = clean(data.safetyNote);
  const areaLabel = clean(data.areaLabel);
  const lostAt = clean(data.lostAt);
  const contactName = clean(data.contactName) || "Contacto";
  const contactPhone = clean(data.contactPhone);
  const contactWhatsapp = clean(data.contactWhatsapp);
  const contactEmail = clean(data.contactEmail);
  const qrLabel = clean(data.qrLabel) || "Escanea para ver";

  const pills: { label: string; value: string }[] = [];
  if (data.breed) pills.push({ label: "Raza", value: clean(data.breed) });
  if (data.colorText) pills.push({ label: "Color", value: clean(data.colorText) });
  if (data.sizeText) pills.push({ label: "Tamano", value: clean(data.sizeText) });
  if (data.gender) pills.push({ label: "Sexo", value: clean(data.gender) });
  if (data.ageText) pills.push({ label: "Edad", value: clean(data.ageText) });
  if (data.microchip) pills.push({ label: "Chip", value: clean(data.microchip) });
  if (data.collar) pills.push({ label: "Collar", value: clean(data.collar) });

  const metaColor = template === "bold" ? palette.white : palette.muted;
  const contactColor = t.softFg;

  return (
    <Document>
      <Page size={size} style={s.page}>
        <View style={s.headerBar}>
          <Text style={s.headline}>{headline}</Text>
          {data.urgent ? <Text style={s.urgentChip}>URGENTE</Text> : null}
        </View>

        <View style={s.petNameWrap}>
          <Text style={s.petName}>{petName}</Text>
          {reward ? (
            <View style={{ marginTop: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.soft, paddingVertical: 4, paddingHorizontal: 14, borderRadius: 999 }}>
                <GiftIcon color={t.softFg} />
                <Text style={{ marginLeft: 5, color: t.softFg, fontSize: 12, fontFamily: "Helvetica-Bold" }}>Recompensa: {reward}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={s.imageWrap}>
          {data.imageSrc ? (
            <Image src={data.imageSrc as any} style={s.image as any} />
          ) : (
            <View style={s.imageFallback}><Text>Sin foto</Text></View>
          )}
        </View>

        {pills.length > 0 && (
          <View style={s.detailsGrid}>
            {pills.map((p, i) => (
              <Text key={i} style={s.detailPill}>{p.label}: {p.value}</Text>
            ))}
          </View>
        )}

        {marks ? <Text style={s.marks}>{marks}</Text> : null}

        {description ? <Text style={s.description}>{description.slice(0, 420)}</Text> : null}

        {(behavior || safetyNote) && (
          <View style={s.warningBox}>
            {behavior ? (
              <>
                <Text style={s.warningTitle}>Comportamiento</Text>
                <Text style={s.warningText}>{behavior}</Text>
              </>
            ) : null}
            {safetyNote ? (
              <View style={behavior ? { marginTop: 4 } : undefined}>
                <Text style={s.warningTitle}>Importante</Text>
                <Text style={s.warningText}>{safetyNote}</Text>
              </View>
            ) : null}
          </View>
        )}

        {(areaLabel || lostAt) && (
          <View style={s.meta}>
            {areaLabel ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                <PinIcon color={metaColor} />
                <Text style={[s.metaItem, { marginHorizontal: 0, marginLeft: 4 }]}>{areaLabel}</Text>
              </View>
            ) : null}
            {lostAt ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                <CalIcon color={metaColor} />
                <Text style={[s.metaItem, { marginHorizontal: 0, marginLeft: 4 }]}>Desde {lostAt}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={s.contactRow}>
          <View style={s.contactBox}>
            <Text style={s.contactTitle}>Si lo ves, contacta</Text>
            <Text style={s.contactName}>{contactName}</Text>
            {contactWhatsapp ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <ChatIcon color={contactColor} />
                <Text style={[s.contactLine, { marginLeft: 5 }]}>WhatsApp: {contactWhatsapp}</Text>
              </View>
            ) : null}
            {contactPhone ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <PhoneIcon color={contactColor} />
                <Text style={[s.contactLine, { marginLeft: 5 }]}>Tel: {contactPhone}</Text>
              </View>
            ) : null}
            {contactEmail ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <MailIcon color={contactColor} />
                <Text style={[s.contactLine, { marginLeft: 5 }]}>{contactEmail}</Text>
              </View>
            ) : null}
          </View>
          {data.qrDataUrl ? (
            <View style={s.qrBox}>
              <Image src={data.qrDataUrl} style={s.qrImg as any} />
              <Text style={s.qrCaption}>{qrLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={s.footer}>Generado con PatiTas - patitas.mx</Text>
      </Page>
    </Document>
  );
}
