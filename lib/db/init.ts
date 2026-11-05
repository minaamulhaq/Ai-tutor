import { db } from "@/db";
import { sql } from "drizzle-orm";

const globalForInit = globalThis as unknown as { __bookingSchemaInitialized?: boolean };

/**
 * Ensures all required booking, Google integration, and notification tables
 * exist in Supabase Postgres with proper columns, constraints, and indexes.
 */
export async function ensureBookingSystemSchema() {
  if (globalForInit.__bookingSchemaInitialized) return;
  globalForInit.__bookingSchemaInitialized = true;

  try {
    await db.execute(sql`
      -- 1. Bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        subject text NOT NULL,
        topic_title text DEFAULT '1-on-1 Class Session' NOT NULL,
        topic_description text,
        booking_reference text NOT NULL,
        start_time timestamptz NOT NULL,
        end_time timestamptz NOT NULL,
        duration_minutes integer DEFAULT 60 NOT NULL,
        hourly_rate integer DEFAULT 2500 NOT NULL,
        total_amount integer DEFAULT 2500 NOT NULL,
        price_pkr integer DEFAULT 2500 NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        payment_status text DEFAULT 'paid' NOT NULL,
        rejection_reason text,
        cancellation_reason text,
        cancelled_by uuid,
        cancelled_at timestamptz,
        approved_at timestamptz,
        rejected_at timestamptz,
        completed_at timestamptz,
        has_review boolean DEFAULT false NOT NULL,
        student_rating integer,
        student_review text,
        reviewed_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      -- Add columns if bookings table was created previously with older schema
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hourly_rate integer DEFAULT 2500;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount integer DEFAULT 2500;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason text;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at timestamptz;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

      -- 2. Teacher Google Accounts table
      CREATE TABLE IF NOT EXISTS teacher_google_accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
        google_email text NOT NULL,
        encrypted_refresh_token text NOT NULL,
        access_token_expires_at timestamptz,
        connected_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      -- 3. Class Sessions table
      CREATE TABLE IF NOT EXISTS class_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
        google_event_id text,
        meeting_url text,
        meeting_provider text DEFAULT 'Google Meet' NOT NULL,
        conference_status text DEFAULT 'pending' NOT NULL,
        calendar_status text DEFAULT 'pending' NOT NULL,
        teacher_notes text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS google_event_id text;
      ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS conference_status text DEFAULT 'pending';
      ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS calendar_status text DEFAULT 'pending';

      -- 4. In-App Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        type text NOT NULL,
        related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
        is_read boolean DEFAULT false NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      -- 5. Student Favorites table
      CREATE TABLE IF NOT EXISTS student_favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_student_favorites_pair ON student_favorites (student_id, teacher_id);
      CREATE INDEX IF NOT EXISTS idx_student_favorites_student ON student_favorites (student_id);

      -- 6. Support Tickets table
      CREATE TABLE IF NOT EXISTS support_tickets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        user_role text NOT NULL,
        name text,
        email text,
        category text NOT NULL,
        subject text NOT NULL,
        message text NOT NULL,
        booking_reference text,
        priority text DEFAULT 'normal' NOT NULL,
        status text DEFAULT 'open' NOT NULL,
        admin_response text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL,
        resolved_at timestamptz
      );
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets (user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);

      -- 7. Indexes for fast concurrency checking & lookups
      CREATE INDEX IF NOT EXISTS idx_bookings_teacher_time ON bookings (teacher_id, start_time, end_time);
      CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings (student_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
      CREATE INDEX IF NOT EXISTS idx_teacher_google_accounts_teacher ON teacher_google_accounts (teacher_id);
      CREATE INDEX IF NOT EXISTS idx_class_sessions_booking ON class_sessions (booking_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_teacher_profiles_discovery ON teacher_profiles (account_status, hourly_rate_pkr);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
      CREATE INDEX IF NOT EXISTS idx_teacher_avail_lookup ON teacher_availabilities (teacher_id, day_of_week, is_active);
      CREATE INDEX IF NOT EXISTS idx_bookings_reviews ON bookings (teacher_id, has_review);

      -- 6. Supabase Row Level Security (RLS) policies
      ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE teacher_availabilities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE teacher_google_accounts ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active teacher profiles') THEN
          CREATE POLICY "Public read active teacher profiles" ON teacher_profiles
            FOR SELECT USING (account_status = 'active');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage own profile') THEN
          CREATE POLICY "Teachers manage own profile" ON teacher_profiles
            FOR ALL USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active teacher availability') THEN
          CREATE POLICY "Public read active teacher availability" ON teacher_availabilities
            FOR SELECT USING (is_active = true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers manage own availability') THEN
          CREATE POLICY "Teachers manage own availability" ON teacher_availabilities
            FOR ALL USING (auth.uid() = teacher_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Participants access own bookings') THEN
          CREATE POLICY "Participants access own bookings" ON bookings
            FOR ALL USING (auth.uid() = student_id OR auth.uid() = teacher_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers access own google accounts') THEN
          CREATE POLICY "Teachers access own google accounts" ON teacher_google_accounts
            FOR ALL USING (auth.uid() = teacher_id);
        END IF;
      END $$;
    `);

    initialized = true;
  } catch (error) {
    console.warn("Notice: ensureBookingSystemSchema warning:", error);
  }
}
