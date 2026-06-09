import { z } from "zod";
import { serviceTypes } from "@/lib/services";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Podaj pełny adres, np. https://twojastrona.pl").optional(),
);

const optionalShortText = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(220, "To pole jest za długie.").optional(),
);

const optionalLongText = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(700, "Opis może mieć maksymalnie 700 znaków.").optional(),
);

export const signInSchema = z.object({
  email: z.string().trim().email("Podaj poprawny email."),
  password: z.string().min(1, "Wpisz hasło."),
});

export const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Podaj nazwę lub imię i nazwisko."),
  service_type: z.enum(serviceTypes, {
    error: "Wybierz rodzaj usługi.",
  }),
  email: z.string().trim().email("Podaj poprawny email."),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
  phone: optionalShortText,
  website_url: optionalUrl,
  instagram_url: optionalUrl,
  description: optionalLongText,
  access_code: z.string().trim().min(1, "Wpisz kod dostępu."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Podaj poprawny email."),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków."),
    password_confirm: z.string().min(8, "Powtórz nowe hasło."),
  })
  .refine((value) => value.password === value.password_confirm, {
    message: "Hasła muszą być takie same.",
    path: ["password_confirm"],
  });

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowy format daty.");

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = {
  success: false,
  message: "",
};
