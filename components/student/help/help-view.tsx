"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  FileText,
  CreditCard,
  RotateCcw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Inbox,
  Tag,
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

interface FAQItem {
  id: string;
  category: "classes" | "payments" | "rescheduling" | "tutors";
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "classes",
    question: "How do I join my online class with my teacher?",
    answer:
      "Every confirmed class includes an encrypted Google Meet video link. You can access it directly from your 'My Classes' tab or from the top banner in your student overview dashboard 10 minutes before the scheduled start time. We also send a 1-click join link to your WhatsApp.",
  },
  {
    id: "faq-2",
    category: "classes",
    question: "What should I do if my tutor does not show up on time?",
    answer:
      "Tutors are required to join within 10 minutes of the session start time. If your tutor is unavailable or delayed, please message them in 'Messages' or click 'Report Class Issue'. If the lesson does not take place, your class fee will be automatically 100% refunded or credited back to your wallet.",
  },
  {
    id: "faq-3",
    category: "rescheduling",
    question: "Can I reschedule or cancel a class without penalty?",
    answer:
      "Yes! You can reschedule or cancel any lesson free of charge up to 6 hours before the class begins. Go to 'My Classes', locate the session, and select 'Reschedule' or 'Cancel Class'. Cancellations made within 6 hours may incur a partial teacher reservation fee.",
  },
  {
    id: "faq-4",
    category: "payments",
    question: "Which payment methods are accepted on ZuhDemy?",
    answer:
      "We accept all major Pakistani mobile wallets including JazzCash and EasyPaisa, as well as Visa, Mastercard, PayPak debit/credit cards, and direct bank transfers. All transactions are SSL encrypted and held in escrow until your class is delivered.",
  },
  {
    id: "faq-5",
    category: "payments",
    question: "How do refunds work if I cancel a session?",
    answer:
      "Eligible refunds are processed immediately back to your ZuhDemy student wallet balance for instant re-use on any other tutor. If you prefer a refund back to your original JazzCash, EasyPaisa, or bank card, it takes 2-3 business days.",
  },
  {
    id: "faq-6",
    category: "tutors",
    question: "Are ZuhDemy teachers verified for CAIE and board curriculums?",
    answer:
      "Yes. Every instructor undergoes a stringent 4-step verification process: academic qualification check, subject matter demo test, identity verification, and background check. Look for the 'Verified Tutor' badge on instructor profiles.",
  },
  {
    id: "faq-7",
    category: "tutors",
    question: "Can I share my syllabus and past papers before booking?",
    answer:
      "Absolutely! You can message any tutor directly from the 'Find Teachers' directory or attach specific chapters and question numbers during the booking checkout flow.",
  },
  {
    id: "faq-8",
    category: "classes",
    question: "Do I need special software to attend lessons?",
    answer:
      "No downloads are required. Sessions run directly in your browser (Google Chrome, Safari, Microsoft Edge) on laptop, tablet, or mobile phone via Google Meet with video, audio, and screen sharing capabilities.",
  },
];

