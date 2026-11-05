import React, { Suspense } from "react";
import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Your Profile | ZuhDemy Learning Studio",
  description:
    "Set up your academic goals, preferred subjects, and contact information to personalize your ZuhDemy experience.",
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm font-medium">Loading setup wizard...</p>
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
