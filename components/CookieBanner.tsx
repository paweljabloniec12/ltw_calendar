"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sprawdzamy, czy użytkownik już wcześniej zamknął baner
    const hasConsent = localStorage.getItem("ltw-cookie-consent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ltw-cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        Nasza strona korzysta z plików cookies oraz pamięci przeglądarki (localStorage) w celu zapewnienia prawidłowego i bezpiecznego działania aplikacji (np. utrzymanie sesji logowania). Nie używamy ich do śledzenia Twojej aktywności w celach reklamowych.
      </p>
      
      <button
        onClick={handleAccept}
        type="button"
        className="cookie-banner-btn"
      >
        Rozumiem i akceptuję
      </button>
    </div>
  );
}