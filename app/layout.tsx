import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lubelski Team Weselny - kalendarz dostępności",
  description: "Sprawdź dostępność usługodawców weselnych.",
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
      </body>
    </html>
  );
}
