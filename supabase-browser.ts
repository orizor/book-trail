"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { runtimeConfig } from "@/lib/runtime-config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(
    runtimeConfig.supabaseUrl,
    runtimeConfig.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  );

  return browserClient;
}
