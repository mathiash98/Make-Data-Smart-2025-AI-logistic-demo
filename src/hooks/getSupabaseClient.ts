import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

const globalClient = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
// This is a singleton client, so it will be reused across the app
export default () => globalClient;
