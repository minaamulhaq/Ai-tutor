"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Heart, Star, ShieldCheck, DollarSign, Clock } from "lucide-react";
import { Teacher } from "@/types/teacher";

interface FavoriteStatsProps {
  favorites: Teacher[];
}

export function FavoriteStats({ favorites }: FavoriteStatsProps) {
  const totalCount = favorites.length;

  const verifiedCount = favorites.filter((t) => t.isVerified).length;

  const validRatings = favorites.filter((t) => typeof t.rating === "number" && t.rating > 0);
  const avgRating =
    validRatings.length > 0
      ? (validRatings.reduce((acc, t) => acc + (t.rating || 0), 0) / validRatings.length).toFixed(1)
      : "5.0";

  const rates = favorites.map((t) => t.hourlyRate).filter(Boolean);
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
  const priceDisplay =
    rates.length === 0
      ? "—"
      : minRate === maxRate
      ? `PKR ${minRate.toLocaleString()}`
      : `PKR ${minRate.toLocaleString()} - ${maxRate.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Saved Tutors Count */}
      <Card className="p-4 sm:p-5 rounded-2xl border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Saved Tutors
          </span>
          <div className="size-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="size-4.5 fill-rose-500 text-rose-500" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {totalCount === 1 ? "instructor saved" : "instructors saved"}
          </span>
        </div>
      </Card>

      {/* 2. Quality & Verified Rating */}
      <Card className="p-4 sm:p-5 rounded-2xl border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Average Rating
          </span>
          <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="size-4.5 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
            {avgRating} <span className="text-sm text-amber-500 font-bold">★</span>
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {verifiedCount} verified {verifiedCount === 1 ? "tutor" : "tutors"}
          </span>
        </div>
      </Card>

      {/* 3. Rate Range */}
      <Card className="p-4 sm:p-5 rounded-2xl border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Hourly Rates
          </span>
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="size-4.5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {priceDisplay}
          </span>
          <span className="text-xs font-semibold text-slate-500">/ hour</span>
        </div>
      </Card>
    </div>
  );
}
