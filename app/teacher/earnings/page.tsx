import React from "react";
import { Metadata } from "next";
import { TeacherEarningsView } from "@/components/teacher/earnings/earnings-view";

export const metadata: Metadata = {
  title: "Earnings & Payouts | ZuhDemy Teacher Studio",
  description:
    "Track your class revenue, platform commissions, available balance, and manage secure payout withdrawals on ZuhDemy.",
};

export default function TeacherEarningsPage() {
  return <TeacherEarningsView />;
}
