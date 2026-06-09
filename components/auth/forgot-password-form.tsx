"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { FieldError } from "@/components/field-error";
import { initialActionState } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="auth-card">
      {state.message ? (
        <p className={state.success ? "sucbox" : "errbox"}>{state.message}</p>
      ) : null}
      <div className="fld">
        <label className="flabel" htmlFor="email">
          Email konta
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
      <button className="sbtn" disabled={pending} type="submit">
        {pending ? (
          <Loader2 className="btn-icon animate-spin" aria-hidden="true" />
        ) : (
          <Send className="btn-icon" aria-hidden="true" />
        )}
        Wyślij link
      </button>
      <div className="alt">
        <Link className="alt-a" href="/login">
          Wróć do logowania
        </Link>
      </div>
    </form>
  );
}
