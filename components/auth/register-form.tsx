"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { FieldError } from "@/components/field-error";
import { serviceTypes } from "@/lib/services";
import { initialActionState } from "@/lib/validation";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="auth-card">
      {state.message ? (
        <p className={state.success ? "sucbox" : "errbox"}>{state.message}</p>
      ) : null}
      <div className="form-grid">
        <div className="fld">
          <label className="flabel" htmlFor="full_name">
            Nazwa usługodawcy
          </label>
          <input
            autoComplete="name"
            className="finput"
            id="full_name"
            name="full_name"
            placeholder="Nazwa Twojej firmy"
            type="text"
          />
          <FieldError errors={state.errors?.full_name} />
        </div>
        <div className="fld">
          <label className="flabel" htmlFor="service_type">
            Rodzaj usługi
          </label>
          <select className="fsel" id="service_type" name="service_type">
            <option value="">Wybierz</option>
            {serviceTypes.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.service_type} />
        </div>
        <div className="fld">
          <label className="flabel" htmlFor="email">
            Email logowania
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
          <label className="flabel" htmlFor="phone">
            Telefon
          </label>
          <input
            autoComplete="tel"
            className="finput"
            id="phone"
            name="phone"
            placeholder="+48 600 000 000"
            type="tel"
          />
          <FieldError errors={state.errors?.phone} />
        </div>
        <div className="fld">
          <label className="flabel" htmlFor="access_code">
            Kod dostępu
          </label>
          <input
            className="finput"
            id="access_code"
            name="access_code"
            placeholder="Kod dostępny u administratora"
            type="text"
          />
          <FieldError errors={state.errors?.access_code} />
        </div>
      </div>
      <button className="sbtn" disabled={pending} type="submit">
        {pending ? (
          <Loader2 className="btn-icon animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="btn-icon" aria-hidden="true" />
        )}
        Zarejestruj się
      </button>
      <div className="alt">
        Masz już konto?{" "}
        <Link className="alt-a" href="/login">
          Wróć do logowania
        </Link>
      </div>
    </form>
  );
}
