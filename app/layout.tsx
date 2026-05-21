import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MetaPixel from "./MetaPixel";
import TikTokPixel from "./TikTokPixel";

const nohemi = localFont({
  variable: "--font-nohemi",
  display: "swap",
  src: [
    { path: "./fonts/Nohemi-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Nohemi-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Nohemi-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Nohemi-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Nohemi-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "PropelKap OS · Cuestionario de descubrimiento",
  description:
    "Diseñamos contigo el ecosistema digital de tu negocio. Cuéntanos cómo trabajas hoy para construir tu CRM personalizado, agente IA en WhatsApp, landing y automatizaciones en 7 días.",
  openGraph: {
    title: "PropelKap OS · Cuestionario de descubrimiento",
    description:
      "CRM + Agente IA + Landing + Onboarding 7 días para asesores financieros mexicanos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${nohemi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <MetaPixel />
        <TikTokPixel />
        {children}
      </body>
    </html>
  );
}
