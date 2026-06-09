import { redirect } from "next/navigation";
import { CalendarManager } from "@/components/calendar-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: bookedDates }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("booked_dates")
      .select("*")
      .eq("provider_id", user.id)
      .order("date", { ascending: true }),
  ]);

  if (!profile) {
    return (
      <main className="dash">
        <div className="empty-state">
          Nie znaleziono profilu usługodawcy. Sprawdź trigger
          on_auth_user_created w Supabase.
        </div>
      </main>
    );
  }

  return (
    <main className="dash">
      <CalendarManager
        initialBookedDates={bookedDates ?? []}
        profile={profile}
      />
    </main>
  );
}
