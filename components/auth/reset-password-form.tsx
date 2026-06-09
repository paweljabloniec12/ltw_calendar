"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/app/actions/auth";
import { FieldError } from "@/components/field-error";
import { initialActionState } from "@/lib/validation";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="auth-card">
      {state.message ? (
        <p className={state.success ? "sucbox" : "errbox"}>{state.message}</p>
      ) : null}
      <div className="fld">
        <label className="flabel" htmlFor="password">
          Nowe hasło
        </label>
        <input
          autoComplete="new-password"
          className="finput"
          id="password"
          name="password"
          placeholder="min. 8 znaków"
          type="password"
        />
        <FieldError errors={state.errors?.password} />
      </div>
      <div className="fld">
        <label className="flabel" htmlFor="password_confirm">
          Powtórz nowe hasło
        </label>
        <input
          autoComplete="new-password"
          className="finput"
          id="password_confirm"
          name="password_confirm"
          placeholder="powtórz hasło"
          type="password"
        />
        <FieldError errors={state.errors?.password_confirm} />
      </div>
      <button className="sbtn" disabled={pending} type="submit">
        {pending ? (
          <Loader2 className="btn-icon animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="btn-icon" aria-hidden="true" />
        )}
        Ustaw nowe hasło
      </button>
    </form>
  );
}
