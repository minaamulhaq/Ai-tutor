"use client";

import React from "react";
import {
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  HeartHandshake,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StudentProfileData,
  StudentProfileErrors,
} from "./types";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface GuardianContactTabProps {
  profile: StudentProfileData;
  errors: StudentProfileErrors;
  onUpdateField: <K extends keyof StudentProfileData>(
    field: K,
    value: StudentProfileData[K]
  ) => void;
  onSaveProfile?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function GuardianContactTab({
  profile,
  errors,
  onUpdateField,
  onSaveProfile,
  isSaving = false,
  hasChanges = false,
}: GuardianContactTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Parent / Guardian Information</h2>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Recommended for students under 18 for safety, attendance updates, and billing receipts.
              </p>
            </div>
          </div>

          {hasChanges && onSaveProfile && (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-4 gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-center disabled:opacity-50 animate-in fade-in zoom-in-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Guardian Info</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Guardian Full Name */}
          <div className="space-y-2">
            <Label htmlFor="guardianName" className="text-xs font-semibold text-slate-700">
              Parent / Guardian Full Name
            </Label>
            <div className="relative">
              <UserCheck className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="guardianName"
                value={profile.guardianName || ""}
                onChange={(e) => onUpdateField("guardianName", e.target.value)}
                placeholder="e.g. Tariq Jenkins"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-xs font-semibold text-slate-700">
              Relationship
            </Label>
            <Select
              value={profile.guardianRelationship || "Father"}
              onValueChange={(val) => onUpdateField("guardianRelationship", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm">
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                <SelectItem value="Elder Sibling">Elder Sibling</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Guardian Phone */}
          <div className="space-y-2">
            <Label htmlFor="guardianPhone" className="text-xs font-semibold text-slate-700">
              Guardian Phone / WhatsApp Number
            </Label>
            <div className="relative">
              <Phone className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="guardianPhone"
                value={profile.guardianPhone || ""}
                onChange={(e) => onUpdateField("guardianPhone", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>

          {/* Guardian Email */}
          <div className="space-y-2">
            <Label htmlFor="guardianEmail" className="text-xs font-semibold text-slate-700">
              Guardian Email Address
            </Label>
            <div className="relative">
              <Mail className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="guardianEmail"
                type="email"
                value={profile.guardianEmail || ""}
                onChange={(e) => onUpdateField("guardianEmail", e.target.value)}
                placeholder="guardian@example.com"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Toggle */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-emerald-50/50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Designate as Primary Emergency Contact
                </span>
                <span className="text-xs text-slate-600">
                  ZuhDemy academic operations will call this number in case of urgent class reschedules or emergencies.
                </span>
              </div>
            </div>
            <Switch
              checked={profile.isEmergencyContact ?? false}
              onCheckedChange={(val) => onUpdateField("isEmergencyContact", val)}
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
          <AlertCircle className="size-4 text-slate-400 mt-0.5 shrink-0" />
          <span>
            <strong>Student Safety Guarantee:</strong> Guardian information is kept strictly confidential and only accessed by verified ZuhDemy safety managers and assigned lead tutors when required.
          </span>
        </div>

        {/* Bottom Save Action - Only shown when changes happen */}
        {hasChanges && onSaveProfile && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end animate-in fade-in">
            <Button
              type="button"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-10 px-5 gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Guardian Details</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
