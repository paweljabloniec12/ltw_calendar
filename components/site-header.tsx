import Link from "next/link";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  let firstName: string | null = null;

  if (getSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        firstName = profile?.full_name?.split(" ")[0] ?? user.email ?? null;
      }
    } catch {
      firstName = null;
    }
  }

  return (
    <header className="hdr">
      <a className="logo" href="/">
        <span className="logo-script">Lubelski</span>
        <span className="logo-sans">Team Weselny</span>
      </a>
      <HeaderNav firstName={firstName} />
    </header>
  );
}
