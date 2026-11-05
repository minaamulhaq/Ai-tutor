import { db } from "@/db";
import { sql } from "drizzle-orm";

const globalForFinancialInit = globalThis as unknown as { __financialSchemaInitialized?: boolean };

/**
 * Ensures all financial management, double-entry ledger, booking financials,
 * refunds, disputes, and provider settlement tables exist in Supabase Postgres
 * with idempotent DDL, default Chart of Accounts, and RLS policies.
 */
export async function ensureFinancialSystemSchema() {
  if (globalForFinancialInit.__financialSchemaInitialized) return;
  globalForFinancialInit.__financialSchemaInitialized = true;

  try {
    await db.execute(sql`
      -- 1. Chart of Accounts table
      CREATE TABLE IF NOT EXISTS financial_accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        account_code text NOT NULL UNIQUE,
        account_name text NOT NULL,
        account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'revenue', 'expense')),
        currency text DEFAULT 'PKR' NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      -- 2. Financial Transactions table (Business events)
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
        payment_id text,
        event_type text NOT NULL CHECK (event_type IN (
          'student_payment',
          'teacher_earning_allocated',
          'platform_commission',
          'provider_fee',
          'refund',
          'dispute_hold',
          'dispute_release',
          'adjustment'
        )),
        reference text NOT NULL UNIQUE,
        currency text DEFAULT 'PKR' NOT NULL,
        description text NOT NULL,
        idempotency_key text UNIQUE,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      -- 3. Double-Entry Immutable Ledger Entries
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id uuid REFERENCES financial_transactions(id) ON DELETE CASCADE NOT NULL,
        account_id uuid REFERENCES financial_accounts(id) ON DELETE RESTRICT NOT NULL,
        debit_amount integer DEFAULT 0 NOT NULL,
        credit_amount integer DEFAULT 0 NOT NULL,
        currency text DEFAULT 'PKR' NOT NULL,
        booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
        student_id uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      -- 4. Booking Financials Breakdown
      CREATE TABLE IF NOT EXISTS booking_financials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
        payment_id text,
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        gross_amount integer NOT NULL,
        platform_commission integer NOT NULL,
        provider_fee integer DEFAULT 0 NOT NULL,
        teacher_net_amount integer NOT NULL,
        currency text DEFAULT 'PKR' NOT NULL,
        payment_status text DEFAULT 'paid' NOT NULL CHECK (payment_status IN (
          'unpaid', 'pending', 'paid', 'failed', 'partially_refunded', 'refunded'
        )),
        teacher_earnings_status text DEFAULT 'held' NOT NULL CHECK (teacher_earnings_status IN (
          'not_allocated', 'held', 'disputed', 'eligible', 'released'
        )),
        class_completed_at timestamptz,
        dispute_deadline timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      -- 5. Refund Records
      CREATE TABLE IF NOT EXISTS refund_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
        payment_id text,
        amount integer NOT NULL,
        currency text DEFAULT 'PKR' NOT NULL,
        reason text NOT NULL,
        provider_refund_id text,
        status text DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
        created_at timestamptz DEFAULT now() NOT NULL,
        completed_at timestamptz
      );

      -- 6. Disputes
      CREATE TABLE IF NOT EXISTS disputes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        amount_held integer NOT NULL,
        currency text DEFAULT 'PKR' NOT NULL,
        reason text NOT NULL,
        status text DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
        resolution text,
        resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        resolved_at timestamptz
      );

      -- 7. Provider Settlement Reconciliations
      CREATE TABLE IF NOT EXISTS provider_settlements (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        provider text DEFAULT 'safepay' NOT NULL,
        provider_balance integer DEFAULT 0 NOT NULL,
        currency text DEFAULT 'PKR' NOT NULL,
        internal_clearing_balance integer DEFAULT 0 NOT NULL,
        discrepancy integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'matched' NOT NULL,
        last_synced_at timestamptz DEFAULT now() NOT NULL,
        raw_details jsonb
      );

      -- 8. Teacher Payouts (Withdrawal requests)
      CREATE TABLE IF NOT EXISTS teacher_payouts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        reference_id text NOT NULL,
        amount_pkr integer NOT NULL,
        method text NOT NULL,
        method_label text NOT NULL,
        account_details text NOT NULL,
        status text DEFAULT 'processing' NOT NULL,
        note text,
        requested_at timestamptz DEFAULT now() NOT NULL,
        processed_at timestamptz
      );

      -- 9. Performance and Integrity Indexes
      CREATE INDEX IF NOT EXISTS idx_ledger_entries_txn ON ledger_entries (transaction_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries (account_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_entries_booking ON ledger_entries (booking_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_entries_teacher ON ledger_entries (teacher_id);
      CREATE INDEX IF NOT EXISTS idx_booking_financials_teacher ON booking_financials (teacher_id, teacher_earnings_status);
      CREATE INDEX IF NOT EXISTS idx_booking_financials_deadline ON booking_financials (dispute_deadline, teacher_earnings_status);
      CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes (booking_id);
      CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes (status);
      CREATE INDEX IF NOT EXISTS idx_teacher_payouts_teacher ON teacher_payouts (teacher_id);
      CREATE INDEX IF NOT EXISTS idx_teacher_payouts_status ON teacher_payouts (status);

      -- 9. Seed Standard Chart of Accounts (Idempotent)
      INSERT INTO financial_accounts (account_code, account_name, account_type, currency)
      VALUES 
        ('1010-PROVIDER-REC', 'Payment Provider Clearing / Receivable', 'asset', 'PKR'),
        ('2010-TEACHER-PAYABLE', 'Teacher Held Funds / Payables', 'liability', 'PKR'),
        ('2020-DISPUTED-FUNDS', 'Disputed Teacher Earnings Frozen', 'liability', 'PKR'),
        ('4010-COMMISSION-REV', 'Platform Commission Revenue', 'revenue', 'PKR'),
        ('5010-PROVIDER-FEES', 'Payment Provider Processing Fees', 'expense', 'PKR'),
        ('5020-REFUND-EXPENSE', 'Customer Refund / Chargeback Loss', 'expense', 'PKR')
      ON CONFLICT (account_code) DO NOTHING;

      -- 10. Enable Row Level Security (RLS)
      ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
      ALTER TABLE booking_financials ENABLE ROW LEVEL SECURITY;
      ALTER TABLE refund_records ENABLE ROW LEVEL SECURITY;
      ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE provider_settlements ENABLE ROW LEVEL SECURITY;

      -- 11. Security Policies
      DO $$
      BEGIN
        -- Admins can read everything
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage financial accounts') THEN
          CREATE POLICY "Admins manage financial accounts" ON financial_accounts
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read financial accounts') THEN
          CREATE POLICY "Public read financial accounts" ON financial_accounts
            FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view all transactions') THEN
          CREATE POLICY "Admins view all transactions" ON financial_transactions
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view all ledger entries') THEN
          CREATE POLICY "Admins view all ledger entries" ON ledger_entries
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers view own ledger entries') THEN
          CREATE POLICY "Teachers view own ledger entries" ON ledger_entries
            FOR SELECT USING (auth.uid() = teacher_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage booking financials') THEN
          CREATE POLICY "Admins manage booking financials" ON booking_financials
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Participants view own booking financials') THEN
          CREATE POLICY "Participants view own booking financials" ON booking_financials
            FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage disputes') THEN
          CREATE POLICY "Admins manage disputes" ON disputes
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Participants view own disputes') THEN
          CREATE POLICY "Participants view own disputes" ON disputes
            FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage refund records') THEN
          CREATE POLICY "Admins manage refund records" ON refund_records
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage provider settlements') THEN
          CREATE POLICY "Admins manage provider settlements" ON provider_settlements
            FOR ALL USING (
              EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
            );
        END IF;
      END $$;
    `);
  } catch (error) {
    console.warn("Notice: ensureFinancialSystemSchema warning:", error);
  }
}
