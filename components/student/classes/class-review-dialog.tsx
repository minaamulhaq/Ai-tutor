"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Check } from "lucide-react";
import { StudentClass } from "@/types/class";
import { cn } from "@/lib/utils";

interface ClassReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: StudentClass | null;
  onConfirmReview: (classId: string, rating: number, comment: string) => Promise<void>;
}

export function ClassReviewDialog({
  isOpen,
  onClose,
  classItem,
  onConfirmReview,
}: ClassReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!classItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirmReview(classItem.id, rating, comment.trim());
      setComment("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
            Leave a Review for {classItem.teacher.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Share your feedback on the {classItem.subject} session to help other students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Rating Stars Picker */}
          <div className="text-center space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block">
              Overall Lesson Rating:
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-700">
              {rating === 5 && "Outstanding Experience! ★★★★★"}
              {rating === 4 && "Very Good Class ★★★★"}
              {rating === 3 && "Good Session ★★★"}
              {rating === 2 && "Could Be Better ★★"}
              {rating === 1 && "Unsatisfied ★"}
            </span>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-xs font-bold text-slate-700 block">
              Your Review:
            </label>
            <Textarea
              id="review-comment"
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about the teaching style, whiteboard diagrams, and homework support?..."
              className="text-xs rounded-xl"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !comment.trim()}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