export function StudentHelpView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");
  const [activeMainTab, setActiveMainTab] = useState<"faqs" | "tickets">("faqs");

  // Support Ticket Form State
  const [issueType, setIssueType] = useState("class_issue");
  const [ticketSubject, setTicketSubject] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
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

  // Filter FAQs dynamically based on search query and category
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createSupportTicketAction({
        category: issueType,
        subject: ticketSubject.trim() || `${issueType.replace(/_/g, " ").toUpperCase()} Support Inquiry`,
        message: ticketMessage.trim(),
        bookingReference: bookingRef.trim() || undefined,
      });

      if (res.success) {
        setTicketSubmitted(true);
        setTicketMessage("");
        setTicketSubject("");
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
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* 1. Header Card (Clean White Aesthetic - NO BG PICTURE) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <LifeBuoy className="size-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Student Help & Support Center
              </h1>
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-semibold">
                <Sparkles className="size-3 mr-1" /> Student Studio
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Need assistance with your classes, payments, or tutor scheduling? We are here to help you 7 days a week.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Support Online</span>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-2xl">
          <Search className="size-4.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics, refunds, meeting links, or cancellations..."
            className="pl-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-xs sm:text-sm h-11"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. Direct Contact Channels (3 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Channel */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">WhatsApp Instant Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect with our live student support desk for quick questions or booking help.
            </p>
          </div>
          <a
            href="https://wa.me/923218492011?text=Hi%20ZuhDemy%20Support,%20I%20need%20help%20with%20my%20student%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        {/* Email Support Channel */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Mail className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Email Academic Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              For complex syllabus inquiries, invoice requests, or formal fee adjustments.
            </p>
          </div>
          <a
            href="mailto:support@zuhdemy.com?subject=Student%20Support%20Inquiry"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="size-3.5" />
            <span>support@zuhdemy.com</span>
          </a>
        </div>

        {/* Urgent Helpline */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone className="size-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Emergency Phone Line</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Available 30 minutes before and during scheduled classes for live connection troubleshooting.
            </p>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800">
            <span>+92 42 3587 9921</span>
            <Badge className="bg-blue-100 text-blue-800 border-none text-3xs font-semibold">9 AM - 10 PM</Badge>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: FAQs / My Tickets on Left, Ticket Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: FAQs or My Inquiries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMainTab("faqs")}
                  className={`text-sm font-bold pb-1 transition-all cursor-pointer border-b-2 ${
                    activeMainTab === "faqs"
                      ? "border-orange-500 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Frequently Asked Questions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMainTab("tickets")}
                  className={`text-sm font-bold pb-1 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeMainTab === "tickets"
                      ? "border-orange-500 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span>My Support Tickets</span>
                  {myTickets.length > 0 && (
                    <Badge className="bg-orange-100 text-orange-800 border-none text-[10px] px-1.5 py-0.2">
                      {myTickets.length}
                    </Badge>
                  )}
                </button>
              </div>

              {activeMainTab === "faqs" && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: "all", label: "All" },
                    { id: "classes", label: "Classes" },
                    { id: "payments", label: "Payments" },
                    { id: "rescheduling", label: "Reschedule" },
                    { id: "tutors", label: "Tutors" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-orange-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB CONTENT: FAQs */}
            {activeMainTab === "faqs" && (
              <>
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                    <HelpCircle className="size-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
                    <p className="text-xs text-slate-500">
                      Try searching for something else or submit a question to our team below.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                    {filteredFaqs.map((faq) => {
                      const isOpen = expandedFaqId === faq.id;
                      return (
                        <div key={faq.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                          <button
                            type="button"
                            onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                            className="w-full p-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                          >
                            <span className="text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors">
                              {faq.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="size-4 text-orange-600 shrink-0" />
                            ) : (
                              <ChevronDown className="size-4 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-orange-50/30 border-t border-orange-100/50">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: My Support Tickets */}
            {activeMainTab === "tickets" && (
              <div className="space-y-3">
                {isLoadingTickets ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading your logged inquiries...
                  </div>
                ) : myTickets.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                    <Inbox className="size-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No support tickets submitted</p>
                    <p className="text-xs text-slate-500">
                      When you submit an inquiry using the form on the right, you can track responses here.
                    </p>
                  </div>
                ) : (
                  myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{ticket.subject}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="capitalize">{ticket.category.replace(/_/g, " ")}</span>
                            {ticket.bookingReference && (
                              <span>• Ref: <strong className="font-mono text-slate-700">{ticket.bookingReference}</strong></span>
                            )}
                            <span>• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            ticket.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ticket.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {ticket.message}
                      </p>

                      {ticket.adminResponse && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Academic Support Response:
                          </span>
                          <p className="text-emerald-800 leading-relaxed text-[11px]">
                            {ticket.adminResponse}
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

        {/* Submit a Support Request (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-slate-100 space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">Send Support a Message</h2>
              <p className="text-xs text-slate-500">
                Logged to your account and tracked with real-time status updates.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Ticket logged to PostgreSQL! Our support specialist will get back to you shortly.</span>
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
                <Label className="text-xs font-semibold text-slate-700">Issue Category</Label>
                <Select value={issueType} onValueChange={(val) => setIssueType(val)}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class_issue" className="text-xs">
                      Class Meeting / Video Issue
                    </SelectItem>
                    <SelectItem value="tutor_noshow" className="text-xs">
                      Tutor Rescheduling / No-Show
                    </SelectItem>
                    <SelectItem value="payment" className="text-xs">
                      Payment, Billing or Refund
                    </SelectItem>
                    <SelectItem value="account" className="text-xs">
                      Account & Login Assistance
                    </SelectItem>
                    <SelectItem value="other" className="text-xs">
                      Other General Inquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Subject / Summary <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Reschedule request for Physics class"
                  className="rounded-xl border-slate-200 text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Booking Reference ID (Optional)
                </Label>
                <Input
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. ZD-BK-2024-9122"
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Explain Your Issue / Question <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-2xs text-slate-400">
                    {ticketMessage.length}/600
                  </span>
                </div>
                <Textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe what happened or what you need help with. Include class timing if applicable..."
                  className="rounded-xl border-slate-200 text-xs resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !ticketMessage.trim()}
                className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Submit Support Ticket
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Student Trust & Safety Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>ZuhDemy Student Protection Guarantee</span>
            </div>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Every lesson is monitored for safety and quality. If your class does not proceed as agreed, our 100% Student Money-Back Guarantee covers your payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
