"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Video,
  Clock,
  Heart,
  Languages,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Play,
  Share2,
  Check,
  MessageSquare,
  Award,
  Calendar,
  ThumbsUp,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CalendarDays,
  Zap,
  HelpCircle,
  UserCheck,
  CheckCheck,
  X,
  User,
  CalendarCheck,
  Loader2,
  AlertCircle,
  CreditCard,
  Lock,
} from "lucide-react";
import { Teacher, TeacherReview } from "@/types/teacher";
import { getTeacherById, toggleFavorite as apiToggleFavorite } from "@/services/teacherService";
import {
  getTeacherSlotsForDateAction,
  submitBookingRequestAction,
  createBookingPaymentSessionAction,
} from "@/app/actions/bookingActions";
import { getTeacherReviewsAction } from "@/app/actions/teacher";
import { AvailableSlotResult } from "@/services/bookingAvailabilityService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Teacher FAQ Accordion Items
const TEACHER_FAQS = [
  {
    id: "faq_1",
    question: "How does the online 1-on-1 whiteboard classroom work?",
    answer:
      "All sessions take place via high-definition Google Meet with a shared digital interactive whiteboard. Both the instructor and student write and solve problems together in real-time. At the end of every class, a high-resolution PDF of all notes and diagrams is available in your ZuhDemy dashboard.",
  },
  {
    id: "faq_2",
    question: "Can parents receive regular progress updates?",
    answer:
      "Yes! Your instructor sends a structured summary after every week of lessons, highlighting topics covered, student engagement score, homework completion, and upcoming exam milestones.",
  },
  {
    id: "faq_3",
    question: "What is your rescheduling and cancellation policy?",
    answer:
      "You can easily reschedule any class up to 4 hours before the session start time directly through your ZuhDemy student dashboard at zero extra charge. Instructors also accommodate flexible makeup sessions for school events or emergencies.",
  },
  {
    id: "faq_4",
    question: "What equipment or books does the student need?",
    answer:
      "A laptop, desktop, or tablet with a working microphone and camera, and their regular school textbook or syllabus outline. Your instructor provides all extra worksheets, practice questions, and digital whiteboard tools.",
  },
  {
    id: "faq_5",
    question: "Is there a satisfaction guarantee or trial lesson?",
    answer:
      "Yes! ZuhDemy offers a 100% Satisfaction Guarantee. If you are not completely satisfied with your first session, we will match you with another tutor for free or issue a full refund with no questions asked.",
  },
];

// Lesson Packages
const LESSON_PACKAGES = [
  {
    id: "standard",
    name: "Standard 1-on-1 Session (60 min)",
    duration: "60 mins",
    sessionCount: 1,
    multiplier: 1.0,
    discountBadge: null,
    description: "Single dedicated 60-minute lesson with custom lesson notes.",
  },
  {
    id: "trial",
    name: "Trial 1-on-1 Lesson (30 min) • 50% Off",
    duration: "30 mins",
    sessionCount: 1,
    multiplier: 0.5,
    discountBadge: "50% Off",
    description: "Quick introductory assessment & lesson plan mapping.",
  },
  {
    id: "bundle4",
    name: "4-Session Monthly Starter • Save 10%",
    duration: "4 x 60 mins",
    sessionCount: 4,
    multiplier: 3.6, // 4 * 0.90
    discountBadge: "Save 10%",
    description: "1 lesson per week with continuous weekly parent reports.",
  },
  {
    id: "bundle8",
    name: "8-Session Mastery Pack • Save 15%",
    duration: "8 x 60 mins",
    sessionCount: 8,
    multiplier: 6.8, // 8 * 0.85
    discountBadge: "Save 15%",
    description: "2 lessons per week for comprehensive exam prep & grade booster.",
  },
];

// Pre-defined time slots for the calendar popup
const AVAILABLE_SLOT_OPTIONS = [
  { id: "s1", time: "09:00 AM", period: "morning", tag: "Available" },
  { id: "s2", time: "11:00 AM", period: "morning", tag: "Few spots" },
  { id: "s3", time: "02:00 PM", period: "afternoon", tag: "Available" },
  { id: "s4", time: "03:30 PM", period: "afternoon", tag: "Popular • Next Available" },
  { id: "s5", time: "04:30 PM", period: "afternoon", tag: "Available" },
  { id: "s6", time: "05:30 PM", period: "evening", tag: "Only 1 left" },
  { id: "s7", time: "07:00 PM", period: "evening", tag: "Available" },
];

// Pre-load Safepay Checkout SDK helpers
function loadSafepaySdk(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window available"));
  if ((window as any).safepay?.Checkout) {
    return Promise.resolve((window as any).safepay);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("safepay-checkout-sdk") as HTMLScriptElement;
    if (existing) {
      if ((window as any).safepay?.Checkout) {
        resolve((window as any).safepay);
        return;
      }
      existing.addEventListener("load", () => resolve((window as any).safepay));
      existing.addEventListener("error", () => {
        loadFallbackSafepaySdk().then(resolve).catch(reject);
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "safepay-checkout-sdk";
    script.src = "https://storage.googleapis.com/safepayobjects/api/safepay-checkout.min.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).safepay?.Checkout) {
        resolve((window as any).safepay);
      } else {
        loadFallbackSafepaySdk().then(resolve).catch(reject);
      }
    };
    script.onerror = () => {
      loadFallbackSafepaySdk().then(resolve).catch(reject);
    };
    document.body.appendChild(script);
  });
}

function loadFallbackSafepaySdk(): Promise<any> {
  return new Promise((resolve, reject) => {
    const fallbackScript = document.createElement("script");
    fallbackScript.id = "safepay-checkout-sdk-fallback";
    fallbackScript.src = "https://unpkg.com/@sfpy/checkout-components@0.1.0/dist/sfpy-checkout.js";
    fallbackScript.async = true;
    fallbackScript.onload = () => resolve((window as any).safepay);
    fallbackScript.onerror = () => reject(new Error("Unable to load Safepay Checkout SDK."));
    document.body.appendChild(fallbackScript);
  });
}

