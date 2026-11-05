"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, supportTickets } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ensureBookingSystemSchema } from "@/lib/db/init";
import { createNotification } from "@/services/notificationService";
import { revalidatePath } from "next/cache";

export interface CreateSupportTicketInput {
  category: string;
  subject: string;
  message: string;
  bookingReference?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

/**
 * Creates a persistent support ticket for the authenticated student or teacher.
 */
export async function createSupportTicketAction(input: CreateSupportTicketInput) {
  try {
    await ensureBookingSystemSchema();
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "You must be signed in to submit a support ticket." };
    }

    // Retrieve user record for accurate name, email, and role
    const [userRecord] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const userRole = userRecord?.role || (user.user_metadata?.role as string) || "student";
    const name = userRecord?.fullName || user.user_metadata?.full_name || "ZuhDemy User";
    const email = userRecord?.email || user.email || "";

    const cleanSubject = input.subject?.trim() || `${input.category.toUpperCase()} Inquiry`;
    const cleanMessage = input.message?.trim();

    if (!cleanMessage) {
      return { success: false, error: "Please provide a detailed message for your support inquiry." };
    }

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        userId: user.id,
        userRole,
        name,
        email,
        category: input.category || "general",
        subject: cleanSubject,
        message: cleanMessage,
        bookingReference: input.bookingReference?.trim() || null,
        priority: input.priority || "normal",
        status: "open",
      })
      .returning();

    // Send confirmation in-app notification to the user
    await createNotification({
      userId: user.id,
      title: "Support Ticket Created",
      message: `Your ticket "${cleanSubject}" (#${ticket.id.slice(0, 8)}) has been logged. Our team typically responds within 2-4 hours.`,
      type: "general",
    });

    if (userRole === "teacher") {
      revalidatePath("/teacher/support");
    } else {
      revalidatePath("/student/help");
    }

    return {
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      message: "Your support request has been logged. Our academic team is reviewing it.",
    };
  } catch (err: any) {
    console.error("Error in createSupportTicketAction:", err);
    return { success: false, error: err?.message || "Failed to create support ticket." };
  }
}

/**
 * Fetches all support tickets created by the authenticated user.
 */
export async function getMySupportTicketsAction() {
  try {
    await ensureBookingSystemSchema();
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: true, tickets: [] };
    }

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, user.id))
      .orderBy(desc(supportTickets.createdAt));

    return {
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        category: t.category,
        subject: t.subject,
        message: t.message,
        bookingReference: t.bookingReference,
        priority: t.priority,
        status: t.status,
        adminResponse: t.adminResponse,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        resolvedAt: t.resolvedAt ? new Date(t.resolvedAt).toISOString() : null,
      })),
    };
  } catch (err: any) {
    console.error("Error in getMySupportTicketsAction:", err);
    return { success: false, error: err?.message || "Failed to load support tickets.", tickets: [] };
  }
}

/**
 * Admin action: Resolve or update status of a support ticket with an authoritative response.
 */
export async function adminRespondToTicketAction(params: {
  ticketId: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse: string;
}) {
  try {
    await ensureBookingSystemSchema();
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, params.ticketId))
      .limit(1);

    if (!ticket) {
      return { success: false, error: "Support ticket not found." };
    }

    const isDone = params.status === "resolved" || params.status === "closed";

    await db
      .update(supportTickets)
      .set({
        status: params.status,
        adminResponse: params.adminResponse.trim(),
        updatedAt: new Date(),
        ...(isDone ? { resolvedAt: new Date() } : {}),
      })
      .where(eq(supportTickets.id, params.ticketId));

    if (ticket.userId) {
      await createNotification({
        userId: ticket.userId,
        title: `Support Ticket Updated: ${params.status.replace("_", " ").toUpperCase()}`,
        message: `Response to "${ticket.subject}": ${params.adminResponse}`,
        type: "general",
      });
    }

    revalidatePath("/student/help");
    revalidatePath("/teacher/support");
    return { success: true };
  } catch (err: any) {
    console.error("Error in adminRespondToTicketAction:", err);
    return { success: false, error: err?.message || "Failed to update support ticket." };
  }
}
