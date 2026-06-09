import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <Link className="back-btn" href="/login">
        <ArrowLeft className="btn-icon" aria-hidden="true" />
        Powrót do logowania
      </Link>
      <h1 className="atitle">Reset hasła</h1>
      <p className="asub">
        Wpisz email konta. Otrzymasz link do ustawienia nowego hasła.
      </p>
      <ForgotPasswordForm />
    </main>
  );
}
