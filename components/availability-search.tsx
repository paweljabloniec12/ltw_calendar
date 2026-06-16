"use client";
import React from "react"
import { useMemo, useState, useEffect } from "react";
import {
  Globe,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { serviceHints } from "@/lib/services";
import { createClient } from "@/lib/supabase/browser";
import type { Profile } from "@/lib/types";
import DatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale/pl";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
registerLocale("pl", pl);


function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

/* ─── Brand SVG icons ─────────────────────────────────────────── */
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatWeddingDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function shortDesc(text: string | null | undefined, max = 90): string {
  if (!text) return "";
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

function avatarPath(fullName: string): string {
  const slug = fullName
    .toLowerCase()
    .replace(/ą/g, "a").replace(/ć/g, "c").replace(/ę/g, "e")
    .replace(/ł/g, "l").replace(/ń/g, "n").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `/img/${slug}.jpg`;
}

/* ─── Team info data ──────────────────────────────────────────── */
const teamPillars = [
  {
    icon: "✦",
    title: "Zaufani specjaliści",
    desc: "Wszystkie firmy w katalogu współpracują ze sobą od lat, gwarantując niezawodność i pełne zaangażowanie w każdy szczegół Waszego dnia.",
  },
  {
    icon: "✦",
    title: "Kompleksowa obsługa",
    desc: "Fotografia, video, muzyka, dekoracje, beauty, cukiernia i wiele więcej — jeden spójny team zamiast wielu niepowiązanych usługodawców.",
  },
  {
    icon: "✦",
    title: "Rabat −5% dla Pary",
    desc: "Skorzystajcie z oferty min. 3 usługodawców z naszego katalogu, a każdy z nich udzieli Wam rabatu 5%. Dodatkowo, polecane przez nas sale przygotowały dla Was wyjątkowe gratisy. Szczegóły u usługodawców i w salach weselnych.",
  },
];

/* ─── Team Info Section ───────────────────────────────────────── */
function TeamInfoSection() {
  return (
    <section className="team-info" aria-label="O Lubelskim Team Weselnym">
      <div className="team-info-divider">
        <span className="team-info-divider-line" />
        <span className="team-info-divider-ornament">❧</span>
        <span className="team-info-divider-line" />
      </div>
      <p className="team-info-eyebrow">#lubelskiteamweselny</p>
      <h2 className="team-info-title">
        Dlaczego warto wybrać<br />
        <em>Lubelski Team Weselny?</em>
      </h2>
      <p className="team-info-lead">
        Organizacja ślubu to wyjątkowy moment w życiu. <br></br>W naszym katalogu
        prezentujemy sprawdzonych usługodawców lubelskiej branży ślubnej,
        którzy od lat tworzą razem jeden spójny, niezawodny team.
      </p>
      <div className="team-pillars">
        {teamPillars.map((pillar) => (
          <div className="team-pillar" key={pillar.title}>
            <span className="team-pillar-icon" aria-hidden="true">{pillar.icon}</span>
            <h3 className="team-pillar-title">{pillar.title}</h3>
            <p className="team-pillar-desc">{pillar.desc}</p>
          </div>
        ))}
      </div>
      <a
        className="catalog-banner"
        href="https://www.canva.com/design/DAGdIJYbSkw/g6hpi5iJjFJO1RZDoOntWA/view?utm_content=DAGdIJYbSkw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6c71fb542b"
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("catalog_click", { location: "home" })}
        aria-label="Zobacz katalog Lubelskiego Teamu Weselnego"
      >
        <span className="catalog-banner-script">Lubelski</span>
        <span className="catalog-banner-title">Team Weselny</span>
        <span className="catalog-banner-sub">
          Zobacz katalog polecanych usługodawców i otrzymaj rabat!
        </span>
      </a>
      <p className="team-info-hashtag">
        Życzymy udanych przygotowań i pięknego dnia, który na zawsze pozostanie
        w Waszej pamięci!
      </p>

      <div className="team-social-wrap">
        <p className="team-social-label">Sprawdź nasze realizacje</p>
        <div className="team-social-icons">
          <a
            className="team-social-link"
            href="https://www.instagram.com/lubelski_team_weselny/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram Lubelski Team Weselny"
          >
            <IconInstagram className="team-social-icon" />
          </a>
          <a
            className="team-social-link"
            href="https://www.facebook.com/lubelskiteamweselny/?locale=pl_PL"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook Lubelski Team Weselny"
          >
            <IconFacebook className="team-social-icon" />
          </a>
          <a
            className="team-social-link"
            href="https://www.tiktok.com/@lubelski_team_weselny"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok Lubelski Team Weselny"
          >
            <IconTikTok className="team-social-icon" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Rich description renderer ──────────────────────────────── */

// POPRAWKA: Dodaliśmy \uFE0F? na końcu, aby wychwycić niewidzialny selektor koloru emoji
const EXTENDED_EMOJI_RE = /^\p{Extended_Pictographic}\uFE0F?/u;
const BULLET_RE = /^[•\-–—►✓✔]\s+/;
const HEADING_RE = /^.{3,60}:$/u;

type ParsedLine =
  | { kind: "emoji"; emoji: string; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "text"; text: string };

function parseLine(raw: string): ParsedLine {
  const s = raw.trim();
  if (!s) return { kind: "text", text: "" };

  // POPRAWKA: Zamiast [...s][0], używamy metody .match(). 
  // Dzięki temu emoji takie jak ❤️, ⏱️ czy ☠️ nie tracą swoich kolorów.
  const emojiMatch = s.match(EXTENDED_EMOJI_RE);
  if (emojiMatch) {
    const emoji = emojiMatch[0];
    return { kind: "emoji", emoji, text: s.slice(emoji.length).trim() };
  }

  if (BULLET_RE.test(s)) {
    return { kind: "bullet", text: s.replace(BULLET_RE, "") };
  }
  return { kind: "text", text: s };
}

function RichDesc({ text }: { text: string }) {
  if (!text) return null;

  const cleanedText = text.trim();

  // Normalizacja pustych linii (usuwanie spacji z pustych linii)
  const normalizedText = cleanedText.replace(/\n\s*\n/g, (match) => {
    const nlCount = (match.match(/\n/g) || []).length;
    return "\n".repeat(nlCount);
  });

  // Podział na bloki z zachowaniem separatorów \n
  const blocks = normalizedText.split(/(\n{2,})/).filter(Boolean);
  const blockStyle = { margin: "0 0 0 0" };

  return (
    <div className="pdesc-rich">
      {blocks.map((block, bi) => {
        // Obsługa kontrolowanych przerw pionowych (gdy enterów jest więcej niż 2)
        if (/^\n+$/.test(block)) {
          const nlCount = block.length;
          if (nlCount <= 2) return null;

          const extraLines = nlCount - 2;
          return (
            <div
              key={bi}
              className="pdesc-spacer"
              style={{ height: `${extraLines * 1.25}rem` }}
            />
          );
        }

        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length === 0) return null;

        if (lines.length === 1 && HEADING_RE.test(lines[0])) {
          return (
            <p key={bi} className="pdesc-heading" style={{ ...blockStyle, color: "var(--brown)", fontWeight: "600" }}>
              {lines[0]}
            </p>
          );
        }

        const parsed = lines.map(parseLine);
        const allList = parsed.every(
          (l) => l.kind === "emoji" || l.kind === "bullet"
        );

        // Renderowanie listy <ul> (zarówno dla emoji jak i ✦)
        if (allList && parsed.length > 0) {
          return (
            <ul key={bi} className="pdesc-list" style={{ ...blockStyle, paddingLeft: "0", listStyle: "none" }}>
              {parsed.map((item, li) => (
                <li key={li} className="pdesc-list-item" style={{ display: "flex", alignItems: "flex-start", marginBottom: "6px" }}>
                  {item.kind === "emoji" && (
                    <span className="pdesc-emoji" aria-hidden="true" style={{ marginRight: "8px", flexShrink: 0 }}>
                      {item.emoji}
                    </span>
                  )}
                  {item.kind === "bullet" && (
                    <span className="pdesc-bullet" aria-hidden="true" style={{ marginRight: "8px", color: "var(--gold)", flexShrink: 0 }}>
                      ✦
                    </span>
                  )}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Zwykły akapit tekstowy
        return (
          <p key={bi} className="pdesc-para" style={{ ...blockStyle, lineHeight: "1.55" }}>
            {lines.map((line, li) => (
              <span key={li}>
                {line}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Provider Modal ──────────────────────────────────────────── */
type ProviderModalProps = {
  profile: Profile;
  onClose: () => void;
};

function ProviderModal({ profile, onClose }: ProviderModalProps) {
  const desc = profile.description || serviceHints[profile.service_type] || "";
  const [imgError, setImgError] = useState(false);
  const imgSrc = avatarPath(profile.full_name);

  const initials = profile.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  useState(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className="pmodal-backdrop"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Wizytówka: ${profile.full_name}`}
    >
      <div className="pmodal">
        <button
          className="pmodal-close"
          onClick={onClose}
          type="button"
          aria-label="Zamknij wizytówkę"
        >
          <X aria-hidden="true" />
        </button>

        <div className="pmodal-hdr">
          <p className="pmodal-type">{profile.service_type}</p>
          <h2 className="pmodal-name">{profile.full_name}</h2>
        </div>

        <div className="pmodal-body">
          {!imgError ? (
            <div className="pmodal-photo">
              <Image
                src={imgSrc}
                alt={profile.full_name}
                className="pmodal-photo-img"
                width={460}
                height={340}
                style={{ objectFit: "cover", objectPosition: "top center" }}
                onError={() => setImgError(true)}
                priority={false}
              />
            </div>

          ) : (
            <div className="pmodal-avatar" aria-hidden="true">
              <span className="pmodal-avatar-initials">{initials}</span>
            </div>
          )}

          {/* ✅ Zamienione na RichDesc */}
          {desc ? <RichDesc text={desc} /> : null}

          <div className="pmodal-links">
            {profile.website_url ? (
              <a className="pmodal-link" href={profile.website_url} rel="noreferrer" target="_blank" onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "website",
              })}>
                <Globe className="pmodal-link-icon" aria-hidden="true" />
                <span>Strona www</span>
              </a>
            ) : null}
            {profile.instagram_url ? (
              <a className="pmodal-link" href={profile.instagram_url} rel="noreferrer" target="_blank" onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "instagram",
              })}>
                <IconInstagram className="pmodal-link-icon" />
                <span>Instagram</span>
              </a>
            ) : null}
            {profile.facebook_url ? (
              <a className="pmodal-link" href={profile.facebook_url} rel="noreferrer" target="_blank" onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "facebook",
              })}>
                <IconFacebook className="pmodal-link-icon" />
                <span>Facebook</span>
              </a>
            ) : null}
            {profile.tiktok_url ? (
              <a className="pmodal-link" href={profile.tiktok_url} rel="noreferrer" target="_blank" onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "tiktok",
              })}>
                <IconTikTok className="pmodal-link-icon" />
                <span>TikTok</span>
              </a>
            ) : null}
            {profile.email_public ? (
              <a className="pmodal-link" href={`mailto:${profile.email_public}`} onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "email",
              })}>
                <Mail className="pmodal-link-icon" aria-hidden="true" />
                <span>{profile.email_public}</span>
              </a>
            ) : null}
            {profile.phone ? (
              <a className="pmodal-link" href={`tel:${profile.phone}`} onClick={() => trackEvent("contact_click", {
                provider_name: profile.full_name,
                link_type: "phone",
              })}>
                <Phone className="pmodal-link-icon" aria-hidden="true" />
                <span>{profile.phone}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Provider Card ───────────────────────────────────────────── */
type ProviderCardProps = {
  profile: Profile;
  onClick: () => void;
  onPrefetch: () => void;
};

function ProviderCard({ profile, onClick, onPrefetch }: ProviderCardProps) {
  const desc = profile.description || serviceHints[profile.service_type] || "";

  return (
    <button
      className="pcard2"
      onClick={onClick}
      onMouseEnter={onPrefetch}
      type="button"
      aria-label={`${profile.full_name} — ${profile.service_type}. Kliknij, aby zobaczyć szczegóły`}
    >
      <div className="pcard2-type">{profile.service_type}</div>
      <h2 className="pcard2-name">{profile.full_name}</h2>
      {desc ? (
        <p className="pcard2-desc">{shortDesc(desc)}</p>
      ) : null}
      <span className="pcard2-cta">Kliknij i sprawdź szczegóły →</span>
    </button>
  );
}
// Dodaj nad komponentem AvailabilitySearch:
const ReadOnlyInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input {...props} ref={ref} readOnly />
);
ReadOnlyInput.displayName = "ReadOnlyInput";
/* ─── Main Component ──────────────────────────────────────────── */
export function AvailabilitySearch() {
  const [selectedDate, setSelectedDate] = useState("");
  const [confirmedDate, setConfirmedDate] = useState("");
  const [providers, setProviders] = useState<Profile[]>([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function checkAvailability() {
    if (!selectedDate) return;

    trackEvent("date_search", { date: selectedDate });

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const [{ data: profiles, error: profilesError }, { data: booked, error }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("is_active", true),
          supabase
            .from("booked_dates")
            .select("provider_id")
            .eq("date", selectedDate),
        ]);

      if (profilesError || error) {
        setMessage("Nie udało się pobrać dostępności. Sprawdź konfigurację Supabase.");
        return;
      }

      const bookedIds = new Set((booked ?? []).map((r) => r.provider_id));
      const active = profiles ?? [];

      /* ─── FILTROWANIE ADMINA ORAZ ZABLOKOWANYCH USŁUGODAWCÓW ─── */
      const adminId = "f7ec9695-3fbe-49b6-b9c8-a15e7fb0ecc9";

      const visibleProfiles = active.filter((p) => {
        if (p.id === adminId) return false; // <-- CAŁKOWICIE UKRYWAMY ADMINA Z WYNIKÓW I LICZNIKA
        if (!p.suspended_until) return true; // Brak daty = brak blokady
        return new Date(p.suspended_until) <= new Date(); // Blokada minęła lub jest w przeszłości
      });

      // Z widocznych, nie-administracyjnych profili wybieramy te, które nie są zajęte w wybranym dniu
      const availableProviders = visibleProfiles.filter((p) => !bookedIds.has(p.id));

      /* ─── NOWE: NIESTANDARDOWE SORTOWANIE WEDŁUG TWOICH KATEGORII ─── */
      const SERVICE_PRIORITY: Record<string, number> = {
        "fotografia": 1,
        "video": 2,
        "zespół": 3,
        "zespoł": 3,
        "dj": 4,
        "dekoracje": 5,
        "salon sukni ślubnych": 6,
        "bar": 7,
        "beauty": 8,
        "cukiernie": 9,
        "cukiernia": 9,
        "atrakcje": 10,
        "content creator": 11,
        "oprawa muzyczna": 12,
        "animacje": 13,
        "sala weselna": 14,
        "samochód": 15
      };

      availableProviders.sort((a, b) => {
        // Sprowadzamy tekst do małych liter i usuwamy zbędne spacje, żeby dopasować do mapy priorytetów
        const typeA = (a.service_type || "").toLowerCase().trim();
        const typeB = (b.service_type || "").toLowerCase().trim();

        // Pobieramy wagę (jeśli kategorii nie ma na liście, dostaje odległy numer 999)
        const priorityA = SERVICE_PRIORITY[typeA] ?? 999;
        const priorityB = SERVICE_PRIORITY[typeB] ?? 999;

        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Sortowanie od 1 do 13
        }

        // Jeśli kategoria jest taka sama (np. dwóch fotografów), sortujemy ich alfabetycznie po nazwie/imieniu
        return (a.full_name || "").localeCompare(b.full_name || "", "pl");
      });
      /* ────────────────────────────────────────────────────────────── */

      setProviders(availableProviders);
      setTotalProviders(visibleProfiles.length); // Licznik pokaże prawidłową liczbę (bez admina i bez zablokowanych)
      setConfirmedDate(selectedDate);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Nie udało się połączyć z Supabase.");
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setSelectedDate("");
    setConfirmedDate("");
    setProviders([]);
    setTotalProviders(0);
    setActiveProfile(null);
    setMessage("");
    window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  }

  const dateObject = selectedDate ? new Date(`${selectedDate}T12:00:00`) : null;

  if (!confirmedDate) {
    return (
      <>
        <main className="hero">
          <div className="hero-logo">
            <span className="hero-logo-script">Lubelski</span>
            <span className="hero-logo-sans">Team Weselny</span>
          </div>
          <h1 className="htitle">
            Podaj nam swoją<br />
            <em>datę ślubu / wesela</em>
          </h1>
          <p className="hsub">
            Sprawdzimy, którzy specjaliści z naszego teamu mają wolny termin i są
            dostępni tego dnia.
          </p>
          <div className="datebox">
            {message ? <p className="errbox">{message}</p> : null}
            <label className="dlabel" htmlFor="wedding-date">
              Data ślubu / wesela
            </label>
            <div className="custom-datepicker-container">
              <DatePicker
                selected={dateObject}
                onChange={(date: Date | null) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    setSelectedDate(`${yyyy}-${mm}-${dd}`);
                  } else {
                    setSelectedDate("");
                  }
                }}
                minDate={new Date()}
                dateFormat="dd.MM.yyyy"
                locale="pl"
                id="wedding-date"
                className="dinput"
                placeholderText="dd.mm.rrrr"
                autoComplete="off"
                withPortal={isMobile}
                portalId="datepicker-portal"
                customInput={<ReadOnlyInput />}
              />
            </div>
            <button
              className="cbtn"
              disabled={!selectedDate || loading}
              onClick={checkAvailability}
              type="button"
            >
              {loading ? (
                <Loader2 className="btn-icon animate-spin" aria-hidden="true" />
              ) : (
                <Search className="btn-icon" aria-hidden="true" />
              )}
              Potwierdź datę
            </button>
          </div>
        </main>

        <TeamInfoSection />
      </>
    );
  }

  return (
    <>
      <main className="rsec">
        <div className="rbanner">
          <p className="dlabel">Dostępni specjaliści</p>
          <p className="rtitle">
            Wyniki dla <em>{formatWeddingDate(confirmedDate)}</em>
          </p>
        </div>
        <p className="rsub">
          Kliknij w kafelek usługodawcy, aby zobaczyć jego pełną wizytówkę i dane kontaktowe.
        </p>
        {message ? <p className="errbox">{message}</p> : null}

        {providers.length > 0 ? (
          <>
            <p className="rcount">
              ✓ {providers.length} z {totalProviders} DOSTĘPNYCH
            </p>
            <div className="pgrid2">
              {providers.map((profile) => (
                <ProviderCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => {
                    trackEvent("provider_click", {
                      provider_name: profile.full_name,
                      service_type: profile.service_type,
                    });
                    setActiveProfile(profile);
                  }}
                  onPrefetch={() => {
                    const img = new window.Image();
                    img.src = avatarPath(profile.full_name);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            Wszyscy aktywni specjaliści są zajęci w tym terminie. Wybierz inną datę.
          </div>
        )}

        <div className="results-footer">
          <a
            className="catalog-banner"
            href="https://www.canva.com/design/DAGdIJYbSkw/g6hpi5iJjFJO1RZDoOntWA/view?utm_content=DAGdIJYbSkw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6c71fb542b"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("catalog_click", { location: "results" })}
            aria-label="Zobacz katalog Lubelskiego Teamu Weselnego"
          >
            <span className="catalog-banner-script">Lubelski</span>
            <span className="catalog-banner-title">Team Weselny</span>
            <span className="catalog-banner-sub">
              Zobacz katalog polecanych usługodawców i otrzymaj rabat!
            </span>
          </a>

          <button
            className="cbtn reset-btn"
            onClick={resetSearch}
            type="button"
          >
            <RotateCcw className="btn-icon" aria-hidden="true" />
            Zmień datę
          </button>
        </div>
      </main>

      {activeProfile ? (
        <ProviderModal
          profile={activeProfile}
          onClose={() => setActiveProfile(null)}
        />
      ) : null}
    </>
  );
}