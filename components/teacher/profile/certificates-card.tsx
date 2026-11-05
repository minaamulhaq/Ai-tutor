"use client";

import React, { useState } from "react";
import { Award, Plus, Trash2, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TeacherProfileData, CertificateEntry } from "./types";

interface CertificatesCardProps {
  profile: TeacherProfileData;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function CertificatesCard({ profile, onChange }: CertificatesCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const openAdd = () => {
    setTitle("");
    setIssuer("");
    setYear(new Date().getFullYear().toString());
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !issuer.trim()) return;

    const newCert: CertificateEntry = {
      id: `cert-${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim(),
      year: year.trim(),
      isVerified: true,
    };

    onChange({ certificates: [...profile.certificates, newCert] });
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onChange({
      certificates: profile.certificates.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Dropdown / Collapsible Header */}
      <div className="p-6 sm:p-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer group flex-1 select-none"
          aria-expanded={isOpen}
        >
          <div className="size-9 sm:size-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <Award className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                Licenses & Certifications
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profile.certificates.length} {profile.certificates.length === 1 ? "credential" : "credentials"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Verified teaching licenses and professional accreditations.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openAdd}
            className="h-8 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 text-slate-700 hover:text-orange-600 hover:border-orange-200 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`size-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all cursor-pointer ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-label="Toggle section"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-7 sm:px-8 sm:pb-8 pt-0 space-y-4 border-t border-slate-100 animate-in fade-in-50 duration-150">
          <div className="pt-6">
            {profile.certificates.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2.5">
                <Award className="size-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No certificates or licenses added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openAdd}
                  className="text-xs h-7.5 px-3 rounded-lg"
                >
                  Add First Certificate
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {profile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {cert.title}
                        </h5>
                        {cert.isVerified && (
                          <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{cert.issuer}</p>
                      <span className="text-[11px] text-slate-400">Issued: {cert.year}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(cert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      aria-label="Delete certificate"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Verified Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Upload or declare verified professional accreditations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Certificate Name *</Label>
              <Input
                placeholder="e.g. Certified Online Educator (COE)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Issuing Organization *</Label>
              <Input
                placeholder="e.g. National Tutoring Association"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Year Issued</Label>
              <Input
                placeholder="e.g. 2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim() || !issuer.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
            >
              Save Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
