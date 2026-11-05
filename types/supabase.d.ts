declare module "@supabase/supabase-js/dist/module/lib/types" {
  import type { SupabaseClientOptions } from "@supabase/supabase-js";
  export type GenericSchema = {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
  export type { SupabaseClientOptions };
}
