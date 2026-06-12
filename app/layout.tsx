import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lubelski Team Weselny - kalendarz dostępności",
  description: "Sprawdź dostępność usługodawców weselnych.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <SiteHeader />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}