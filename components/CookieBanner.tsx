"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ltw-cookie-consent");

    if (!consent) {
      setIsVisible(true);
      return;
    }

    if (consent === "accepted" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });

      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ltw-cookie-consent", "accepted");

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });

      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }

    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("ltw-cookie-consent", "declined");

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        Nasza strona korzysta z plików cookies w celu prawidłowego działania
        aplikacji oraz analizy ruchu za pomocą Google Analytics. Dane są
        anonimizowane i nie służą do personalizacji reklam.
      </p>

      <div className="cookie-banner-actions">
        <button
          onClick={handleDecline}
          type="button"
          className="cookie-banner-btn cookie-banner-btn--secondary"
        >
          Odrzucam
        </button>

        <button
          onClick={handleAccept}
          type="button"
          className="cookie-banner-btn"
        >
          Akceptuję
        </button>
      </div>
    </div>
  );
}