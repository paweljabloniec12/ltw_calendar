import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link className="back-btn" href="/">
        <ArrowLeft className="btn-icon" aria-hidden="true" />
        Powrót
      </Link>
      <h1 className="atitle">Logowanie</h1>
      <p className="asub">
        Panel jest dostępny wyłącznie dla zarejestrowanych usługodawców.
      </p>
      <LoginForm />
    </main>
  );
}
