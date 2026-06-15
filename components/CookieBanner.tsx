"use client";

import { useState, useEffect } from "react";

// Dodaj swoje Measurement ID tutaj
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// Funkcja ładująca skrypt GA dynamicznie
function loadGoogleAnalytics() {
  if (document.getElementById("ga-script")) return; // zabezpieczenie przed podwójnym ładowaniem

  const script1 = document.createElement("script");
  script1.id = "ga-script";
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script1.async = true;
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(script2);
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ltw-cookie-consent");
    if (!consent) {
      setIsVisible(true);
    } else if (consent === "accepted") {
      // Użytkownik już wcześniej zaakceptował — ładujemy GA od razu
      loadGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ltw-cookie-consent", "accepted");
    setIsVisible(false);
    loadGoogleAnalytics(); // Ładujemy GA dopiero po akceptacji
  };

  const handleDecline = () => {
    localStorage.setItem("ltw-cookie-consent", "declined");
    setIsVisible(false);
    // GA NIE jest ładowane
  };

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