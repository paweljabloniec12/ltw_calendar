import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lubelski Team Weselny — Sprawdź dostępność usługodawców",
  description:
    "Sprawdź dostępność fotografów, filmowców, zespołów weselnych i innych specjalistów z Lublina na Twój termin ślubu. Lubelski Team Weselny — zaufani usługodawcy ślubni.",
  keywords: [
    "lubelski team weselny",
    "usługodawcy ślubni Lublin",
    "fotograf ślubny Lublin",
    "zespół weselny Lublin",
    "organizacja ślubu Lublin",
    "kalendarz dostępności wesele",
  ],
  authors: [{ name: "Lubelski Team Weselny" }],
  creator: "Lubelski Team Weselny",
  metadataBase: new URL("https://lubelskiteamweselny.pl"),
  alternates: {
    canonical: "https://lubelskiteamweselny.pl",
  },
  openGraph: {
    title: "Lubelski Team Weselny — Sprawdź dostępność usługodawców",
    description:
      "Sprawdź dostępność fotografów, filmowców, zespołów i innych specjalistów ślubnych z Lublina na Twój termin.",
    url: "https://lubelskiteamweselny.pl",
    siteName: "Lubelski Team Weselny",
    locale: "pl_PL",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Lubelski Team Weselny",
    "description": "Zaufani usługodawcy ślubni z Lublina — fotografia, film, muzyka, dekoracje i więcej.",
    "url": "https://lubelskiteamweselny.pl",
    "areaServed": { "@type": "City", "name": "Lublin" },
    "serviceType": "Usługi ślubne",
    "sameAs": [
      "https://www.instagram.com/lubelski_team_weselny/",
      "https://www.facebook.com/lubelskiteamweselny/",
      "https://www.tiktok.com/@lubelski_team_weselny"
    ]
  };

  return (
    <html lang="pl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <SiteHeader />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}