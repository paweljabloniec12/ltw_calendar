"use client";

import { useMemo, useState } from "react";
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
registerLocale("pl", pl);

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

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
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
        {/* Close button */}
        <button
          className="pmodal-close"
          onClick={onClose}
          type="button"
          aria-label="Zamknij wizytówkę"
        >
          <X aria-hidden="true" />
        </button>

        {/* Header strip */}
        <div className="pmodal-hdr">
          <p className="pmodal-type">{profile.service_type}</p>
          <h2 className="pmodal-name">{profile.full_name}</h2>
        </div>

        {/* Scrollable body */}
        <div className="pmodal-body">

          {/* Zdjęcie pełnej szerokości lub placeholder z inicjałami */}
          {!imgError ? (
            <div className="pmodal-photo">
              <img
                src={imgSrc}
                alt={profile.full_name}
                className="pmodal-photo-img"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="pmodal-avatar" aria-hidden="true">
              <span className="pmodal-avatar-initials">{initials}</span>
            </div>
          )}

          {/* Description */}
          {desc ? (
            <p className="pmodal-desc">{desc}</p>
          ) : null}

          {/* Social / contact links — siatka 2 kolumn */}
          <div className="pmodal-links">
            {profile.website_url ? (
              <a className="pmodal-link" href={profile.website_url} rel="noreferrer" target="_blank">
                <Globe className="pmodal-link-icon" aria-hidden="true" />
                <span>Strona www</span>
              </a>
            ) : null}
            {profile.instagram_url ? (
              <a className="pmodal-link" href={profile.instagram_url} rel="noreferrer" target="_blank">
                <IconInstagram className="pmodal-link-icon" />
                <span>Instagram</span>
              </a>
            ) : null}
            {profile.facebook_url ? (
              <a className="pmodal-link" href={profile.facebook_url} rel="noreferrer" target="_blank">
                <IconFacebook className="pmodal-link-icon" />
                <span>Facebook</span>
              </a>
            ) : null}
            {profile.tiktok_url ? (
              <a className="pmodal-link" href={profile.tiktok_url} rel="noreferrer" target="_blank">
                <IconTikTok className="pmodal-link-icon" />
                <span>TikTok</span>
              </a>
            ) : null}
            {profile.email_public ? (
              <a className="pmodal-link" href={`mailto:${profile.email_public}`}>
                <Mail className="pmodal-link-icon" aria-hidden="true" />
                <span>{profile.email_public}</span>
              </a>
            ) : null}
            {profile.phone ? (
              <a className="pmodal-link" href={`tel:${profile.phone}`}>
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
};

function ProviderCard({ profile, onClick }: ProviderCardProps) {
  const desc = profile.description || serviceHints[profile.service_type] || "";

  return (
    <button
      className="pcard2"
      onClick={onClick}
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

/* ─── Main Component ──────────────────────────────────────────── */
export function AvailabilitySearch() {
  const [selectedDate, setSelectedDate] = useState("");
  const [confirmedDate, setConfirmedDate] = useState("");
  const [providers, setProviders] = useState<Profile[]>([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkAvailability() {
    if (!selectedDate) return;
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const [{ data: profiles, error: profilesError }, { data: booked, error }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("is_active", true)
            .order("service_type", { ascending: true })
            .order("full_name", { ascending: true }),
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

      setProviders(active.filter((p) => !bookedIds.has(p.id)));
      setTotalProviders(active.length);
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
                  onClick={() => setActiveProfile(profile)}
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