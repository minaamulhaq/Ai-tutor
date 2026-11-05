"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  Shield,
  Bell,
  Lock,
  CreditCard,
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StudentSettingsNavId,
  StudentSettingsState,
} from "./types";
import {
  apiFetchStudentSettings,
  apiUpdateStudentSettings,
  apiResetStudentSettings,
} from "./student-settings-service";
import { AccountSection } from "./sections/account-section";
import { SecuritySection } from "./sections/security-section";
import { NotificationsSection } from "./sections/notifications-section";
import { PrivacySection } from "./sections/privacy-section";
import { BillingSection } from "./sections/billing-section";
import { DangerZoneSection } from "./sections/danger-zone-section";

interface NavItem {
  id: StudentSettingsNavId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "account",
    label: "Account & Profile",
    description: "Personal credentials, email & timezone",
    icon: User,
  },
  {
    id: "security",
    label: "Security & Login",
    description: "Password, 2FA & active sessions",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Class Alerts & Notice",
    description: "WhatsApp, email reminders & timing",
    icon: Bell,
  },
  {
    id: "privacy",
    label: "Privacy & Visibility",
    description: "Profile visibility & tutor messaging",
    icon: Lock,
  },
  {
    id: "billing",
    label: "Payment & Currency",
    description: "Preferred currency, payment method & invoices",
    icon: CreditCard,
  },
  {
    id: "danger",
    label: "Data & Danger Zone",
    description: "Export learning data or pause account",
    icon: AlertTriangle,
  },
];

export function StudentSettingsView() {
  const [activeTab, setActiveTab] = useState<StudentSettingsNavId>("account");
  const [initialData, setInitialData] = useState<StudentSettingsState | null>(null);
  const [settings, setSettings] = useState<StudentSettingsState | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load initial settings
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetchStudentSettings();
      setInitialData(data);
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setSaveError("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Dirty tracking
  const isDirty = useMemo(() => {
    if (!initialData || !settings) return false;
    return JSON.stringify(initialData) !== JSON.stringify(settings);
  }, [initialData, settings]);

  // Warn before browser unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Field change handler
  const handleFieldChange = useCallback(
    <K extends keyof StudentSettingsState>(key: K, value: StudentSettingsState[K]) => {
      setSettings((prev) => {
        if (!prev) return prev;
        return { ...prev, [key]: value };
      });
      setSaveSuccess(false);
      setSaveError(null);
    },
    []
  );

  // Save changes
  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      setSaveError(null);
      const updated = await apiUpdateStudentSettings(settings);
      setSettings(updated);
      setInitialData(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (initialData) {
      setSettings(JSON.parse(JSON.stringify(initialData)));
      setSaveError(null);
      setSaveSuccess(false);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset student settings back to demo defaults?")
    ) {
      return;
    }
    try {
      setIsLoading(true);
      const defaults = await apiResetStudentSettings();
      setInitialData(defaults);
      setSettings(defaults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 rounded-2xl bg-slate-100" />
          <div className="lg:col-span-8 h-96 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 relative">
      {/* Save Success / Error Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>Settings saved successfully! Changes are updated across your student account.</span>
          </div>
          <Badge className="bg-emerald-600 text-white text-xs">Updated</Badge>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <AlertCircle className="size-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Clean Header Bar (NO BG PICTURE) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Settings
            </h1>
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-semibold">
              <Sparkles className="size-3 mr-1" /> Student Studio
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your account security, class notification alerts, privacy, and billing preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs h-9 px-3.5 cursor-pointer"
            title="Reset settings to defaults"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs h-9 px-4 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two Column Layout: Navigation on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-1.5">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
            Settings Categories
          </span>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-50/80 text-orange-950 border border-orange-200 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold ${
                      isActive ? "text-orange-900" : "text-slate-800"
                    }`}
                  >
                    {item.label}
                  </div>
                  <p className="text-2xs text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "account" && (
            <AccountSection settings={settings} onChange={handleFieldChange} />
          )}

          {activeTab === "security" && (
            <SecuritySection settings={settings} onChange={handleFieldChange} />
          )}

          {activeTab === "notifications" && (
            <NotificationsSection
              settings={settings}
              onChange={handleFieldChange}
            />
          )}

          {activeTab === "privacy" && (
            <PrivacySection settings={settings} onChange={handleFieldChange} />
          )}

          {activeTab === "billing" && (
            <BillingSection settings={settings} onChange={handleFieldChange} />
          )}

          {activeTab === "danger" && (
            <DangerZoneSection settings={settings} />
          )}
        </div>
      </div>

      {/* Floating Save Bar when dirty */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Unsaved Settings Changes</p>
              <p className="text-2xs text-slate-400">
                You have modified your student preferences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={isSaving}
              className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9 cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Discard
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
