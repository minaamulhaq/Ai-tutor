import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn("⚠️ DATABASE_URL environment variable is missing.");
}

// In Supabase Transaction Pooler (port 6543) or serverless, disable prefetch
const client = postgres(connectionString || "", {
  prepare: false,
  onnotice: () => {}, // Silence informational NOTICE logs (relation already exists, etc.)
});

export const db = drizzle(client, { schema });
export { schema };
