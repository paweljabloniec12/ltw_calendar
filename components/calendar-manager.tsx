"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { removeBookedDate, setBookedDatesStatus } from "@/app/actions/dates";
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
                className={`mypicker-item${
                  pickedYear === currentYear && i === currentMonth
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
  initialBookedDates,
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

  return (
    <>
      <div className="dhdr">
        <div>
          <p className="dtype">{profile.service_type}</p>
          <h1 className="dtitle">
            Witaj, <em>{profile.full_name.split(" ")[0]}</em>
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