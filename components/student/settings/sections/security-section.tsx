"use client";

import React, { useState } from "react";
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSettingsState, ActiveSession } from "../types";

interface SecuritySectionProps {
  settings: StudentSettingsState;
  onChange: <K extends keyof StudentSettingsState>(
    key: K,
    value: StudentSettingsState[K]
  ) => void;
}

export function SecuritySection({ settings, onChange }: SecuritySectionProps) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    }, 600);
  };

  const handleRevokeSession = (sessionId: string) => {
    const updated = settings.sessions.filter((s) => s.id !== sessionId);
    onChange("sessions", updated);
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <KeyRound className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">
              Ensure your account uses a secure password with letters, numbers, and symbols.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Current Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="rounded-xl border-slate-200 h-10 text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">New Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Confirm Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs h-9 px-4 cursor-pointer disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h2>
            <p className="text-xs text-slate-500">
              Add an additional layer of security to prevent unauthorized access.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/90 bg-slate-50/70">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Enable Two-Factor Authentication
            </span>
            <span className="text-xs text-slate-500">
              Require a verification code when signing in from an unrecognized browser or device.
            </span>
          </div>
          <Switch
            checked={settings.twoFactorEnabled}
            onCheckedChange={(val) => onChange("twoFactorEnabled", val)}
          />
        </div>

        {settings.twoFactorEnabled && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
            <Label className="text-xs font-semibold text-slate-700 block">
              Verification Method
            </Label>
            <Select
              value={settings.twoFactorMethod}
              onValueChange={(val: "sms" | "authenticator") => onChange("twoFactorMethod", val)}
            >
              <SelectTrigger className="w-64 rounded-xl border-purple-200 bg-white h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS to {settings.phone || "registered number"}</SelectItem>
                <SelectItem value="authenticator">Authenticator App (Google / Microsoft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Active Device Sessions Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Laptop className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Login Sessions</h2>
              <p className="text-xs text-slate-500">
                Browsers and devices currently logged into your ZuhDemy account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {settings.sessions.map((sess) => (
            <div
              key={sess.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  {sess.device.includes("Phone") ? (
                    <Smartphone className="size-4" />
                  ) : (
                    <Laptop className="size-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sess.device}</span>
                    {sess.isCurrent && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none text-3xs font-semibold px-1.5 py-0">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    {sess.browser} • {sess.location} ({sess.ipAddress}) • {sess.lastActive}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="rounded-xl border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs h-8 px-3 cursor-pointer self-end sm:self-center"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
