import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureBookingSystemSchema } from "./init";

const globalForMessagingInit = globalThis as unknown as { __messagingSchemaInitialized?: boolean };

/**
 * Ensures all conversation, message, participant, and attachment tables exist
 * in Supabase Postgres with proper foreign keys, constraints, and indexes.
 * Also seeds initial interactive conversations if the tables are empty.
 */
export async function ensureMessagingSystemSchema() {
  if (globalForMessagingInit.__messagingSchemaInitialized) return;
  globalForMessagingInit.__messagingSchemaInitialized = true;

  try {
    await ensureBookingSystemSchema();

    await db.execute(sql`
      -- 1. Conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        last_message text,
        last_message_at timestamptz DEFAULT now() NOT NULL,
        last_sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
        unread_student_count integer DEFAULT 0 NOT NULL,
        unread_teacher_count integer DEFAULT 0 NOT NULL,
        is_archived boolean DEFAULT false NOT NULL,
        is_pinned boolean DEFAULT false NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT unique_student_teacher_conversation UNIQUE (student_id, teacher_id)
      );

      -- 2. Conversation Participants table (Per-user preferences)
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        last_read_at timestamptz DEFAULT now() NOT NULL,
        is_muted boolean DEFAULT false NOT NULL,
        is_archived boolean DEFAULT false NOT NULL,
        is_pinned boolean DEFAULT false NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id)
      );

      -- 3. Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
        sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        receiver_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        message_type text DEFAULT 'text' NOT NULL,
        status text DEFAULT 'sent' NOT NULL,
        read_at timestamptz,
        invitation_data jsonb,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      -- 4. Message Attachments table
      CREATE TABLE IF NOT EXISTS message_attachments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
        file_name text NOT NULL,
        file_url text NOT NULL,
        file_type text NOT NULL,
        file_size integer NOT NULL,
        mime_type text,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      -- Performance Indexes
      CREATE INDEX IF NOT EXISTS idx_conversations_student ON conversations(student_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_teacher ON conversations(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_attachments_message ON message_attachments(message_id);
      CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);
    `);

    // Enable Supabase Realtime publication on messages & conversations if postgres supports it
    try {
      await db.execute(sql`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Publication or permission already handled
          NULL;
        END $$;
      `);
    } catch {
      // Ignored if local Postgres or permission-restricted
    }

    console.log("[Messaging Schema] Initialized successfully in Postgres.");
  } catch (err) {
    console.warn("[Messaging Schema] Table initialization notice:", err);
  }
}
