"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { FieldError } from "@/components/field-error";
import { initialActionState } from "@/lib/validation";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="auth-card">
      {state.message ? (
        <p className={state.success ? "sucbox" : "errbox"}>{state.message}</p>
      ) : null}
      <div className="fld">
        <label className="flabel" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="finput"
          id="email"
          name="email"
          placeholder="twoj@email.pl"
          type="email"
        />
        <FieldError errors={state.errors?.email} />
      </div>
      <div className="fld">
        <label className="flabel" htmlFor="password">
          Hasło
        </label>
        <input
          autoComplete="current-password"
          className="finput"
          id="password"
          name="password"
          placeholder="••••••••"
          type="password"
        />
        <FieldError errors={state.errors?.password} />
      </div>
      <button className="sbtn" disabled={pending} type="submit">
        {pending ? (
          <Loader2 className="btn-icon animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="btn-icon" aria-hidden="true" />
        )}
        Zaloguj się
      </button>
      <div className="alt">
        Nie masz konta?{" "}
        <Link className="alt-a" href="/register">
          Zarejestruj się z kodem dostępu
        </Link>
      </div>
      <div className="alt">
        <Link className="alt-a" href="/forgot-password">
          Przypomnij lub zresetuj hasło
        </Link>
      </div>
    </form>
  );
}
