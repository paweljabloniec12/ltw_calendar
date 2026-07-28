import React, { useState } from "react";

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

interface StepDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (isoDate: string, formattedDate: string) => void;
}

export const StepDatePickerModal: React.FC<StepDatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
}) => {
  // Pobranie dzisiejszej daty do porównań
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth(); // 0 = Styczeń
  const todayDay = today.getDate();

  const [step, setStep] = useState<"year" | "month" | "day">("year");
  const [selectedYear, setSelectedYear] = useState<number>(todayYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(todayMonth);

  if (!isOpen) return null;

  // Lista lat (od obecnego roku w górę)
  const years = Array.from({ length: 10 }, (_, i) => todayYear + i);

  // Liczba dni w wybranym miesiącu i roku
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Wyliczenie przesunięcia pierwszego dnia miesiąca
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  /* ─── Logika blokowania minionych dat ────────────────────────── */
  const isMonthDisabled = (monthIdx: number) => {
    if (selectedYear < todayYear) return true;
    if (selectedYear === todayYear && monthIdx < todayMonth) return true;
    return false;
  };

  const isDayDisabled = (dayNum: number) => {
    if (selectedYear < todayYear) return true;
    if (selectedYear === todayYear && selectedMonth < todayMonth) return true;
    if (selectedYear === todayYear && selectedMonth === todayMonth && dayNum < todayDay) {
      return true;
    }
    return false;
  };

  /* ─── Obsługa zdarzeń ────────────────────────────────────────── */
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep("month");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setStep("day");
  };

  const handleDaySelect = (day: number) => {
    const yyyy = selectedYear;
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    const isoDate = `${yyyy}-${mm}-${dd}`;
    const formattedDate = `${dd}.${mm}.${yyyy}`;

    onSelectDate(isoDate, formattedDate);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setStep("year");
    onClose();
  };

  return (
    <div className="step-modal-overlay" onClick={handleResetAndClose}>
      <div className="step-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Nagłówek modala */}
        <div className="step-modal-header">
          <h3>
            {step === "year" && "Krok 1/3: Wybierz rok"}
            {step === "month" && `Krok 2/3: Wybierz miesiąc (${selectedYear})`}
            {step === "day" && `Krok 3/3: Wybierz dzień (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
          </h3>
          <button className="step-modal-close" onClick={handleResetAndClose}>
            ✕
          </button>
        </div>

        {/* Treść modala */}
        <div className="step-modal-body">
          {/* KROK 1: ROK */}
          {step === "year" && (
            <div className="step-grid step-grid-years">
              {years.map((y) => (
                <button
                  key={y}
                  className="step-option-btn"
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* KROK 2: MIESIĄC */}
          {step === "month" && (
            <div>
              <button className="step-back-btn" onClick={() => setStep("year")}>
                ← Zmień rok
              </button>
              <div className="step-grid step-grid-months">
                {MONTH_NAMES.map((name, idx) => {
                  const disabled = isMonthDisabled(idx);
                  return (
                    <button
                      key={name}
                      className="step-option-btn"
                      disabled={disabled}
                      onClick={() => handleMonthSelect(idx)}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* KROK 3: DZIEŃ */}
          {step === "day" && (
            <div>
              <button className="step-back-btn" onClick={() => setStep("month")}>
                ← Zmień miesiąc
              </button>
              <div className="step-grid step-grid-days">
                {/* Etykiety dni tygodnia */}
                {WEEKDAYS.map((dayName) => (
                  <div key={dayName} className="weekday-header">
                    {dayName}
                  </div>
                ))}

                {/* Puste pola przed pierwszym dniem miesiąca */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="empty-day-slot" />
                ))}

                {/* Dni miesiąca */}
                {daysArray.map((d) => {
                  const disabled = isDayDisabled(d);
                  return (
                    <button
                      key={d}
                      className="step-option-btn step-day-btn"
                      disabled={disabled}
                      onClick={() => handleDaySelect(d)}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};