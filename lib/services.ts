import type { ServiceType } from "@/lib/types";

export const serviceTypes = [
  "Fotografia",
  "Video",
  "Zespół",
  "DJ",
  "Dekoracje",
  "Beauty",
  "Bar",
  "Cukiernia",
  "Atrakcje",
  "Samochód",
  "Content Creator",
  "Oprawa muzyczna",
  "Animacje",
  "Salon ślubny"
] as const satisfies readonly ServiceType[];

export const serviceHints: Record<ServiceType, string> = {
  Fotografia: "Reportaż, portrety i pełna historia dnia ślubu",
  Video: "Film ślubny, teledysk i ujęcia z drona",
  Zespół: "Oprawa muzyczna przyjęcia i prowadzenie zabawy",
  DJ: "Muzyka, światło i prowadzenie wesela",
  Dekoracje: "Florystyka, scenografia i aranżacja sali",
  Beauty: "Makijaż, fryzura i przygotowanie panny młodej",
  Bar: "Mobilny bar i obsługa koktajlowa",
  Cukiernia: "Torty, słodkie stoły i desery",
  Atrakcje: "Dodatkowe atrakcje dla gości",
  Samochód: "Auto do ślubu i przejazdów",
  "Content Creator": "Relacje social media i materiały z dnia ślubu",
  "Oprawa muzyczna": "Muzyka ceremonii i kameralne występy",
  Animacje: "Animacje dla dzieci i gości",
  "Salon ślubny": "Salon sukien ślubnych i dodatków",
};
