import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PatiTas · Encuentra mascotas perdidas en Tecámac",
    template: "%s · PatiTas",
  },
  description:
    "Comunidad para reportar y encontrar mascotas perdidas en Tecámac, Ecatepec, Zumpango y municipios aledaños.",
  keywords: ["mascotas perdidas", "Tecámac", "Estado de México", "perros", "gatos", "encontrar mascota"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PatiTas", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "PatiTas",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${nunito.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
