"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";
import {
  type ActionState,
  forgotPasswordSchema,
  initialActionState,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validation";

function authCallbackUrl(origin: string, next: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  return url.toString();
}

async function requestOrigin() {
  const headerStore = await headers();
  return getSiteUrl(headerStore.get("origin"));
}

export async function signInAction(
  _state: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Popraw błędy w formularzu.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      message:
        "Nie udało się zalogować. Sprawdź email, hasło i potwierdzenie adresu email.",
    };
  }

  redirect("/panel");
}

export async function signUpAction(
  _state: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Popraw błędy w formularzu.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const inviteCode = process.env.APP_INVITE_CODE;

  if (!inviteCode) {
    return {
      success: false,
      message: "Brakuje APP_INVITE_CODE w pliku .env.local.",
    };
  }

  if (parsed.data.access_code !== inviteCode) {
    return {
      success: false,
      message: "Nieprawidłowy kod dostępu.",
      errors: { access_code: ["Skontaktuj się z koordynatorem."] },
    };
  }

  const origin = await requestOrigin();
  const supabase = await createClient();
  const {
    email,
    password,
    access_code: _accessCode,
    ...profileData
  } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authCallbackUrl(origin, "/panel"),
      data: profileData,
    },
  });

  if (error) {
    return {
      success: false,
      message:
        error.message === "User already registered"
          ? "Konto z tym adresem email już istnieje."
          : "Nie udało się utworzyć konta. Spróbuj ponownie.",
    };
  }

  if (data.session) {
    redirect("/panel");
  }

  return {
    success: true,
    message:
      "Konto zostało utworzone. Sprawdź skrzynkę email i potwierdź rejestrację.",
  };
}

export async function forgotPasswordAction(
  _state: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Popraw błędy w formularzu.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: authCallbackUrl(origin, "/reset-password"),
  });

  if (error) {
    return {
      success: false,
      message: "Nie udało się wysłać linku resetowania hasła.",
    };
  }

  return {
    success: true,
    message:
      "Jeśli konto istnieje, wyślemy wiadomość z linkiem do ustawienia nowego hasła.",
  };
}

export async function updatePasswordAction(
  _state: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      success: false,
      message: "Popraw błędy w formularzu.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Link resetowania wygasł. Wyślij prośbę ponownie.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      message: "Nie udało się ustawić nowego hasła.",
    };
  }

  redirect("/panel");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
