"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  HelpCircle,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSupportTicketAction,
  getMySupportTicketsAction,
} from "@/app/actions/supportActions";

interface TeacherFAQ {
  id: string;
  q: string;
  a: string;
  category: "earnings" | "attendance" | "google" | "guidelines";
}

const TEACHER_FAQS: TeacherFAQ[] = [
  {
    id: "t-faq-1",
    category: "earnings",
    q: "How and when do payouts transition to 'Eligible for Payout'?",
    a: "Immediately following a completed session, student payment enters the 24-hour escrow dispute window as an internal held liability (Account 2010). Exactly 24 hours post-class, the system automatically transitions your earnings into 'Eligible for Payout'. You can request withdrawal via Raast, JazzCash, or Bank IBAN anytime from your Earnings tab.",
  },
  {
    id: "t-faq-2",
    category: "attendance",
    q: "What is the procedure if a student does not show up for class?",
    a: "Please wait at least 15 minutes in the generated Google Meet room. If the student remains absent, record a screenshot or note in the session, and select 'Student No-Show' under your My Classes tab. Your full session fee is protected under the ZuhDemy Faculty Honor Guarantee.",
  },
  {
    id: "t-faq-3",
    category: "google",
    q: "How do I sync my Google Calendar and Google Meet?",
    a: "Navigate to Teacher Studio -> Settings -> Google Calendar & Meet. Click 'Connect Google Account' to authenticate. Every newly confirmed booking will automatically create a synced Google Calendar event and unique Google Meet video link for both you and the student.",
  },
  {
    id: "t-faq-4",
    category: "guidelines",
    q: "Can I adjust my hourly rate or teaching subjects?",
    a: "Yes! Go to Settings -> Account Settings to update your hourly rate in PKR, teaching subjects, and academic curriculums (CAIE O/A-Levels, FBISE, Matric, University). Updated rates will apply to all subsequent student bookings.",
  },
  {
    id: "t-faq-5",
    category: "attendance",
    q: "How far in advance can a student reschedule a class?",
    a: "Students can reschedule or cancel without penalty up to 6 hours before the start time. Rescheduling requests inside 6 hours require mutual agreement or incur teacher compensation.",
  },
];

