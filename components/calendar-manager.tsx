"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { removeBookedDate, setBookedDatesStatus } from "@/app/actions/dates";
import { createClient } from "@/lib/supabase/browser";
import type { BookedDate, Profile } from "@/lib/types";

const monthNames = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const weekDays = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

type CalendarManagerProps = {
  profile: Profile;
  initialBookedDates: BookedDate[];
};

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function firstWeekdayIndex(year: number, month: number) {
  const jsDay = new Date(year, month, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function selectedSuffix(count: number) {
  if (count === 1) return "dzień";
  return "dni";
}

/* ─── Month/Year Popup Picker ─────────────────────────────────── */

type PickerStep = "year" | "month";

type MonthYearPickerProps = {
  currentYear: number;
  currentMonth: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
};

function MonthYearPicker({
  currentYear,
  currentMonth,
  onSelect,
  onClose,
}: MonthYearPickerProps) {
  const [step, setStep] = useState<PickerStep>("year");
  const [pickedYear, setPickedYear] = useState(currentYear);
  const popupRef = useRef<HTMLDivElement>(null);

  const baseYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 12 }, (_, i) => baseYear - 1 + i),
    [baseYear],
  );

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleYearClick(y: number) {
    setPickedYear(y);
    setStep("month");
  }

  function handleMonthClick(m: number) {
    onSelect(pickedYear, m);
    onClose();
  }

  return (
    <div className="mypicker-backdrop">
      <div className="mypicker" ref={popupRef} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="mypicker-hdr">
          {step === "month" && (
            <button
              className="mypicker-back"
              onClick={() => setStep("year")}
              type="button"
              aria-label="Wróć do wyboru roku"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          )}
          <span className="mypicker-title">
            {step === "year" ? "Wybierz rok" : `${pickedYear} — wybierz miesiąc`}
          </span>
          <button
            className="mypicker-close"
            onClick={onClose}
            type="button"
            aria-label="Zamknij"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {step === "year" && (
          <div className="mypicker-grid mypicker-grid--years">
            {years.map((y) => (
              <button
                key={y}
                className={`mypicker-item${y === currentYear ? " mypicker-item--current" : ""}`}
                onClick={() => handleYearClick(y)}
                type="button"
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {step === "month" && (
          <div className="mypicker-grid mypicker-grid--months">
            {monthNames.map((name, i) => (
              <button
                key={name}
                className={`mypicker-item${pickedYear === currentYear && i === currentMonth
                    ? " mypicker-item--current"
                    : ""
                  }`}
                onClick={() => handleMonthClick(i)}
                type="button"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

export function CalendarManager({
  profile,
  initialBookedDates: initialBookedDates,
}: CalendarManagerProps) {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => todayIso(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [busyDates, setBusyDates] = useState<Set<string>>(
    () => new Set(initialBookedDates.map((item) => item.date)),
  );
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);

  /* Sekcja stanów dla administratora aplikacji */
  const isAdmin = profile.id === "f7ec9695-3fbe-49b6-b9c8-a15e7fb0ecc9";
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [adminMode, setAdminMode] = useState<"none" | "block" | "unblock">("none");
  const [blockDuration, setBlockDuration] = useState<string>("1_month");
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    provider: any | null;
    action: "block" | "unblock";
  }>({ open: false, provider: null, action: "block" });

  useEffect(() => {
    if (!isAdmin) return;
    async function fetchAllProviders() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (!error && data) {
        setAllProfiles(data);
      }
    }
    fetchAllProviders();
  }, [isAdmin]);

  const bookedList = useMemo(() => [...busyDates].sort(), [busyDates]);
  const selectedCount = selectedDates.size;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyCells = firstWeekdayIndex(year, month);

  function selectWholeMonth() {
    if (isPending) return;
    const dates = new Set<string>();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = toIsoDate(year, month, day);
      if (date >= today) dates.add(date);
    }
    setSelectedDates(dates);
  }

  function clearWholeMonth() {
    if (isPending) return;
    setSelectedDates(new Set());
  }

  function changeMonth(direction: -1 | 1) {
    setSelectedDates(new Set());
    setNotice("");
    if (direction === -1 && month === 0) {
      setMonth(11);
      setYear((v) => v - 1);
      return;
    }
    if (direction === 1 && month === 11) {
      setMonth(0);
      setYear((v) => v + 1);
      return;
    }
    setMonth((v) => v + direction);
  }

  function handlePickerSelect(selectedYear: number, selectedMonth: number) {
    setYear(selectedYear);
    setMonth(selectedMonth);
    setSelectedDates(new Set());
    setNotice("");
  }

  function toggleDate(date: string) {
    if (date < today || isPending) return;
    setNotice("");
    setSelectedDates((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function applyStatus(status: "busy" | "free") {
    const dates = [...selectedDates];
    if (dates.length === 0) return;

    startTransition(async () => {
      const result = await setBookedDatesStatus({ dates, status });
      setNotice(result.message);
      if (result.success) {
        setBusyDates((current) => {
          const next = new Set(current);
          dates.forEach((date) => {
            if (status === "busy") next.add(date);
            else next.delete(date);
          });
          return next;
        });
        setSelectedDates(new Set());
        router.refresh();
      }
    });
  }

  function removeOne(date: string) {
    startTransition(async () => {
      const result = await removeBookedDate({ date });
      setNotice(result.message);
      if (result.success) {
        setBusyDates((current) => {
          const next = new Set(current);
          next.delete(date);
          return next;
        });
        setSelectedDates((current) => {
          const next = new Set(current);
          next.delete(date);
          return next;
        });
        router.refresh();
      }
    });
  }

  /* Funkcja wykonująca blokadę / odblokowanie w bazie przez Admina */
  async function handleAdminExecuteAction() {
    if (!confirmModal.provider) return;
    const provider = confirmModal.provider;
    const supabase = createClient();

    startTransition(async () => {
      let targetValue: string | null = null;

      if (confirmModal.action === "block") {
        const targetDate = new Date();
        if (blockDuration === "1_week") targetDate.setDate(targetDate.getDate() + 7);
        else if (blockDuration === "3_months") targetDate.setMonth(targetDate.getMonth() + 3);
        else targetDate.setMonth(targetDate.getMonth() + 1); // domyślnie 1 miesiąc

        targetValue = targetDate.toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update({ suspended_until: targetValue })
        .eq("id", provider.id);

      if (error) {
        setNotice(`Błąd administratora: ${error.message}`);
      } else {
        setNotice(
          `Pomyślnie ${confirmModal.action === "block" ? "zablokowano" : "odblokowano"} usługodawcę ${provider.full_name}`
        );
        // Aktualizacja lokalnego stanu listy, by zmiany były widoczne od razu
        setAllProfiles((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, suspended_until: targetValue } : p))
        );
      }
      setConfirmModal({ open: false, provider: null, action: "block" });
      router.refresh();
    });
  }

  // Listy filtrowane dla admina
const adminId = "f7ec9695-3fbe-49b6-b9c8-a15e7fb0ecc9";

  const activeProviders = allProfiles.filter((p) => {
    if (p.id === adminId) return false; // <-- WYKLUCZAMY ADMINA
    if (!p.suspended_until) return true;
    return new Date(p.suspended_until) <= new Date();
  });

  const blockedProviders = allProfiles.filter((p) => {
    if (p.id === adminId) return false; // <-- WYKLUCZAMY ADMINA
    if (!p.suspended_until) return false;
    return new Date(p.suspended_until) > new Date();
  });

  const suspendedUntil = profile.suspended_until;
  const isCurrentSuspended = suspendedUntil && new Date(suspendedUntil) > new Date();
  
  if (isCurrentSuspended && suspendedUntil) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", padding: 20 }}>
        <div className="scard" style={{ maxWidth: 500, width: "100%", padding: "40px 32px", textAlign: "center", border: "1px solid var(--wine)", borderRadius: 8 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 className="dtitle" style={{ color: "var(--wine)", fontSize: 24, marginBottom: 12, fontWeight: "700" }}>
            Konto zawieszone
          </h1>
          <p style={{ color: "var(--brown)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Dostęp do Twojego panelu zarządzania został tymczasowo zablokowany przez administratora aplikacji. Twoja oferta nie jest teraz widoczna dla klientów.
          </p>
          <div style={{ background: "rgba(141, 25, 46, 0.05)", padding: "12px", borderRadius: 6, inlineSize: "max-content", margin: "0 auto 24px auto" }}>
            <span style={{ fontSize: 13, fontWeight: "600", color: "var(--wine)" }}>
              {/* Tutaj przekazujemy bezpieczną stałą suspendedUntil, która na pewno jest stringiem */}
              Blokada obowiązuje do: {new Date(suspendedUntil).toLocaleDateString("pl-PL")} r.
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--gray)" }}>
            Jeśli uważasz, że to pomyłka, skontaktuj się bezpośrednio z administratorem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dhdr">
        <div>
          <p className="dtype">{profile.service_type}</p>
          <h1 className="dtitle">
            Witaj, <em>{profile.full_name}</em>
          </h1>
        </div>
      </div>
      <div className="dash-tip">
        <strong>Jak zarządzać terminami</strong>
        Klikaj dni w kalendarzu, aby je zaznaczyć. Następnie wybierz, czy mają
        być zajęte czy wolne. Klient zobaczy Cię na liście tylko wtedy, gdy
        dany dzień nie jest oznaczony jako zajęty.
      </div>
      {notice ? <p className="sucbox panel-msg">{notice}</p> : null}

      {/* ─── PANEL ADMINISTRATORA (Widoczny tylko dla wybranego ID) ─── */}
      {isAdmin && (
        <div className="scard" style={{ marginBottom: 28, border: "1px solid var(--wine)" }}>
          <div className="shead" style={{ background: "var(--wine)", color: "#fff", fontWeight: "600" }}>
            Panel Główny Administratora
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button
                type="button"
                className={`month-btn ${adminMode === "block" ? "" : "secondary"}`}
                onClick={() => setAdminMode(adminMode === "block" ? "none" : "block")}
                style={{ margin: 0, width: "auto", padding: "8px 16px" }}
              >
                Zablokuj usługodawcę
              </button>
              <button
                type="button"
                className={`month-btn ${adminMode === "unblock" ? "" : "secondary"}`}
                onClick={() => setAdminMode(adminMode === "unblock" ? "none" : "unblock")}
                style={{ margin: 0, width: "auto", padding: "8px 16px" }}
              >
                Odblokuj usługodawcę
              </button>
            </div>

            {/* Widok listy do zablokowania */}
            {adminMode === "block" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: "600", display: "block", marginBottom: 6 }}>
                    Okres blokady konta:
                  </label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid var(--lgray)", fontSize: 13 }}
                  >
                    <option value="1_week">1 tydzień</option>
                    <option value="1_month">1 miesiąc</option>
                    <option value="3_months">3 miesiące</option>
                  </select>
                </div>

                <label style={{ fontSize: 13, fontWeight: "600", display: "block", marginBottom: 6 }}>
                  Wybierz osobę do zablokowania:
                </label>
                <div className="slist" style={{ maxHeight: 220, overflowY: "auto", border: "1px solid var(--lgray)", borderRadius: 6 }}>
                  {activeProviders.map((p) => (
                    <div key={p.id} className="sitem" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
                      <span style={{ fontSize: 13 }}>{p.full_name} <em style={{ color: "var(--gray)", fontSize: 12 }}>({p.service_type || "Brak typu"})</em></span>
                      <button
                        type="button"
                        className="acbtn busy"
                        style={{ padding: "4px 10px", fontSize: 12, height: "auto", width: "auto" }}
                        onClick={() => setConfirmModal({ open: true, provider: p, action: "block" })}
                      >
                        Zablokuj
                      </button>
                    </div>
                  ))}
                  {activeProviders.length === 0 && <div className="emsg">Brak aktywnych usługodawców</div>}
                </div>
              </div>
            )}

            {/* Widok listy do odblokowania */}
            {adminMode === "unblock" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <label style={{ fontSize: 13, fontWeight: "600", display: "block", marginBottom: 6 }}>
                  Aktualnie zablokowani usługodawcy:
                </label>
                <div className="slist" style={{ maxHeight: 220, overflowY: "auto", border: "1px solid var(--lgray)", borderRadius: 6 }}>
                  {blockedProviders.map((p) => (
                    <div key={p.id} className="sitem" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: "600", display: "block" }}>{p.full_name}</span>
                        <span style={{ fontSize: 11, color: "var(--wine)" }}>
                          Blokada do: {new Date(p.suspended_until).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="acbtn free"
                        style={{ padding: "4px 10px", fontSize: 12, height: "auto", width: "auto" }}
                        onClick={() => setConfirmModal({ open: true, provider: p, action: "unblock" })}
                      >
                        Odblokuj
                      </button>
                    </div>
                  ))}
                  {blockedProviders.length === 0 && <div className="emsg">Brak zablokowanych użytkowników</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL POTWIERDZENIA AKCJI (TAK/NIE) ─── */}
      {confirmModal.open && confirmModal.provider && (
        <div className="mypicker-backdrop" style={{ zIndex: 2000 }}>
          <div className="mypicker" style={{ maxWidth: 420, padding: 24, borderRadius: 8 }}>
            <div className="mypicker-hdr" style={{ marginBottom: 16 }}>
              <span className="mypicker-title" style={{ fontWeight: "600" }}>Potwierdź operację</span>
              <button
                className="mypicker-close"
                onClick={() => setConfirmModal({ open: false, provider: null, action: "block" })}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--brown)" }}>
                Czy chcesz {confirmModal.action === "block" ? "zablokować" : "odblokować"} usługodawcę{" "}
                <strong>{confirmModal.provider.full_name}</strong>?
              </p>
              {confirmModal.action === "block" && (
                <p style={{ fontSize: 12, color: "var(--wine)", marginTop: 8, fontWeight: "600" }}>
                  Wybrany czas zawieszenia konta: {blockDuration === "1_week" ? "1 tydzień" : blockDuration === "3_months" ? "3 miesiące" : "1 miesiąc"}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                className="acbtn busy"
                style={{ padding: "8px 24px", width: "100px" }}
                onClick={handleAdminExecuteAction}
                disabled={isPending}
              >
                {isPending ? "..." : "Tak"}
              </button>
              <button
                type="button"
                className="acbtn cancel"
                style={{ padding: "8px 24px", width: "100px" }}
                onClick={() => setConfirmModal({ open: false, provider: null, action: "block" })}
                disabled={isPending}
              >
                Nie
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dlayout">
        <div>
          <div className="cal-wrap">
            <div className="cal-hdr">
              <button
                aria-label="Poprzedni miesiąc"
                className="cnav"
                onClick={() => changeMonth(-1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" />
              </button>

              {/* ← Clicking this opens the picker popup */}
              <button
                type="button"
                className="cmonth-picker-btn"
                onClick={() => setShowPicker((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={showPicker}
              >
                {monthNames[month]} {year}
              </button>

              <button
                aria-label="Następny miesiąc"
                className="cnav"
                onClick={() => changeMonth(1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>

            {/* Popup rendered outside the header flow */}
            {showPicker && (
              <MonthYearPicker
                currentYear={year}
                currentMonth={month}
                onSelect={handlePickerSelect}
                onClose={() => setShowPicker(false)}
              />
            )}

            <div className="cdn">
              {weekDays.map((day, index) => (
                <div className={`cdname ${index > 4 ? "w" : ""}`} key={day}>
                  {day}
                </div>
              ))}
            </div>
            <div className="cgrid">
              {Array.from({ length: leadingEmptyCells }).map((_, index) => (
                <div className="cell emp" key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = toIsoDate(year, month, day);
                const dow = new Date(`${date}T12:00:00`).getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isPast = date < today;
                const isBooked = busyDates.has(date);
                const isSelected = selectedDates.has(date);
                const isToday = date === today;
                const classes = [
                  "cell",
                  isPast ? "past" : "",
                  !isPast && isSelected ? "sel" : "",
                  !isPast && !isSelected && isBooked ? "booked" : "",
                  !isPast && isWeekend ? "wknd" : "",
                  isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    className={classes}
                    disabled={isPast || isPending}
                    key={date}
                    onClick={() => toggleDate(date)}
                    title={date}
                    type="button"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className={`actbar ${selectedCount > 0 ? "show" : ""}`}>
              <span className="aclabel">
                Zaznaczono: {selectedCount} {selectedSuffix(selectedCount)}
              </span>
              <button
                className="acbtn busy"
                disabled={isPending}
                onClick={() => applyStatus("busy")}
                type="button"
              >
                {isPending ? "Zapisywanie" : "Oznacz zajęty"}
              </button>
              <button
                className="acbtn free"
                disabled={isPending}
                onClick={() => applyStatus("free")}
                type="button"
              >
                Oznacz wolny
              </button>
              <button
                className="acbtn cancel"
                disabled={isPending}
                onClick={() => setSelectedDates(new Set())}
                type="button"
              >
                Anuluj
              </button>
            </div>
            <div className="cleg">
              <span className="leg">
                <span className="legbox" style={{ background: "var(--wine)" }} />
                Zajęty
              </span>
              <span className="leg">
                <span
                  className="legbox"
                  style={{ background: "#fff", border: "1px solid var(--lgray)" }}
                />
                Wolny
              </span>
              <span className="leg">
                <span className="legbox" style={{ background: "var(--blue)" }} />
                Zaznaczony
              </span>
              <span className="leg">
                <span
                  className="legbox"
                  style={{ background: "#fff", outline: "2px solid var(--gold)" }}
                />
                Dziś
              </span>
            </div>
          </div>
        </div>

        <aside>
          <div className="month-actions">
            <button type="button" className="month-btn" onClick={selectWholeMonth}>
              Zaznacz cały miesiąc
            </button>
            <button type="button" className="month-btn secondary" onClick={clearWholeMonth}>
              Wyczyść zaznaczenie
            </button>
          </div>
          <div className="scard">
            <div className="shead">Zajęte terminy ({bookedList.length})</div>
            <div className="slist">
              {bookedList.length === 0 ? (
                <div className="emsg">Brak zajętych terminów</div>
              ) : (
                bookedList.map((date) => (
                  <div className="sitem" key={date}>
                    <span>{formatShortDate(date)}</span>
                    {date >= today ? (
                      <button
                        aria-label={`Oznacz ${date} jako wolny`}
                        className="rmbtn"
                        disabled={isPending}
                        onClick={() => removeOne(date)}
                        title="Oznacz jako wolny"
                        type="button"
                      >
                        {isPending ? (
                          <Loader2 className="btn-icon animate-spin" />
                        ) : (
                          <X aria-hidden="true" />
                        )}
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}