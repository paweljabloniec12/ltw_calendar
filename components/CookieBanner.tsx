"use client";

import { useState, useEffect } from "react";

// Dodaj swoje Measurement ID tutaj
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";



export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  const handleAccept = () => {
    localStorage.setItem("ltw-cookie-consent", "accepted");
    setIsVisible(false);
    // Odblokuj zbieranie danych w GA
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem("ltw-cookie-consent", "declined");
    setIsVisible(false);
    // GA pozostaje zablokowane — nic nie robimy
  };

  useEffect(() => {
    const consent = localStorage.getItem("ltw-cookie-consent");
    if (!consent) {
      setIsVisible(true);
    } else if (consent === "accepted") {
      // Użytkownik już wcześniej zaakceptował — odblokuj od razu
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        Nasza strona korzysta z plików cookies w celu prawidłowego działania aplikacji
        oraz analizy ruchu (Google Analytics). Dane są anonimizowane i nie służą celom reklamowym.
      </p>
      <div className="cookie-banner-actions">
        <button onClick={handleDecline} type="button" className="cookie-banner-btn cookie-banner-btn--secondary">
          Odrzucam
        </button>
        <button onClick={handleAccept} type="button" className="cookie-banner-btn">
          Akceptuję
        </button>
      </div>
    </div>
  );
}