export function TeacherSupportView() {
  const [activeTab, setActiveTab] = useState<"faqs" | "tickets">("faqs");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("t-faq-1");

  // Form State
  const [category, setCategory] = useState("student_issue");
  const [subject, setSubject] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // My Tickets State
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await getMySupportTicketsAction();
      if (res.success && res.tickets) {
        setMyTickets(res.tickets);
      }
    } catch (err) {
      console.warn("Notice: loadTickets error:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createSupportTicketAction({
        category,
        subject: subject.trim() || `${category.replace(/_/g, " ").toUpperCase()} Faculty Inquiry`,
        message: message.trim(),
        bookingReference: bookingRef.trim() || undefined,
        priority,
      });

      if (res.success) {
        setTicketSubmitted(true);
        setMessage("");
        setSubject("");
        setBookingRef("");
        loadTickets();
        setTimeout(() => setTicketSubmitted(false), 6000);
      } else {
        setSubmitError(res.error || "Failed to submit ticket.");
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <LifeBuoy className="size-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Faculty & Teacher Support Desk
              </h1>
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-semibold">
                <Sparkles className="size-3 mr-1" /> Educator Studio
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Dedicated assistance for instructors: lesson scheduling, attendance verification, escrow payouts, and academic curricula.
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="size-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Email Relations</span>
              <p className="text-[11px] text-slate-500">instructors@zuhdemy.com</p>
              <span className="text-[10px] text-emerald-700 font-semibold block pt-1">
                Typical reply: &lt; 2 hours
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="size-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Live Faculty WhatsApp</span>
              <p className="text-[11px] text-slate-500">+92 300 849 2011</p>
              <span className="text-[10px] text-slate-500 block pt-1">Mon - Sat (9 AM - 9 PM PKT)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
            <div className="size-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="size-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">Teacher Protection</span>
              <p className="text-[11px] text-slate-500">100% Payout guarantee for confirmed sessions</p>
              <span className="text-[10px] text-blue-700 font-semibold block pt-1">Automated Escrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 7 cols (FAQs / Tickets), Right 5 cols (Ticket Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQs & Past Tickets */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("faqs")}
                  className={`text-sm font-bold pb-1 transition-all cursor-pointer border-b-2 ${
                    activeTab === "faqs"
                      ? "border-orange-500 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Educator FAQs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tickets")}
                  className={`text-sm font-bold pb-1 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === "tickets"
                      ? "border-orange-500 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span>My Logged Inquiries</span>
                  {myTickets.length > 0 && (
                    <Badge className="bg-orange-100 text-orange-800 border-none text-[10px] px-1.5 py-0.2">
                      {myTickets.length}
                    </Badge>
                  )}
                </button>
              </div>
            </div>

            {/* TAB A: FAQs */}
            {activeTab === "faqs" && (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {TEACHER_FAQS.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full p-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="size-4 text-orange-600 shrink-0" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-orange-50/30 border-t border-orange-100/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB B: My Tickets */}
            {activeTab === "tickets" && (
              <div className="space-y-3">
                {isLoadingTickets ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading your logged inquiries...
                  </div>
                ) : myTickets.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                    <Inbox className="size-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No support inquiries submitted</p>
                    <p className="text-xs text-slate-500">
                      Submit an inquiry on the right to log tickets for payment verification, scheduling assistance, or technical help.
                    </p>
                  </div>
                ) : (
                  myTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{t.subject}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="capitalize">{t.category.replace(/_/g, " ")}</span>
                            {t.bookingReference && (
                              <span>• Ref: <strong className="font-mono text-slate-700">{t.bookingReference}</strong></span>
                            )}
                            <span>• {new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            t.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : t.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {t.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {t.message}
                      </p>

                      {t.adminResponse && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Faculty Support Response:
                          </span>
                          <p className="text-emerald-800 leading-relaxed text-[11px]">
                            {t.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Submission Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-slate-100 space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">Submit Faculty Inquiry</h2>
              <p className="text-xs text-slate-500">
                Logged to your teacher profile with priority faculty dispatch.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Inquiry logged to PostgreSQL! Our faculty liaison will respond shortly.</span>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="size-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Inquiry Category</Label>
                <Select value={category} onValueChange={(val) => setCategory(val)}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student_issue" className="text-xs">
                      Student Conduct / No-Show Report
                    </SelectItem>
                    <SelectItem value="payout_issue" className="text-xs">
                      Payout &amp; Earnings Clearing
                    </SelectItem>
                    <SelectItem value="calendar_issue" className="text-xs">
                      Google Calendar / Meet Video Sync
                    </SelectItem>
                    <SelectItem value="curriculum" className="text-xs">
                      Curriculum &amp; Course Catalog Setup
                    </SelectItem>
                    <SelectItem value="account" className="text-xs">
                      Account &amp; Verification Badges
                    </SelectItem>
                    <SelectItem value="other" className="text-xs">
                      General Faculty Inquiries
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Subject / Summary <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Student attendance verification for Booking #1029"
                  className="rounded-xl border-slate-200 text-xs h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Booking Ref (Optional)
                  </Label>
                  <Input
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="e.g. BK-4912"
                    className="rounded-xl border-slate-200 text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Priority Level</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal" className="text-xs">Normal</SelectItem>
                      <SelectItem value="high" className="text-xs">High (Class today)</SelectItem>
                      <SelectItem value="urgent" className="text-xs">Urgent (Session live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Detailed Message <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-2xs text-slate-400">{message.length}/800</span>
                </div>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide context, student name, time of class, or details so we can resolve this promptly..."
                  className="rounded-xl border-slate-200 text-xs resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Send Faculty Ticket
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
