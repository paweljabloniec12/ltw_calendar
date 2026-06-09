"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isoDateSchema } from "@/lib/validation";

type DateActionResult = {
  success: boolean;
  message: string;
  dates?: string[];
};

const datesStatusSchema = z.object({
  dates: z.array(isoDateSchema).min(1).max(90),
  status: z.enum(["busy", "free"]),
});

const singleDateSchema = z.object({
  date: isoDateSchema,
});

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

async function getVerifiedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id };
}

export async function setBookedDatesStatus(
  input: unknown,
): Promise<DateActionResult> {
  const parsed = datesStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Nieprawidłowe dane terminów.",
    };
  }

  const uniqueDates = [...new Set(parsed.data.dates)].sort();
  const today = todayIso();

  if (uniqueDates.some((date) => date < today)) {
    return {
      success: false,
      message: "Nie można zmieniać terminów z przeszłości.",
    };
  }

  const { supabase, userId } = await getVerifiedUserId();

  if (!userId) {
    return {
      success: false,
      message: "Musisz być zalogowany, aby zarządzać terminami.",
    };
  }

  if (parsed.data.status === "busy") {
    const { data: existing, error: selectError } = await supabase
      .from("booked_dates")
      .select("date")
      .eq("provider_id", userId)
      .in("date", uniqueDates);

    if (selectError) {
      return {
        success: false,
        message: "Nie udało się sprawdzić istniejących terminów.",
      };
    }

    const existingDates = new Set(existing?.map((row) => row.date) ?? []);
    const datesToInsert = uniqueDates
      .filter((date) => !existingDates.has(date))
      .map((date) => ({ provider_id: userId, date }));

    if (datesToInsert.length > 0) {
      const { error } = await supabase.from("booked_dates").insert(datesToInsert);

      if (error) {
        return {
          success: false,
          message: "Nie udało się oznaczyć terminów jako zajęte.",
        };
      }
    }
  } else {
    const { error } = await supabase
      .from("booked_dates")
      .delete()
      .eq("provider_id", userId)
      .in("date", uniqueDates);

    if (error) {
      return {
        success: false,
        message: "Nie udało się oznaczyć terminów jako wolne.",
      };
    }
  }

  revalidatePath("/panel");

  return {
    success: true,
    dates: uniqueDates,
    message:
      parsed.data.status === "busy"
        ? "Zaznaczone terminy są teraz zajęte."
        : "Zaznaczone terminy są teraz wolne.",
  };
}

export async function removeBookedDate(input: unknown): Promise<DateActionResult> {
  const parsed = singleDateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Nieprawidłowa data.",
    };
  }

  return setBookedDatesStatus({
    dates: [parsed.data.date],
    status: "free",
  });
}
