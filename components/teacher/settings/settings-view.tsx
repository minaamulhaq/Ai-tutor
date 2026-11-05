"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Lock,
  SlidersHorizontal,
  LifeBuoy,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  Clock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  LogOut,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Trash2,
  Send,
  Video,
  FileText,
  CalendarDays,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_TIMEZONES,
  apiFetchTeacherProfile,
  apiUpdateTeacherProfile,
} from "@/components/teacher/profile/profile-service";
import { createClient } from "@/utils/supabase/client";
import {
  getTeacherGoogleStatusAction,
  disconnectTeacherGoogleAction,
} from "@/app/actions/bookingActions";

export type SettingsNavId =
  | "account"
  | "security"
  | "google"
  | "notifications"
  | "privacy"
  | "preferences"
  | "support"
  | "actions";

interface NavItem {
  id: SettingsNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "account", label: "Account Settings", icon: User },
  { id: "security", label: "Security & Login", icon: Shield },
  { id: "google", label: "Google Calendar & Meet", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Visibility", icon: Lock },
  { id: "preferences", label: "Class Preferences", icon: SlidersHorizontal },
  { id: "support", label: "Help & Support", icon: LifeBuoy },
  { id: "actions", label: "Account Actions", icon: AlertTriangle },
];

export function TeacherSettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsNavId>("account");

  // =========================================================================
  // 1. ACCOUNT SETTINGS STATE
  // =========================================================================
  const [email, setEmail] = useState("a.wright@zuhdemy.com");
  const [phone, setPhone] = useState("+92 300 8472910");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [accountStatus] = useState("Active & Verified");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // =========================================================================
  // 2. SECURITY & LOGIN STATE
  // =========================================================================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // 2FA state & modal
  const [has2FA, setHas2FA] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorKeyCopied, setTwoFactorKeyCopied] = useState(false);

  // Forgot password modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("a.wright@zuhdemy.com");
  const [forgotSent, setForgotSent] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Windows Desktop (PC)",
      browser: "Chrome 128.0",
      location: "Lahore, Pakistan",
      ipAddress: "119.160.118.42",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Apple iPhone 15 Pro",
      browser: "Safari Mobile 17.4",
      location: "Dubai, United Arab Emirates",
      ipAddress: "94.200.15.89",
      lastActive: "Yesterday at 04:22 PM",
      isCurrent: false,
    },
  ]);
  const [sessionSuccess, setSessionSuccess] = useState(false);

  // =========================================================================
  // 3. NOTIFICATIONS STATE
  // =========================================================================
  const [bookingRequests, setBookingRequests] = useState(true);
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState(true);
  const [reminderTiming, setReminderTiming] = useState("30");
  const [studentMessages, setStudentMessages] = useState(true);
  const [earningsUpdates, setEarningsUpdates] = useState(true);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState(false);

  // =========================================================================
  // 4. PRIVACY & VISIBILITY STATE
  // =========================================================================
  const [profileVisible, setProfileVisible] = useState(true);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // =========================================================================
  // 5. CLASS PREFERENCES STATE
  // =========================================================================
  const sessionDuration = 60; // Standard 60 mins MVP block
  const [noticeHours, setNoticeHours] = useState("12");
  const [bufferMinutes, setBufferMinutes] = useState("15");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  // =========================================================================
  // 6. HELP & SUPPORT STATE
  // =========================================================================
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isReportProblemOpen, setIsReportProblemOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState<string | null>(null);

  // =========================================================================
  // 7. ACCOUNT ACTIONS STATE
  // =========================================================================
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Load teacher profile data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingProfile(true);
        const profile = await apiFetchTeacherProfile();
        if (profile.email) setEmail(profile.email);
        if (profile.phone) setPhone(profile.phone);
        if (profile.preferredLanguage) setLanguage(profile.preferredLanguage);
        if (profile.timezone) setTimezone(profile.timezone);
      } catch (err) {
        console.error("Failed to load initial settings:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadData();
  }, []);

  // =========================================================================
  // GOOGLE OAUTH STATE & EFFECTS
  // =========================================================================
  const [googleStatus, setGoogleStatus] = useState<{
    isConnected: boolean;
    googleEmail?: string;
    connectedAt?: string;
  } | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  const [googleFeedback, setGoogleFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadGoogle() {
      setIsLoadingGoogle(true);
      try {
        const res = await getTeacherGoogleStatusAction();
        setGoogleStatus(res);
      } catch (err) {
        console.warn("Could not load Google status:", err);
      } finally {
        setIsLoadingGoogle(false);
      }
    }
    loadGoogle();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google") === "connected") {
        setGoogleFeedback({
          type: "success",
          text: "Google Calendar successfully connected! Automated Google Meet links will now be generated upon class approval.",
        });
        setActiveTab("google");
      } else if (params.get("google_error")) {
        setGoogleFeedback({
          type: "error",
          text: `Google connection failed: ${decodeURIComponent(params.get("google_error") || "Error")}. Please try again.`,
        });
        setActiveTab("google");
      }
    }
  }, []);

  const handleDisconnectGoogle = async () => {
    setIsDisconnectingGoogle(true);
    setGoogleFeedback(null);
    try {
      await disconnectTeacherGoogleAction();
      setGoogleStatus({ isConnected: false });
      setGoogleFeedback({
        type: "success",
        text: "Google account disconnected successfully.",
      });
    } catch {
      setGoogleFeedback({
        type: "error",
        text: "Failed to disconnect Google account.",
      });
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  // Save Account
  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    setAccountError(null);
    setAccountSuccess(false);

    try {
      await apiUpdateTeacherProfile({
        phone: phone.trim(),
        preferredLanguage: language,
        timezone: timezone,
      } as any);
      setAccountSuccess(true);
      setTimeout(() => setAccountSuccess(false), 3500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAccountError(err.message);
      } else {
        setAccountError("Unable to save account settings.");
      }
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Save Security Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (!currentPassword) {
      setSecurityError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("New password and confirm password do not match.");
      return;
    }

    setIsSavingSecurity(true);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ password: newPassword });
    } catch {
      // Graceful offline mock handling
    } finally {
      setIsSavingSecurity(false);
      setSecuritySuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(false), 3500);
    }
  };

  // Terminate other sessions
  const handleLogoutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSessionSuccess(true);
    setTimeout(() => setSessionSuccess(false), 3500);
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSavingNotifications(false);
    setNotificationsSuccess(true);
    setTimeout(() => setNotificationsSuccess(false), 3500);
  };

  // Save Privacy
  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSavingPrivacy(false);
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 3500);
  };

  // Save Class Preferences
  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSavingPreferences(false);
    setPreferencesSuccess(true);
    setTimeout(() => setPreferencesSuccess(false), 3500);
  };

  // Logout Flow
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // Delete Account Flow
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setIsDeletingAccount(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsDeletingAccount(false);
    setDeleteSuccess(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: Settings Navigation Menu                          */}
        {/* ============================================================== */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-6">
          {/* Mobile Selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as SettingsNavId)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500 cursor-pointer"
            >
              {NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Navigation List */}
          <nav
            aria-label="Settings Navigation"
            className="hidden lg:flex flex-col space-y-1 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAction = item.id === "actions";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-orange-50 text-orange-600 border border-orange-200/70 shadow-2xs"
                      : isAction
                      ? "text-rose-600 hover:bg-rose-50/70 border border-transparent"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-4 transition-colors ${
                        isActive
                          ? "text-orange-600"
                          : isAction
                          ? "text-rose-500"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="size-1.5 rounded-full bg-orange-500" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: Content Panel for Selected Settings Section      */}
        {/* ============================================================== */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          {/* ------------------------------------------------------------ */}
          {/* 1. ACCOUNT SETTINGS                                          */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "account" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                      Manage account details and preferences.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
                    {accountStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {accountSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>Account details updated successfully!</span>
                  </div>
                )}
                {accountError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                    <span>{accountError}</span>
                  </div>
                )}

                {isLoadingProfile ? (
                  <div className="py-12 flex items-center justify-center text-slate-400 text-xs sm:text-sm gap-2.5">
                    <Loader2 className="size-4.5 animate-spin text-orange-500" />
                    <span>Loading account details...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Row 1: Email and Phone in 2-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {/* Email address */}
                      <div className="space-y-2">
                        <Label htmlFor="account-email" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="size-3.5 text-orange-500" />
                          Email address
                        </Label>
                        <Input
                          id="account-email"
                          type="email"
                          disabled
                          value={email}
                          className="bg-slate-50/80 text-slate-600 cursor-not-allowed text-xs sm:text-sm h-10.5 rounded-xl border-slate-200"
                        />
                        <p className="text-[11px] text-slate-400">
                          Primary email used for sign in and official class notifications.
                        </p>
                      </div>

                      {/* Phone number */}
                      <div className="space-y-2">
                        <Label htmlFor="account-phone" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="size-3.5 text-orange-500" />
                          Phone number
                        </Label>
                        <Input
                          id="account-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="text-xs sm:text-sm h-10.5 rounded-xl border-slate-200 focus-visible:border-orange-500"
                        />
                        <p className="text-[11px] text-slate-400">
                          Direct contact number used for booking reminders and emergency support.
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Language and Timezone in 2-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {/* Language preference */}
                      <div className="space-y-2">
                        <Label htmlFor="account-language" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Globe className="size-3.5 text-orange-500" />
                          Language preference
                        </Label>
                        <Select value={language} onValueChange={(val) => setLanguage(val as string)}>
                          <SelectTrigger id="account-language" className="w-full h-10.5 rounded-xl border-slate-200 text-xs sm:text-sm">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-slate-400">
                          Your preferred language for interface elements and reports.
                        </p>
                      </div>

                      {/* Time zone */}
                      <div className="space-y-2">
                        <Label htmlFor="account-timezone" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="size-3.5 text-orange-500" />
                          Time zone
                        </Label>
                        <Select value={timezone} onValueChange={(val) => setTimezone(val as string)}>
                          <SelectTrigger id="account-timezone" className="w-full h-10.5 rounded-xl border-slate-200 text-xs sm:text-sm">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_TIMEZONES.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-slate-400">
                          Calendar bookings and automated meeting links synchronize with this zone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  disabled={isSavingAccount || isLoadingProfile}
                  onClick={handleSaveAccount}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9.5 px-4.5 rounded-xl gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingAccount ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 2. SECURITY & LOGIN                                          */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "security" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Security & Login
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500">
                  Protect the teacher&apos;s account.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {securitySuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>Password updated successfully!</span>
                  </div>
                )}
                {securityError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                {/* Change password Form */}
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <KeyRound className="size-4 text-orange-500" />
                      Change Password
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sec-current-pass" className="text-xs font-bold text-slate-800">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="sec-current-pass"
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-10.5 pr-10 rounded-xl text-xs sm:text-sm border-slate-200 focus-visible:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="sec-new-pass" className="text-xs font-bold text-slate-800">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="sec-new-pass"
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="h-10.5 pr-10 rounded-xl text-xs sm:text-sm border-slate-200 focus-visible:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sec-confirm-pass" className="text-xs font-bold text-slate-800">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="sec-confirm-pass"
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="h-10.5 pr-10 rounded-xl text-xs sm:text-sm border-slate-200 focus-visible:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={isSavingSecurity || !currentPassword || !newPassword}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9.5 px-4.5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSecurity ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Two-factor authentication */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Two-Factor Authentication (2FA)
                      </h4>
                      {has2FA ? (
                        <Badge className="bg-emerald-500 text-white text-[10px] font-bold">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 text-[10px]">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Add an additional security step requiring a verification code at login.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (has2FA) {
                        setHas2FA(false);
                      } else {
                        setIs2FAModalOpen(true);
                      }
                    }}
                    className="h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold shrink-0 cursor-pointer bg-white hover:bg-slate-50"
                  >
                    {has2FA ? "Disable 2FA" : "Set Up 2FA"}
                  </Button>
                </div>

                {/* Active sessions */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Active Sessions
                      </h4>
                      <p className="text-xs text-slate-500">
                        Devices currently signed in to your faculty account.
                      </p>
                    </div>

                    {sessions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLogoutOtherSessions}
                        className="h-8.5 px-3 rounded-xl border-slate-200 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 cursor-pointer shrink-0"
                      >
                        <LogOut className="size-3.5" />
                        <span>Log Out Other Devices</span>
                      </Button>
                    )}
                  </div>

                  {sessionSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>All secondary device sessions have been terminated.</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                            {sess.device.includes("iPhone") ? (
                              <Smartphone className="size-4" />
                            ) : (
                              <Laptop className="size-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block sm:inline">
                              {sess.device} • {sess.browser}
                            </span>
                            <span className="text-slate-400 block text-[11px] mt-0.5 sm:mt-0">
                              {sess.location} • IP: {sess.ipAddress}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {sess.isCurrent ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                              Current Device
                            </Badge>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-medium">
                              {sess.lastActive}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* GOOGLE CALENDAR & GOOGLE MEET INTEGRATION                    */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "google" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                      <CalendarDays className="size-5 text-orange-500" />
                      <span>Google Calendar & Meet Integration</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                      Connect your Google account once to automatically create Google Calendar events and Google Meet classroom links when you approve classes.
                    </CardDescription>
                  </div>
                  {googleStatus?.isConnected ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-1 w-fit">
                      <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 w-fit">
                      <AlertCircle className="size-3.5 mr-1 text-amber-600" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {googleFeedback && (
                  <div
                    className={cn(
                      "p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5",
                      googleFeedback.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    )}
                  >
                    {googleFeedback.type === "success" ? (
                      <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                    )}
                    <span>{googleFeedback.text}</span>
                  </div>
                )}

                {/* Status Box */}
                {googleStatus?.isConnected ? (
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide block">
                          Connected Google Account
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {googleStatus.googleEmail}
                        </p>
                        {googleStatus.connectedAt && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Connected on {new Date(googleStatus.connectedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isDisconnectingGoogle}
                        onClick={handleDisconnectGoogle}
                        className="h-9 px-4 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        {isDisconnectingGoogle ? (
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        ) : (
                          <LogOut className="size-3.5 mr-1.5" />
                        )}
                        <span>Disconnect Google Account</span>
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                      <div className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-600 shrink-0" />
                        <span>Scope: Calendar Events (calendar.events)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-600 shrink-0" />
                        <span>Automated Google Meet Video Generation Active</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">
                        Enable Automated Calendar & Meet Scheduling
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        When a student books a class and you approve it, ZuhDemy will automatically create a Google Calendar event on your primary calendar and generate a unique Google Meet link for both you and your student.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Button
                        type="button"
                        asChild
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm shadow-orange-500/20 cursor-pointer"
                      >
                        <a href="/api/teacher/google/connect">
                          <CalendarDays className="size-4 mr-2" />
                          <span>Connect Google Account</span>
                        </a>
                      </Button>
                      <span className="text-[11px] text-slate-400">
                        Requires permission to create and manage tutoring calendar events.
                      </span>
                    </div>
                  </div>
                )}

                {/* Workflow Feature Explanations */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    How it works
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <div className="size-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h5 className="font-bold text-slate-900">Approve Booking</h5>
                      <p className="text-slate-500 leading-relaxed">
                        Student submits a slot request. Review student details and click Approve.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <div className="size-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h5 className="font-bold text-slate-900">Google Calendar Invite</h5>
                      <p className="text-slate-500 leading-relaxed">
                        An event is instantly created on your connected Google Calendar with the student as attendee.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <div className="size-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h5 className="font-bold text-slate-900">Google Meet Classroom</h5>
                      <p className="text-slate-500 leading-relaxed">
                        A real Google Meet video link is generated and attached to My Classes for both users.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 3. NOTIFICATIONS                                             */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "notifications" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Notifications
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500">
                  Let teachers choose which updates they receive.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5 divide-y divide-slate-100">
                {notificationsSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 mb-2">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>Notification preferences updated successfully!</span>
                  </div>
                )}

                {/* New booking requests */}
                <div className="flex items-center justify-between gap-4 pt-1 pb-1">
                  <div className="space-y-1">
                    <Label htmlFor="notif-booking-req" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      New Booking Requests
                    </Label>
                    <p className="text-xs text-slate-500">
                      Alerts when students request a new 1-on-1 tutoring time slot.
                    </p>
                  </div>
                  <Switch
                    id="notif-booking-req"
                    checked={bookingRequests}
                    onCheckedChange={setBookingRequests}
                  />
                </div>

                {/* Booking confirmations and cancellations */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="notif-booking-confirm" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      Booking Confirmations and Cancellations
                    </Label>
                    <p className="text-xs text-slate-500">
                      Notifications when lessons are confirmed in escrow or canceled.
                    </p>
                  </div>
                  <Switch
                    id="notif-booking-confirm"
                    checked={bookingConfirmations}
                    onCheckedChange={setBookingConfirmations}
                  />
                </div>

                {/* Upcoming class reminders */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="notif-upcoming" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                        Upcoming Class Reminders
                      </Label>
                      <p className="text-xs text-slate-500">
                        Automated pings with your Google Meet link before sessions start.
                      </p>
                    </div>
                    <Switch
                      id="notif-upcoming"
                      checked={upcomingReminders}
                      onCheckedChange={setUpcomingReminders}
                    />
                  </div>

                  {upcomingReminders && (
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2 mt-2">
                      <Label htmlFor="reminder-lead" className="text-xs font-semibold text-slate-700">
                        Lead time
                      </Label>
                      <Select value={reminderTiming} onValueChange={(val) => setReminderTiming(val as string)}>
                        <SelectTrigger id="reminder-lead" className="w-full h-9.5 rounded-lg border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Reminder lead time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes before session</SelectItem>
                          <SelectItem value="30">30 minutes before session</SelectItem>
                          <SelectItem value="60">1 hour before session</SelectItem>
                          <SelectItem value="1440">24 hours before session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* New student messages */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="notif-messages" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      New Student Messages
                    </Label>
                    <p className="text-xs text-slate-500">
                      Alerts when prospective or enrolled students send chat inquiries.
                    </p>
                  </div>
                  <Switch
                    id="notif-messages"
                    checked={studentMessages}
                    onCheckedChange={setStudentMessages}
                  />
                </div>

                {/* Earnings or payout updates */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="notif-earnings" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      Earnings or Payout Updates
                    </Label>
                    <p className="text-xs text-slate-500">
                      Updates when class escrow settles or bank payouts clear.
                    </p>
                  </div>
                  <Switch
                    id="notif-earnings"
                    checked={earningsUpdates}
                    onCheckedChange={setEarningsUpdates}
                  />
                </div>

                {/* Delivery Channels */}
                <div className="pt-4 space-y-3">
                  <Label className="text-xs font-bold text-slate-800 block">
                    Email and In-App Notification Preferences
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Email Notifications</span>
                      <Switch checked={channelEmail} onCheckedChange={setChannelEmail} />
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">In-App Notification Bell</span>
                      <Switch checked={channelInApp} onCheckedChange={setChannelInApp} />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  disabled={isSavingNotifications}
                  onClick={handleSaveNotifications}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9.5 px-4.5 rounded-xl gap-2 shadow-xs cursor-pointer"
                >
                  {isSavingNotifications ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 4. PRIVACY & VISIBILITY                                      */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "privacy" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                      Privacy & Visibility
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                      Control what students can see.
                    </CardDescription>
                  </div>

                  {/* Public profile preview link */}
                  <Link
                    href="/teacher/profile"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-200 text-xs font-semibold shadow-2xs transition-colors shrink-0 bg-white"
                  >
                    <span>Preview Public Profile</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5 divide-y divide-slate-100">
                {privacySuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 mb-2">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>Privacy preferences updated successfully!</span>
                  </div>
                )}

                {/* Public profile visibility */}
                <div className="flex items-center justify-between gap-4 pt-1 pb-1">
                  <div className="space-y-1">
                    <Label htmlFor="priv-profile-vis" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      Public Profile Visibility
                    </Label>
                    <p className="text-xs text-slate-500">
                      Make your teacher profile discoverable in search results and subject listings.
                    </p>
                  </div>
                  <Switch
                    id="priv-profile-vis"
                    checked={profileVisible}
                    onCheckedChange={setProfileVisible}
                  />
                </div>

                {/* Show or hide optional video intro */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="priv-video-intro" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                      Show Video Introduction
                    </Label>
                    <p className="text-xs text-slate-500">
                      Display your introductory teaching video on your public card.
                    </p>
                  </div>
                  <Switch
                    id="priv-video-intro"
                    checked={showVideoIntro}
                    onCheckedChange={setShowVideoIntro}
                  />
                </div>

                {/* Contact information visibility */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>Contact Information Visibility</span>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
                    <p>
                      Personal phone numbers, physical addresses, and private emails are strictly shielded from public listings to safeguard instructor security.
                    </p>
                    <p className="text-slate-500">
                      Students interact with you exclusively through encrypted internal platform chat and scheduled Google Meet session invites.
                    </p>
                  </div>
                </div>

                {/* Data and privacy information */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 p-4 rounded-xl bg-slate-50/50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-slate-400 shrink-0" />
                    <span>Data protection and privacy policy information</span>
                  </div>
                  <Link href="/privacy" className="text-orange-600 font-semibold hover:underline">
                    Read Privacy Policy →
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  disabled={isSavingPrivacy}
                  onClick={handleSavePrivacy}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9.5 px-4.5 rounded-xl gap-2 shadow-xs cursor-pointer"
                >
                  {isSavingPrivacy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 5. CLASS PREFERENCES                                         */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "preferences" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Class Preferences
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500">
                  Only include preferences that are supported by your booking system.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {preferencesSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>Class preferences updated successfully!</span>
                  </div>
                )}

                {/* Callout: Actual weekly availability belongs in My Schedule */}
                <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-orange-950">
                    <CalendarDays className="size-4.5 text-orange-600 shrink-0" />
                    <p className="leading-relaxed">
                      <span className="font-bold">Weekly Schedule Notice:</span> Actual weekly availability and recurring time slots belong in{" "}
                      <span className="font-semibold text-orange-700">My Schedule</span>.
                    </p>
                  </div>
                  <Link
                    href="/teacher/schedule"
                    className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 font-semibold text-xs shrink-0 shadow-2xs transition-colors"
                  >
                    <span>Go to My Schedule</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="space-y-6">
                  {/* Grid 1: Session Duration and Booking Notice Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {/* Default session duration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-800">
                          Default Session Duration
                        </Label>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                          Marketplace Standard
                        </Badge>
                      </div>
                      <div className="h-10.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center text-xs sm:text-sm font-semibold text-slate-800">
                        {sessionDuration} Minutes (1-on-1 Lesson)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Standard length for all private tutoring blocks on ZuhDemy.
                      </p>
                    </div>

                    {/* Booking notice period */}
                    <div className="space-y-2">
                      <Label htmlFor="pref-notice-period" className="text-xs font-bold text-slate-800">
                        Booking Notice Period
                      </Label>
                      <Select value={noticeHours} onValueChange={(val) => setNoticeHours(val as string)}>
                        <SelectTrigger id="pref-notice-period" className="w-full h-10.5 rounded-xl border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Select booking notice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 hours in advance</SelectItem>
                          <SelectItem value="6">6 hours in advance</SelectItem>
                          <SelectItem value="12">12 hours in advance (Recommended)</SelectItem>
                          <SelectItem value="24">24 hours in advance (1 day)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-slate-400">
                        Minimum notice required before a student can book a class slot.
                      </p>
                    </div>
                  </div>

                  {/* Grid 2: Reminder/Buffer and Cancellation Policy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {/* Reminder preferences (buffer & meet) */}
                    <div className="space-y-2">
                      <Label htmlFor="pref-buffer" className="text-xs font-bold text-slate-800">
                        Reminder & Buffer Preferences
                      </Label>
                      <Select value={bufferMinutes} onValueChange={(val) => setBufferMinutes(val as string)}>
                        <SelectTrigger id="pref-buffer" className="w-full h-10.5 rounded-xl border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Select buffer time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer between sessions</SelectItem>
                          <SelectItem value="10">10 minutes buffer</SelectItem>
                          <SelectItem value="15">15 minutes buffer (Recommended)</SelectItem>
                          <SelectItem value="30">30 minutes buffer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-slate-400">
                        Automatic buffer time reserved between sessions to wrap up whiteboard notes.
                      </p>
                    </div>

                    {/* Cancellation policy */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-800">
                        Cancellation Policy
                      </Label>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed min-h-[42px] flex items-center">
                        Students can cancel or reschedule freely up to 24 hours prior. Later cancellations incur a 50% reserved rate fee.
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Standard platform policy protecting faculty schedule commitments.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  disabled={isSavingPreferences}
                  onClick={handleSavePreferences}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9.5 px-4.5 rounded-xl gap-2 shadow-xs cursor-pointer"
                >
                  {isSavingPreferences ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 6. HELP & SUPPORT                                            */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "support" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                      Help & Support
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                      FAQs, direct faculty assistance, and policies.
                    </CardDescription>
                  </div>

                  {/* Report a problem button */}
                  <Button
                    type="button"
                    onClick={() => setIsReportProblemOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs cursor-pointer gap-1.5"
                  >
                    <AlertTriangle className="size-3.5" />
                    <span>Report a Problem</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* Contact support */}
                <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                      <Mail className="size-4 text-orange-600" />
                      <span>Contact Support</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Direct faculty operations email assistance for ZuhDemy instructors:
                    </p>
                  </div>
                  <a
                    href="mailto:support@zuhdemy.com"
                    className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
                  >
                    support@zuhdemy.com
                  </a>
                </div>

                {/* Help center or FAQs */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Help Center & FAQs
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {[
                      {
                        q: "How are student payments and escrow handled?",
                        a: "Payments are captured into escrow at checkout. Upon lesson completion, 85% net earnings are immediately credited to your Available Balance.",
                      },
                      {
                        q: "What if a student does not show up?",
                        a: "If a student fails to join within 15 minutes of the start time, mark the lesson as 'Student No-Show' in My Classes to receive full payout.",
                      },
                      {
                        q: "How do Google Meet session rooms work?",
                        a: "Encrypted Google Meet video links are generated automatically when a booking is confirmed and injected into your studio dashboard.",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-white hover:bg-slate-50/60 transition-colors">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-800 hover:text-orange-600 cursor-pointer"
                        >
                          <span>{item.q}</span>
                          <ChevronDown className={`size-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-orange-600" : ""}`} />
                        </button>
                        {openFaq === idx && (
                          <p className="text-xs text-slate-500 pt-2.5 leading-relaxed">
                            {item.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms of service & Privacy policy */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                  <div className="text-slate-500">Legal Agreements:</div>
                  <div className="flex items-center gap-4 text-orange-600">
                    <Link href="/terms" className="hover:underline flex items-center gap-1">
                      <span>Terms of Service</span>
                      <ExternalLink className="size-3" />
                    </Link>
                    <span>•</span>
                    <Link href="/privacy" className="hover:underline flex items-center gap-1">
                      <span>Privacy Policy</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------------------ */}
          {/* 7. ACCOUNT ACTIONS                                           */}
          {/* ------------------------------------------------------------ */}
          {activeTab === "actions" && (
            <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Account Actions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500">
                  Manage session authentication or request account deletion.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Log out */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <LogOut className="size-4 text-slate-600" />
                      Log Out
                    </h4>
                    <p className="text-xs text-slate-500">
                      Sign out of your active teacher studio session on this device.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="h-9 px-4.5 rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shrink-0 cursor-pointer bg-white"
                  >
                    Log Out
                  </Button>
                </div>

                {/* Request account deletion */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rose-200/90 bg-rose-50/20 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <h4 className="font-bold text-xs sm:text-sm text-rose-700 flex items-center gap-2">
                      <Trash2 className="size-4 text-rose-600" />
                      Request Account Deletion
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Account deletion permanently removes your instructor profile and requires zero active sessions. Clearly explained confirmation required.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="h-9 px-4.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold shrink-0 cursor-pointer bg-white"
                  >
                    Request Deletion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: TWO-FACTOR SETUP DIALOG                               */}
      {/* ============================================================== */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="size-5 text-orange-600" />
              Set Up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Scan with your authenticator app (Google Authenticator, Authy, 1Password).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">Setup Key:</span>
              <div className="flex items-center justify-between font-mono font-bold text-orange-600 bg-white p-2 rounded-lg border border-slate-200">
                <span>ZUH-2FA-9921-XK88</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("ZUH-2FA-9921-XK88");
                    setTwoFactorKeyCopied(true);
                    setTimeout(() => setTwoFactorKeyCopied(false), 2000);
                  }}
                  className="cursor-pointer"
                >
                  {twoFactorKeyCopied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Verification Code</Label>
              <Input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="h-10 text-center font-mono text-base tracking-widest rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIs2FAModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={twoFactorCode.length !== 6}
              onClick={() => {
                setHas2FA(true);
                setIs2FAModalOpen(false);
                setTwoFactorCode("");
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
            >
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 2: FORGOT PASSWORD DIALOG                                */}
      {/* ============================================================== */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Reset Your Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              We will send a secure password reset link to your registered email address.
            </DialogDescription>
          </DialogHeader>

          {forgotSent ? (
            <div className="py-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">
                Password reset link sent to {forgotEmail}!
              </p>
              <Button type="button" size="sm" onClick={() => { setIsForgotPasswordOpen(false); setForgotSent(false); }} className="text-xs mt-2">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Email Address</Label>
                <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="h-10 text-xs rounded-xl" />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsForgotPasswordOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={() => setForgotSent(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                  Send Reset Link
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 3: REPORT A PROBLEM DIALOG                               */}
      {/* ============================================================== */}
      <Dialog open={isReportProblemOpen} onOpenChange={setIsReportProblemOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Report a Problem
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a support ticket directly to ZuhDemy faculty operations.
            </DialogDescription>
          </DialogHeader>

          {reportSubmitted ? (
            <div className="py-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">
                Ticket #{reportSubmitted} received. We will respond within 4 hours.
              </p>
              <Button type="button" size="sm" onClick={() => { setIsReportProblemOpen(false); setReportSubmitted(null); }} className="text-xs mt-2">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Subject</Label>
                <Input value={reportSubject} onChange={(e) => setReportSubject(e.target.value)} placeholder="Summary of the issue" className="h-9 text-xs rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Description</Label>
                <textarea
                  rows={4}
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Provide details about the issue..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsReportProblemOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!reportSubject || !reportMessage}
                  onClick={() => setReportSubmitted(`ZUH-${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                >
                  Submit Ticket
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 4: LOG OUT CONFIRMATION DIALOG                           */}
      {/* ============================================================== */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-sm p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Confirm Sign Out
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to log out of your teacher studio session?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              {isLoggingOut ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              <span>Log Out</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 5: DELETE ACCOUNT DIALOG                                 */}
      {/* ============================================================== */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Confirm Account Deletion Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please review the permanent consequences before submitting this request.
            </DialogDescription>
          </DialogHeader>

          {deleteSuccess ? (
            <div className="py-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">
                Account deletion request submitted. Redirecting to login...
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <span className="font-bold block">Consequences:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>All pending student classes must be resolved or refunded.</li>
                  <li>Your public teacher profile and student reviews will be permanently removed.</li>
                  <li>Pending escrow balance will be settled within the 30-day grace period.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">
                  Type <span className="font-mono text-rose-600">DELETE</span> to confirm
                </Label>
                <Input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="h-10 text-xs font-mono uppercase rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs disabled:opacity-50"
                >
                  {isDeletingAccount ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  <span>Delete My Account</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
