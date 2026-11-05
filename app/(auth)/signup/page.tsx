import React, { Suspense } from "react";
import { Metadata } from "next";
import { SignupView } from "@/components/auth/signup-view";

export const metadata: Metadata = {
  title: "Sign Up | ZuhDemy Learning Studio",
  description:
    "Create your ZuhDemy account to unlock personalized 1-on-1 tutoring, expert instructors, and flexible learning schedules.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupView />
    </Suspense>
  );
}
