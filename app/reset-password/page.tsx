import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <h1 className="atitle">Nowe hasło</h1>
      <p className="asub">
        Ustaw nowe hasło po wejściu z linku resetowania wysłanego przez
        Supabase.
      </p>
      <ResetPasswordForm />
    </main>
  );
}
