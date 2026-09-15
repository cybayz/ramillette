"use client";

import React, { useState } from "react";
import { Star, CheckCircle, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string | Date;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews: ReviewItem[];
}

export function ProductReviews({
  productId,
  productName,
  reviews: initialReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setSubmitted(true);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reviews Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5]">
        <div>
          <h3 className="text-xl font-bold text-[#1c1c1c]">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-[#fbcd0a]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={`fill-current ${
                    s <= Math.round(avgRating)
                      ? "text-[#fbcd0a] fill-[#fbcd0a]"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[#1c1c1c]">{avgRating} / 5</span>
            <span className="text-xs text-neutral-500">
              Based on {reviews.length} verified Qatar review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary h-10 px-5 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <MessageSquarePlus size={15} />
          <span>{showForm ? "Cancel Review" : "Write a Review"}</span>
        </button>
      </div>

      {submitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>Thank you! Your verified review has been submitted successfully.</span>
        </div>
      )}

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-[8px] border border-[#b6713e]/40 shadow-sm space-y-4"
        >
          <h4 className="text-sm font-bold text-[#1c1c1c]">
            Write a Review for {productName}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Your Rating:
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-[#fbcd0a] focus:outline-none"
                >
                  <Star
                    size={22}
                    className={`transition-colors ${
                      star <= rating ? "fill-[#fbcd0a]" : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Tariq Al-Kuwari"
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Long-lasting scent and fast Doha delivery"
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Your Review
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the scent, sillage, projection, or delivery..."
              className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <Button
            variant="primary"
            isLoading={isSubmitting}
            type="submit"
            className="h-10 px-6 text-xs font-semibold"
          >
            Submit Review
          </Button>
        </form>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-[#e5e5e5]">
        {reviews.map((r) => (
          <div key={r.id} className="py-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#fbcd0a]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={
                        s <= r.rating ? "fill-[#fbcd0a]" : "text-neutral-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1c1c1c]">
                  {r.authorName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#0d9d00] bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  <CheckCircle size={10} />
                  <span>Verified Buyer</span>
                </span>
              </div>

              <span className="text-[11px] text-neutral-400">
                {new Date(r.createdAt).toLocaleDateString("en-QA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {r.title && (
              <h5 className="text-xs font-bold text-[#1c1c1c]">{r.title}</h5>
            )}

            <p className="text-xs text-neutral-600 leading-relaxed">
              {r.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