export default function StudentTeacherDetailPage() {
  const params = useParams();
  const teacherId = params?.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);


  // Booking & slot selection state
  const [selectedDayLabel, setSelectedDayLabel] = useState<string>("Today");
  const [selectedSlot, setSelectedSlot] = useState<string>("03:00 PM");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Real database dynamic slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotResult[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState<AvailableSlotResult | null>(null);

  // Booking Summary Modal state
  const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<"details" | "payment">("details");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card">("card");
  const [selectedBookingSubject, setSelectedBookingSubject] = useState<string>("");
  const [bookingTopicTitle, setBookingTopicTitle] = useState("");
  const [bookingTopicNotes, setBookingTopicNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState<string | null>(null);
  const [bookingSuccessData, setBookingSuccessData] = useState<{ reference: string; id: string } | null>(null);
  const [safepaySessionActive, setSafepaySessionActive] = useState<{
    trackerToken: string;
    checkoutUrl: string;
    bookingId: string;
    bookingRef: string;
    env: string;
  } | null>(null);

  // Card input states for direct card payment
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Card brand detector helper (detects SadaPay 5370, Mastercard, Visa, PayPak, Amex)
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, "");
    if (clean.startsWith("5370")) return "SadaPay";
    if (clean.startsWith("4")) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "Amex";
    if (/^6/.test(clean)) return "Discover";
    if (/^9/.test(clean)) return "PayPak";
    return "Debit/Credit";
  }, [cardNumber]);

  // Dropdown states in booking widget
  const [selectedPackageId, setSelectedPackageId] = useState<string>("standard");
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);

  // Calendar Modal Popup state
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => new Date());
  const [slotFilterPeriod, setSlotFilterPeriod] = useState<"all" | "morning" | "afternoon" | "evening">("all");

  // SECTION DROPDOWN / ACCORDION STATES (All requested sections collapsible with dropdown effects)
  const [isAboutOpen, setIsAboutOpen] = useState(true);
  const [isEducationOpen, setIsEducationOpen] = useState(true);
  const [isExperienceOpen, setIsExperienceOpen] = useState(true);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isFaqsOpen, setIsFaqsOpen] = useState(true);
  const [openFaqItemId, setOpenFaqItemId] = useState<string | null>("faq_1");
  const [reviewFilter, setReviewFilter] = useState<"all" | "parent" | "student">("all");

  // Share button state
  const [copiedLink, setCopiedLink] = useState(false);

  // Message modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (!teacherId) return;

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    getTeacherById(teacherId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setIsError(true);
        } else {
          setTeacher(data);
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
          setIsFavorite(Boolean(data.isFavorite));
          if (data.subjects && data.subjects.length > 0) {
            setSelectedBookingSubject(data.subjects[0]);
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsError(true);
        setIsLoading(false);
      });

    // Also fetch reviews explicitly from PostgreSQL bookings
    setIsLoadingReviews(true);
    getTeacherReviewsAction(teacherId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.reviews) {
          setReviews(res.reviews);
        }
      })
      .catch((err) => console.warn("Notice: Reviews dynamic fetch notice:", err))
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    // Preload Safepay Checkout SDK in background
    loadSafepaySdk().catch((err) => console.log("[Safepay preload notice]", err));

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  // Query real database slots when selected date changes
  useEffect(() => {
    if (!teacherId) return;
    let isCurrent = true;
    setIsLoadingSlots(true);

    const year = selectedCalendarDate.getFullYear();
    const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedCalendarDate.getDate()).padStart(2, "0");
    const dateFormattedStr = `${year}-${month}-${day}`;

    getTeacherSlotsForDateAction(teacherId, dateFormattedStr)
      .then((res) => {
        if (!isCurrent) return;
        if (res && res.slots && res.slots.length > 0) {
          setAvailableSlots(res.slots);
          const firstOpen = res.slots.find((s) => s.isAvailable);
          if (firstOpen) {
            setSelectedSlotData(firstOpen);
            setSelectedSlot(firstOpen.displayTime.split(/\s*[–-]\s*/)[0] || firstOpen.startTime);
          } else {
            setSelectedSlotData(null);
          }
        } else {
          setAvailableSlots([]);
          setSelectedSlotData(null);
        }
        setIsLoadingSlots(false);
      })
      .catch((err) => {
        console.warn("Notice: Real slots fetch warning:", err);
        if (isCurrent) setIsLoadingSlots(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [teacherId, selectedCalendarDate]);

  const handleFavoriteToggle = async () => {
    if (!teacher) return;
    const previous = isFavorite;
    setIsFavorite(!previous);
    try {
      await apiToggleFavorite(teacher.id, previous);
    } catch {
      setIsFavorite(previous);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setIsMessageModalOpen(false);
      setMessageSent(false);
      setMessageText("");
    }, 1800);
  };

  // Selected package helper
  const currentPackage = useMemo(() => {
    return LESSON_PACKAGES.find((p) => p.id === selectedPackageId) || LESSON_PACKAGES[0];
  }, [selectedPackageId]);

  // Dynamic calculated rate based on package
  const calculatedPrice = useMemo(() => {
    if (!teacher) return 2200;
    return Math.round(teacher.hourlyRate * currentPackage.multiplier);
  }, [teacher, currentPackage]);

  // Dynamic reviews metrics directly computed from real student reviews in PostgreSQL
  const totalReviewCount = reviews.length;
  const averageRating = useMemo(() => {
    if (totalReviewCount === 0) return teacher?.rating ? teacher.rating.toFixed(1) : "5.0";
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / totalReviewCount).toFixed(1);
  }, [reviews, totalReviewCount, teacher]);

  // Filtered reviews (real reviews from completed bookings in PostgreSQL)
  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    return reviews.filter((r) => r.role === reviewFilter);
  }, [reviews, reviewFilter]);

  // Dynamic Calendar generation for current viewing month
  const calendarData = useMemo(() => {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + calendarMonthOffset);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const monthName = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, isPast: true, date: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);
      const isPast = dateObj.getTime() < today.getTime();
      const isToday = dateObj.getTime() === today.getTime();
      // Available days for Miss Hina: Monday(1) to Friday(5)
      const dayOfWeek = dateObj.getDay();
      const isAvailable = !isPast && dayOfWeek >= 1 && dayOfWeek <= 5;
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday,
        isAvailable,
        date: dateObj,
      });
    }
    return { monthName, days, year, month };
  }, [calendarMonthOffset]);

  // Handle confirming calendar slot selection
  const handleConfirmCalendarSlot = (slotTime: string, date: Date, slotObj?: AvailableSlotResult) => {
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setSelectedDayLabel(formatted);
    setSelectedSlot(slotTime);
    setSelectedCalendarDate(date);
    if (slotObj) {
      setSelectedSlotData(slotObj);
    }
    setIsCalendarModalOpen(false);
  };

  // Filtered real slots for calendar popup
  const filteredRealSlots = useMemo(() => {
    if (availableSlots.length === 0) return [];
    if (slotFilterPeriod === "all") return availableSlots;
    return availableSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0], 10);
      if (slotFilterPeriod === "morning") return hour < 12;
      if (slotFilterPeriod === "afternoon") return hour >= 12 && hour < 17;
      if (slotFilterPeriod === "evening") return hour >= 17;
      return true;
    });
  }, [availableSlots, slotFilterPeriod]);

  // Launch official Safepay Checkout popup/modal
  const launchSafepayCheckout = async (
    trackerToken: string,
    checkoutUrl: string,
    bookingId: string,
    bookingRef: string,
    env: string
  ) => {
    setIsSubmittingBooking(true);
    setBookingSubmitError(null);

    try {
      const sfpy = await loadSafepaySdk();

      if (sfpy && sfpy.Checkout) {
        const checkoutInstance = sfpy.Checkout({
          env: env || "sandbox",
          orderId: bookingRef,
          payment: function () {
            return trackerToken;
          },
          onPayment: function (data: any) {
            console.log("[Safepay] Payment successfully authorized:", data);
            setIsSubmittingBooking(false);
            setIsBookingSummaryOpen(false);
            window.location.href = `/student/classes?booking_id=${bookingId}&paid=true`;
          },
          onCancel: function () {
            console.log("[Safepay] Checkout window closed by student.");
            setIsSubmittingBooking(false);
          },
        });

        checkoutInstance.render();
      } else if (checkoutUrl) {
        window.open(checkoutUrl, "SafepayCheckout", "width=750,height=820,scrollbars=yes,resizable=yes");
      }
    } catch (err: any) {
      console.warn("[Safepay launch notice]", err);
      if (checkoutUrl) {
        window.open(checkoutUrl, "SafepayCheckout", "width=750,height=820,scrollbars=yes,resizable=yes");
      } else {
        setBookingSubmitError(err?.message || "Failed to open Safepay payment window.");
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Submit booking request and open Safepay secure checkout
  const handleSubmitBookingRequest = async () => {
    if (!teacher) return;
    if (!selectedSlotData) {
      setBookingSubmitError("Please pick an available date and time slot first.");
      return;
    }

    const subjectToUse = selectedBookingSubject || teacher.subjects?.[0] || "General Tutoring";

    setIsSubmittingBooking(true);
    setBookingSubmitError(null);

    try {
      const res = await createBookingPaymentSessionAction({
        teacherId: teacher.id,
        subject: subjectToUse,
        topicTitle: bookingTopicTitle.trim() || `${subjectToUse} 1-on-1 Class`,
        topicDescription: bookingTopicNotes.trim() || undefined,
        startIso: selectedSlotData.startIso,
        endIso: selectedSlotData.endIso,
        paymentMethod: "card",
      });

      if (!res.success || !res.trackerToken) {
        setBookingSubmitError(res.error || "Failed to initiate payment session with Safepay.");
        setIsSubmittingBooking(false);
        return;
      }

      const activeSession = {
        trackerToken: res.trackerToken,
        checkoutUrl: res.safepayCheckoutUrl || "",
        bookingId: res.bookingId || "",
        bookingRef: res.bookingReference || "",
        env: res.env || "sandbox",
      };

      setSafepaySessionActive(activeSession);

      // Launch Safepay Checkout popup/modal
      await launchSafepayCheckout(
        activeSession.trackerToken,
        activeSession.checkoutUrl,
        activeSession.bookingId,
        activeSession.bookingRef,
        activeSession.env
      );
    } catch (err: any) {
      console.error("[Safepay submit error]", err);
      setBookingSubmitError(err?.message || "An unexpected error occurred. Please try again.");
      setIsSubmittingBooking(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-5 w-4 rounded-lg" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 rounded-2xl border-slate-200 bg-white space-y-6 shadow-xs">
              <div className="flex gap-5">
                <Skeleton className="size-24 rounded-full shrink-0" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-xs">
              <Skeleton className="h-72 w-full rounded-xl" />
            </Card>
          </div>
          <div className="lg:col-span-4">
            <Card className="p-6 rounded-2xl border-slate-200 bg-white space-y-4 shadow-xs">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isError || !teacher) {
    return (
      <Card className="max-w-xl mx-auto my-16 p-10 text-center space-y-4 rounded-2xl border-slate-200 shadow-sm bg-white">
        <div className="size-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
          <BookOpen className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Teacher Profile Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            The requested instructor profile does not exist or may have been updated.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs h-10 px-6 cursor-pointer">
          <Link href="/student/find-teachers">
            <ArrowLeft className="size-4 mr-2" />
            <span>Return to Find Teachers</span>
          </Link>
        </Button>
      </Card>
    );
  }

  const initials = `${(teacher.firstName || teacher.name.split(" ")[0] || "T").charAt(0)}${(
    teacher.lastName || teacher.name.split(" ")[1] || "T"
  ).charAt(0)}`.toUpperCase();


  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb links */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link
            href="/student"
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/student/find-teachers"
            className="hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
          >
            Find Teachers
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">
            {teacher.name}
          </span>
        </nav>

        {/* Action cluster: Back, Share, Save */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Link href="/student/find-teachers">
              <ArrowLeft className="size-3.5 mr-1 text-slate-400" />
              <span>All Teachers</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 mr-1 text-slate-400" />
                <span>Share</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFavoriteToggle}
            className={cn(
              "h-8.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors",
              isFavorite
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Heart
              className={cn(
                "size-3.5 mr-1",
                isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"
              )}
            />
            <span>{isFavorite ? "Saved" : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Interactive Page Sub-Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
        {[
          { id: "overview", label: "Overview" },
          { id: "about", label: `About ${teacher.firstName || teacher.name.split(" ")[0] || "Instructor"}` },
          { id: "education-section", label: "Education & Experience" },
          { id: "certifications-section", label: "Certifications" },
          { id: "reviews-section", label: `Reviews (${teacher.reviewCount || 56})` },
          { id: "faqs-section", label: "FAQs" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              const el = document.getElementById(tab.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* LEFT / PRIMARY COLUMN (Hero, Video, Dropdown Sections) */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* A. Hero Profile Overview Card */}
          <Card id="overview" className="p-6 sm:p-7 rounded-2xl border-slate-200 bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar with status ring & online badge */}
              <div className="relative shrink-0">
                <Avatar className="size-24 sm:size-28 ring-4 ring-orange-500/10 shadow-sm">
                  {teacher.avatarUrl && (
                    <AvatarImage
                      src={teacher.avatarUrl}
                      alt={teacher.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {teacher.isVerified && (
                  <div
                    title="Verified Instructor"
                    className="absolute -bottom-1 -right-1 size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-3 ring-white shadow-xs"
                  >
                    <ShieldCheck className="size-4 stroke-[2.5]" />
                  </div>
                )}
                {/* Live Online Dot */}
                <div
                  title="Online now"
                  className="absolute top-0 right-0 size-4 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                />
              </div>

              {/* Title & Key Highlights */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {teacher.name}
                  </h1>

                  {teacher.isVerified && (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5"
                    >
                      <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
                      Verified Tutor
                    </Badge>
                  )}

                  {teacher.highlightBadge && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-2 py-0.5 shadow-2xs">
                      {teacher.highlightBadge}
                    </Badge>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Online Now
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                  {teacher.headline}
                </p>

                {/* Micro metrics bar */}
                <div className="flex items-center gap-3.5 text-xs text-slate-500 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    {averageRating} ({totalReviewCount} {totalReviewCount === 1 ? "review" : "reviews"})
                  </span>
                  {teacher.totalClassesTaught ? (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <strong>{teacher.totalClassesTaught}+</strong> sessions taught
                    </span>
                  ) : null}
                  {teacher.city && (
                    <span className="text-slate-500">
                      • {teacher.city}, {teacher.country}
                    </span>
                  )}
                  {teacher.responseSpeed && (
                    <span className="text-slate-500">
                      • {teacher.responseSpeed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>



          {/* C. DROPDOWN SECTION 1: ABOUT ME / THE INSTRUCTOR */}
          <Card id="about" className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <User className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      About {teacher.name} & Teaching Philosophy
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-semibold text-orange-700 bg-orange-50 border-orange-200">
                      STEM Educator
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Background, teaching approach, and personalized student guidance
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                  isAboutOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                )}
              >
                <ChevronDown className="size-4" />
              </div>
            </button>

            {/* Dropdown Content */}
            {isAboutOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in-50 duration-200">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2">
                  {teacher.bio}
                </p>

                {/* Why Learn With This Teacher - Highlight Grid */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Why learn with {teacher.name.split(" ")[0]}?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-start gap-3 hover:bg-orange-50 transition-colors">
                      <div className="size-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Interactive Digital Whiteboard
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Visual step-by-step problem solving with downloadable session notes.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-start gap-3 hover:bg-orange-50 transition-colors">
                      <div className="size-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Personalized Learning Pace
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Curriculum customized to your school syllabus and upcoming exam dates.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-start gap-3 hover:bg-orange-50 transition-colors">
                      <div className="size-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Weekly Parent Updates
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Regular feedback on student progress, strengths, and areas to improve.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-start gap-3 hover:bg-orange-50 transition-colors">
                      <div className="size-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Homework & Quiz Assistance
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Support for school assignments, past-paper practice, and quiz prep.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects & Levels Summary */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 mr-1">Specialized in:</span>
                  {teacher.subjects.map((sub) => (
                    <Badge
                      key={sub}
                      variant="secondary"
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                    >
                      {sub}
                    </Badge>
                  ))}
                  {teacher.targetStudentLevels?.map((lvl) => (
                    <Badge
                      key={lvl}
                      variant="outline"
                      className="px-3 py-1 rounded-lg bg-orange-50 text-orange-950 text-xs font-semibold border border-orange-200"
                    >
                      {lvl}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* D. DROPDOWN SECTION 2: EDUCATION DEGREES & TEACHING EXPERIENCE */}
          <div id="education-section" className="space-y-4">
            {/* Education Degrees Dropdown Card */}
            {teacher.education && teacher.education.length > 0 && (
              <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsEducationOpen(!isEducationOpen)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Education & Academic Degrees
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200">
                          {teacher.education.length} Qualifications
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        University degrees and academic background
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                      isEducationOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                {isEducationOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-3.5 animate-in fade-in-50 duration-200">
                    {teacher.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 hover:border-slate-200 transition-colors"
                      >
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {edu.degree}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {edu.institution}
                          {edu.fieldOfStudy ? ` • Major in ${edu.fieldOfStudy}` : ""}
                        </p>
                        {edu.completionYear && (
                          <span className="text-[11px] text-slate-400 block pt-0.5">
                            Graduated {edu.completionYear} • Verified by ZuhDemy
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Teaching Experience Dropdown Card */}
            {teacher.experience && teacher.experience.length > 0 && (
              <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Briefcase className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Teaching & Mentoring Experience
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200">
                          {teacher.experience.length} Roles
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        School teaching tenure and online 1-on-1 tutoring history
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                      isExperienceOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                {isExperienceOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-3.5 animate-in fade-in-50 duration-200">
                    {teacher.experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {exp.role}
                          </h4>
                          <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {exp.institution}
                        </p>
                        {exp.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* E. DROPDOWN SECTION 3: VERIFIED TEACHING CERTIFICATIONS */}
          {teacher.certificates && teacher.certificates.length > 0 && (
            <Card id="certifications-section" className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCertificatesOpen(!isCertificatesOpen)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Award className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Verified Teaching Certifications
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                        {teacher.certificates.length} Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accredited pedagogical certificates and training credentials
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                    isCertificatesOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                  )}
                >
                  <ChevronDown className="size-4" />
                </div>
              </button>

              {isCertificatesOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {teacher.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {cert.title}
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            {cert.issuer} {cert.year ? `(${cert.year})` : ""}
                          </p>
                          <span className="text-[10px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <Check className="size-2.5 stroke-[3]" /> Verified by ZuhDemy
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* F. DROPDOWN SECTION 4: STUDENT & PARENT REVIEWS */}
          <Card id="reviews-section" className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsReviewsOpen(!isReviewsOpen)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="size-5 fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Student & Parent Reviews ({totalReviewCount})
                    </h3>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {averageRating} ★
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalReviewCount > 0
                      ? `Real verified reviews from completed 1-on-1 tutoring sessions`
                      : "Verified student feedback and lesson ratings"}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                  isReviewsOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                )}
              >
                <ChevronDown className="size-4" />
              </div>
            </button>

            {isReviewsOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in-50 duration-200">
                {/* Filter & rating breakdown bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: "all", label: `All Reviews (${totalReviewCount})` },
                      { id: "student", label: `Students (${reviews.filter((r) => r.role === "student").length})` },
                      { id: "parent", label: `Parents (${reviews.filter((r) => r.role === "parent").length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewFilter(f.id as any);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          reviewFilter === f.id
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    100% Verified Lesson Attendees
                  </span>
                </div>

                {/* Rating breakdown summary pills */}
                <div className="grid grid-cols-3 gap-2.5 text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">Average Rating</span>
                    <span className="text-sm font-bold text-slate-900">{averageRating} ★</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Verified Sessions</span>
                    <span className="text-sm font-bold text-slate-900">
                      {totalReviewCount} {totalReviewCount === 1 ? "Class" : "Classes"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Satisfaction</span>
                    <span className="text-sm font-bold text-slate-900">
                      {totalReviewCount > 0 ? "100%" : "—"} Positive
                    </span>
                  </div>
                </div>

                {/* Testimonials list or Empty State */}
                {isLoadingReviews ? (
                  <div className="space-y-3 pt-1">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="h-3 w-16 rounded" />
                        </div>
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-3/4 rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2.5 my-2">
                    <div className="size-11 rounded-full bg-amber-50 border border-amber-200 text-amber-500 mx-auto flex items-center justify-center">
                      <Star className="size-5 fill-amber-400 text-amber-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No Student Reviews Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {teacher.name} has not received any reviews yet. Be among the first students to complete a class and leave verified feedback!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border border-slate-100 bg-white space-y-2 hover:border-slate-200 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-8 rounded-full border border-slate-200 shrink-0">
                              {rev.authorAvatar && <AvatarImage src={rev.authorAvatar} alt={rev.author} />}
                              <AvatarFallback className="text-[10px] font-bold bg-orange-100 text-orange-700">
                                {(rev.author || "ST")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {rev.author}
                                </span>
                                {rev.verified && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Verified Class
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {rev.studentInfo}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-3 fill-amber-500 text-amber-500"
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          &quot;{rev.comment}&quot;
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">
                            {rev.date}
                          </span>
                          <button
                            type="button"
                            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                          >
                            <ThumbsUp className="size-3" />
                            <span>Helpful ({rev.likes || 1})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* G. DROPDOWN SECTION 5: FREQUENTLY ASKED QUESTIONS */}
          <Card id="faqs-section" className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsFaqsOpen(!isFaqsOpen)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Frequently Asked Questions ({TEACHER_FAQS.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Everything you need to know about taking 1-on-1 online lessons with Miss Hina
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform duration-200",
                  isFaqsOpen ? "rotate-180 bg-orange-50 text-orange-600 border-orange-200" : "bg-white text-slate-500"
                )}
              >
                <ChevronDown className="size-4" />
              </div>
            </button>

            {isFaqsOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-2.5 animate-in fade-in-50 duration-200">
                {TEACHER_FAQS.map((faq) => {
                  const isOpen = openFaqItemId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={cn(
                        "rounded-xl border transition-all duration-200 overflow-hidden",
                        isOpen
                          ? "border-orange-200 bg-orange-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqItemId(isOpen ? null : faq.id)}
                        className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {faq.question}
                        </span>
                        <div
                          className={cn(
                            "size-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200",
                            isOpen ? "rotate-180 bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          <ChevronDown className="size-3.5" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-orange-100/70 text-xs text-slate-600 leading-relaxed animate-in fade-in-50 duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ================================================================= */}
        {/* RIGHT / SIDEBAR COLUMN (Clean Booking & Slot Selection Panel) */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-sm space-y-5 sticky top-6">
            {/* Hourly Rate & Dynamic Price Header */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {currentPackage.name}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {teacher.currency} {calculatedPrice.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  / {currentPackage.duration}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dedicated 1-on-1 private lesson with {teacher.name.split(" ")[0]}
              </p>
            </div>

            {/* Next Available Slot Badge */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                <Clock className="size-4 text-orange-600" />
                <span>Next Available Slot</span>
              </div>
              <p className="text-xs font-medium text-orange-800">
                {teacher.nextAvailableSlot || "Today at 03:30 PM PKT"}
              </p>
            </div>

            {/* Package / Duration Selection Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Select Package:</span>
                {currentPackage.discountBadge && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {currentPackage.discountBadge}
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs font-semibold text-slate-800 hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Zap className="size-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{currentPackage.name}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-400 transition-transform duration-200 shrink-0",
                    isPackageDropdownOpen && "rotate-180 text-orange-500"
                  )}
                />
              </button>

              {/* Package Dropdown Menu */}
              {isPackageDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in-50 duration-150">
                  {LESSON_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setIsPackageDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer",
                        selectedPackageId === pkg.id
                          ? "bg-orange-50 text-orange-950 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{pkg.name}</span>
                        {pkg.discountBadge && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                            {pkg.discountBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {pkg.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CHOOSE DAY & PREFERRED TIME: (Clean, uncluttered, confusion-free calendar button) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 block">
                  Choose Day & Preferred Time:
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  7 slots open
                </span>
              </div>

              {/* CLEAN PROMINENT BUTTON TO OPEN CALENDAR POP-UP (No confusing shortcut chips underneath) */}
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(true)}
                className="w-full p-3.5 rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100/90 hover:to-amber-100/90 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <CalendarDays className="size-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                      {selectedDayLabel} at {selectedSlot}
                    </span>
                    <span className="text-[11px] text-orange-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar className="size-3" />
                      Click to choose date & slot from calendar
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-white/90 px-2 py-1 rounded-lg border border-orange-200/80 group-hover:bg-white transition-colors">
                  <span>Select</span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Booking Action / Confirmed State */}
            <div className="pt-2">
              {bookingConfirmed && bookingSuccessData ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5 animate-in zoom-in-95 duration-200">
                  <div className="size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                    <CheckCheck className="size-5 stroke-[2.5]" />
                  </div>
                  <div className="text-xs font-bold text-emerald-900">
                    Payment Held & Request Sent!
                  </div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-emerald-200/80 text-left space-y-1">
                    <p>
                      <strong>Reference:</strong> {bookingSuccessData.reference}
                    </p>
                    <p>
                      <strong>Instructor:</strong> {teacher.name}
                    </p>
                    <p>
                      <strong>Escrow Status:</strong> <span className="text-emerald-700 font-bold">Paid & Held Securely</span>
                    </p>
                    <p>
                      <strong>Teacher Review:</strong> <span className="text-amber-700 font-bold">Pending Confirmation</span>
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedDayLabel} at {selectedSlot} PKT
                    </p>
                    <p className="text-slate-500 text-[10px] pt-1 border-t border-emerald-200">
                      Funds are held in escrow. Google Meet link will be generated upon approval.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-1">
                    <Link href="/student/classes" className="flex-1">
                      <Button
                        type="button"
                        size="xs"
                        className="w-full text-[11px] rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer font-bold"
                      >
                        View in My Classes
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setBookingConfirmed(false);
                        setBookingSuccessData(null);
                      }}
                      className="text-[11px] rounded-lg border-emerald-300 text-emerald-800 hover:bg-emerald-100/70 cursor-pointer"
                    >
                      New Request
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedSlotData && availableSlots.length > 0) {
                      const firstAvail = availableSlots.find((s) => s.isAvailable) || availableSlots[0];
                      setSelectedSlotData(firstAvail);
                      setSelectedSlot(firstAvail.displayTime.split(/\s*[–-]\s*/)[0] || firstAvail.startTime);
                    }
                    setBookingStep("details");
                    setBookingSubmitError(null);
                    setIsBookingSummaryOpen(true);
                  }}
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="size-4" />
                  <span>Book 1-on-1 Class ({teacher.currency} {calculatedPrice.toLocaleString()})</span>
                </Button>
              )}
            </div>

            {/* Secondary Action: Message Teacher */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full h-10 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="size-3.5 text-slate-400" />
              <span>Ask {teacher.name.split(" ")[0]} a Question</span>
            </Button>

            {/* Platform Guarantees list */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <Video className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  100% Online HD 1-on-1 call on <strong>Google Meet</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Languages className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Language: <strong>{teacher.teachingLanguages.join(", ")}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-orange-500 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Satisfaction Guarantee</strong>: Free tutor rematch if unsatisfied
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>ZuhDemy Escrow Protection</strong>: Payment released only after lesson completion
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* POP-UP MODAL 1: CALENDAR & TIME SLOT PICKER DIALOG */}
      {/* ===================================================================== */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden rounded-2xl bg-white border-slate-200 shadow-2xl">
          {/* Calendar Header */}
          <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-5" />
                <DialogTitle className="text-base sm:text-lg font-bold text-white">
                  Select Date & Preferred Time Slot
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-orange-100">
                Instructor: {teacher.name} • 1-on-1 Online via Google Meet
              </DialogDescription>
            </div>
          </div>

          {/* Calendar Body: 2 Columns (Date Picker + Slots Picker) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 max-h-[75vh] overflow-y-auto">
            {/* Left Column: Month Date Picker (Col span 7) */}
            <div className="md:col-span-7 p-5 space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  {calendarData.monthName}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={calendarMonthOffset <= 0}
                    onClick={() => setCalendarMonthOffset((prev) => Math.max(0, prev - 1))}
                    className="size-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={calendarMonthOffset >= 2}
                    onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                    className="size-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {calendarData.days.map((item, idx) => {
                  if (!item.isCurrentMonth || !item.date) {
                    return <div key={`empty-${idx}`} className="h-9" />;
                  }

                  const isSelected =
                    selectedCalendarDate.getDate() === item.date.getDate() &&
                    selectedCalendarDate.getMonth() === item.date.getMonth() &&
                    selectedCalendarDate.getFullYear() === item.date.getFullYear();

                  return (
                    <button
                      key={item.dayNumber}
                      type="button"
                      disabled={item.isPast}
                      onClick={() => setSelectedCalendarDate(item.date!)}
                      className={cn(
                        "h-9 rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all cursor-pointer select-none",
                        item.isPast && "text-slate-300 opacity-40 cursor-not-allowed",
                        !item.isPast && !isSelected && "text-slate-700 hover:bg-orange-50 hover:text-orange-900",
                        isSelected && "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30 scale-105 z-10",
                        item.isToday && !isSelected && "border border-orange-400 text-orange-600 font-bold"
                      )}
                    >
                      <span>{item.dayNumber}</span>
                      {/* Available indicator dot */}
                      {item.isAvailable && !isSelected && (
                        <span className="size-1 rounded-full bg-emerald-500 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Available Day
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-orange-500" />
                  Selected
                </span>
                <span>Pakistan Time (PKT - UTC+5)</span>
              </div>
            </div>

            {/* Right Column: Time Slots for Selected Date (Col span 5) */}
            <div className="md:col-span-5 p-5 bg-slate-50/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block">
                    Available Time Slots
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {selectedCalendarDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h4>
                </div>

                {/* Period Filter Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-200/60 text-[10px] font-bold text-slate-600">
                  {(["all", "morning", "afternoon", "evening"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSlotFilterPeriod(period)}
                      className={cn(
                        "py-1 rounded capitalize transition-all cursor-pointer",
                        slotFilterPeriod === period
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "hover:text-slate-900"
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>

                {/* Slot Selection Buttons List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {isLoadingSlots ? (
                    <div className="py-8 text-center space-y-2">
                      <Loader2 className="size-5 animate-spin mx-auto text-orange-500" />
                      <span className="text-xs text-slate-500 block">Checking live availability...</span>
                    </div>
                  ) : filteredRealSlots.length === 0 ? (
                    <div className="py-8 text-center space-y-1 bg-white rounded-xl border border-slate-200 p-4">
                      <span className="text-xs font-semibold text-slate-700 block">No Available Slots</span>
                      <span className="text-[11px] text-slate-400 block">
                        No 1-hour slots available for this period. Try picking another date.
                      </span>
                    </div>
                  ) : (
                    filteredRealSlots.map((slot) => {
                      const isSelected = selectedSlotData?.id === slot.id || selectedSlot === slot.startTime;
                      const isClickable = slot.isAvailable;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!isClickable}
                          onClick={() => {
                            setSelectedSlotData(slot);
                            setSelectedSlot(slot.displayTime.split(/\s*[–-]\s*/)[0] || slot.startTime);
                          }}
                          className={cn(
                            "w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all shadow-2xs",
                            isSelected && isClickable
                              ? "border-orange-500 bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20"
                              : isClickable
                              ? "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/40 cursor-pointer"
                              : "border-slate-200/60 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className={cn("size-3.5", isSelected && isClickable ? "text-white" : "text-orange-500")} />
                            <span>{slot.displayTime} PKT</span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                              isSelected && isClickable
                                ? "bg-white/20 text-white"
                                : slot.status === "available"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : slot.status === "reserved_pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                                : "bg-slate-200 text-slate-600"
                            )}
                          >
                            {slot.status === "available"
                              ? "Available"
                              : slot.status === "reserved_pending"
                              ? "Pending Approval"
                              : slot.status === "booked_confirmed"
                              ? "Booked"
                              : "Unavailable"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <Button
                  type="button"
                  onClick={() => {
                    handleConfirmCalendarSlot(selectedSlot, selectedCalendarDate, selectedSlotData || undefined);
                    setBookingStep("details");
                    setBookingSubmitError(null);
                    setIsBookingSummaryOpen(true);
                  }}
                  disabled={!selectedSlotData || !selectedSlotData.isAvailable}
                  className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="size-4 mr-1.5 stroke-[3]" />
                  Confirm Slot & Review Summary
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="w-full h-8 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* POP-UP MODAL 2: INQUIRY MESSAGE DIALOG */}
      {/* ===================================================================== */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900">
              Message {teacher.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ask about syllabus coverage, available times, or specific requirements before booking.
            </DialogDescription>
          </DialogHeader>

          {messageSent ? (
            <div className="py-6 text-center space-y-2">
              <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="size-5 stroke-[3]" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Message Sent!</h4>
              <p className="text-xs text-slate-500">
                {teacher.name.split(" ")[0]} usually responds within ~15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
              <div>
                <label
                  htmlFor="inquiry-message"
                  className="text-xs font-semibold text-slate-700 block mb-1.5"
                >
                  Your Message:
                </label>
                <textarea
                  id="inquiry-message"
                  required
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Hi ${teacher.name.split(" ")[0]}, I am looking for Grade 7 math tutoring...`}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Send Inquiry
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* POP-UP MODAL 3: BOOKING SUMMARY & REQUEST SUBMISSION DIALOG */}
      {/* ===================================================================== */}
      <Dialog open={isBookingSummaryOpen} onOpenChange={setIsBookingSummaryOpen}>
        <DialogContent className="max-w-md p-5 rounded-2xl bg-white border-slate-200 max-h-[92vh] overflow-y-auto">
          {bookingSuccessData ? (
            <div className="py-6 text-center space-y-4">
              <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="size-7 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Payment Authorized & Held in Escrow
                </Badge>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Booking Request & Payment Confirmed!
                </h3>
                <p className="text-xs text-slate-500">
                  Booking Ref: <span className="font-mono font-bold text-orange-600">{bookingSuccessData.reference}</span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Instructor:</span>
                  <span className="font-bold text-slate-900">{teacher.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-bold text-slate-900">{selectedBookingSubject || teacher.subjects[0]}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-semibold text-slate-900">{selectedDayLabel} at {selectedSlot} PKT</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Amount Held:</span>
                  <span className="font-bold text-emerald-600">{teacher.currency} {calculatedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Escrow Status:</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">Funds Held & Request Sent</Badge>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  100% ZuhDemy Escrow Protection
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Your payment of {teacher.currency} {calculatedPrice.toLocaleString()} is safely held by ZuhDemy. We have notified {teacher.name.split(" ")[0]} to accept your request. Once confirmed, your Google Meet link will appear in your classes. Funds are only released to the teacher 24 hours after completion.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href="/student/classes" className="flex-1">
                  <Button
                    type="button"
                    className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    View in My Classes
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsBookingSummaryOpen(false);
                    setBookingConfirmed(false);
                    setBookingSuccessData(null);
                  }}
                  className="rounded-xl h-10 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step indicator header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                      bookingStep === "details"
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-emerald-500 text-white"
                    )}
                  >
                    {bookingStep === "details" ? "1" : <Check className="size-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      bookingStep === "details" ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    1. Lesson Details
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-300" />
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                      bookingStep === "payment"
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    )}
                  >
                    2
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      bookingStep === "payment" ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    2. Payment & Escrow
                  </span>
                </div>
              </div>

              {bookingStep === "details" ? (
                <>
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CalendarDays className="size-4.5 text-orange-500" />
                      Session Details & Objectives
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Step 1 of 2: Configure your lesson before authorizing payment to {teacher.name}.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Teacher Snapshot */}
                  <div className="flex items-center gap-3 p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                    <Avatar className="size-11 rounded-full border border-orange-200">
                      <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                        {teacher.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{teacher.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{teacher.headline}</div>
                      <div className="text-[11px] text-orange-700 font-semibold mt-0.5">
                        {teacher.currency} {teacher.hourlyRate.toLocaleString()} / hour
                      </div>
                    </div>
                  </div>

                  {/* Booking Specifications Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Select Subject:
                      </label>
                      <select
                        value={selectedBookingSubject || teacher.subjects[0]}
                        onChange={(e) => setSelectedBookingSubject(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      >
                        {teacher.subjects.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Date</span>
                        <span className="text-xs font-bold text-slate-800">{selectedDayLabel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Time (Asia/Karachi)</span>
                        <span className="text-xs font-bold text-slate-800">
                          {selectedSlotData?.displayTime || `${selectedSlot} PKT`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Duration</span>
                        <span className="text-xs font-bold text-slate-800">60 Minutes (1 Hour)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Session Price</span>
                        <span className="text-xs font-extrabold text-orange-600">
                          {teacher.currency} {calculatedPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Topic & Learning Goals */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <label htmlFor="topic-title" className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Topic / Lesson Goal (Optional):
                      </label>
                      <input
                        id="topic-title"
                        type="text"
                        value={bookingTopicTitle}
                        onChange={(e) => setBookingTopicTitle(e.target.value)}
                        placeholder="e.g., Quadratic Equations & Graphing"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="topic-notes" className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Notes for Teacher (Optional):
                      </label>
                      <textarea
                        id="topic-notes"
                        rows={2}
                        value={bookingTopicNotes}
                        onChange={(e) => setBookingTopicNotes(e.target.value)}
                        placeholder="Mention specific textbook exercises, past papers, or questions..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Escrow Guarantee Notice */}
                  <div className="text-[11px] text-slate-600 bg-orange-50/50 border border-orange-200/60 p-2.5 rounded-lg flex items-start gap-2">
                    <ShieldCheck className="size-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Upfront Payment Required:</strong> You will authorize payment in Step 2. Funds are held safely in ZuhDemy Escrow and only released after your lesson is delivered.
                    </span>
                  </div>

                  {bookingSubmitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-rose-600" />
                      <span>{bookingSubmitError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBookingSummaryOpen(false)}
                      className="rounded-xl text-xs font-semibold h-10 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!selectedSlotData) {
                          setBookingSubmitError("Please select a date and time slot first.");
                          return;
                        }
                        setBookingSubmitError(null);
                        setBookingStep("payment");
                      }}
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold h-10 px-5 shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-2"
                    >
                      <span>Proceed to Payment ({teacher.currency} {calculatedPrice.toLocaleString()})</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="size-4 text-orange-500" />
                        Safepay Secure Checkout
                      </DialogTitle>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          SadaPay
                        </span>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          NayaPay
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Visa
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          MC
                        </span>
                      </div>
                    </div>
                    <DialogDescription className="text-[11px] text-slate-500">
                      Step 2 of 2: Authorize session payment to {teacher.name.split(" ")[0]}.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Compact Order & Price Box */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 text-xs truncate">
                        1-Hour {selectedBookingSubject || teacher.subjects[0]} with {teacher.name.split(" ")[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Lock className="size-3 text-emerald-600 shrink-0" />
                        <span>Fixed rate • Locked in escrow</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="font-extrabold text-orange-600 text-base">
                        {teacher.currency} {calculatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Official Safepay Gateway Card */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center shrink-0">
                        <Lock className="size-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Official Safepay 256-Bit Encrypted Gateway
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Supports Pakistani debit & credit cards, SadaPay, NayaPay & 1LINK.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Accepted Payment Methods
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          SadaPay
                        </span>
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          NayaPay
                        </span>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Visa
                        </span>
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Mastercard
                        </span>
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          PayPak
                        </span>
                      </div>
                    </div>

                    {/* Escrow Guarantee Notice */}
                    <div className="flex items-start gap-2 p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-lg text-[11px] text-emerald-800">
                      <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>ZuhDemy Escrow Protection:</strong> You will be redirected to Safepay to securely authenticate with your bank OTP. Funds are safely held in escrow until your class is delivered.
                      </span>
                    </div>
                  </div>

                  {safepaySessionActive && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 text-xs font-semibold">
                        <Loader2 className="size-4 animate-spin text-blue-600" />
                        <span>Safepay checkout window opened</span>
                      </div>
                      <p className="text-[11px] text-blue-700">
                        Please complete your payment with card or SadaPay/NayaPay in the Safepay window. If the popup was blocked by your browser, click below:
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            launchSafepayCheckout(
                              safepaySessionActive.trackerToken,
                              safepaySessionActive.checkoutUrl,
                              safepaySessionActive.bookingId,
                              safepaySessionActive.bookingRef,
                              safepaySessionActive.env
                            )
                          }
                          className="text-[11px] h-7 px-3 rounded-lg border-blue-300 text-blue-800 hover:bg-blue-100 font-semibold cursor-pointer"
                        >
                          Re-open Safepay Checkout
                        </Button>
                      </div>
                    </div>
                  )}

                  {bookingSubmitError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-rose-600" />
                      <span>{bookingSubmitError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBookingStep("details")}
                      disabled={isSubmittingBooking}
                      className="rounded-xl text-xs font-semibold h-10 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="size-3.5" />
                      <span>Back</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmitBookingRequest}
                      disabled={isSubmittingBooking}
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold h-10 px-5 shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Connecting to Safepay...</span>
                        </>
                      ) : safepaySessionActive ? (
                        <>
                          <Lock className="size-4 stroke-[2.5]" />
                          <span>Re-open Safepay ({teacher.currency} {calculatedPrice.toLocaleString()})</span>
                        </>
                      ) : (
                        <>
                          <Lock className="size-4 stroke-[2.5]" />
                          <span>Pay with Safepay ({teacher.currency} {calculatedPrice.toLocaleString()})</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
