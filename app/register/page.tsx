import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="auth-page wide">
      <Link className="back-btn" href="/login">
        <ArrowLeft className="btn-icon" aria-hidden="true" />
        Powrót do logowania
      </Link>
      <h1 className="atitle">Rejestracja</h1>
      <p className="asub">
        Dostęp tylko dla zaproszonych specjalistów. Po rejestracji aplikacja
        wyśle email z potwierdzeniem konta.
      </p>
      <RegisterForm />
    </main>
  );
}
