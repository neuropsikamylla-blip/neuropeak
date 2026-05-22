import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "NeuroPeak - Treino Cognitivo",
  description: "Plataforma clínica de reabilitação e treinamento cognitivo para neuropsicólogos",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeuroPeak",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1b3e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
