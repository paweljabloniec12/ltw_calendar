"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
