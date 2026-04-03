import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFeedbackStats, useSubmitFeedback } from "../hooks/useBackend";
import { cn } from "../utils/helpers";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = useSubmitFeedback();
  const { data: stats } = useFeedbackStats();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        rating: BigInt(rating),
        comment: comment.trim(),
      });
      setSubmitted(true);
      toast.success("Feedback submitted! Thank you.");
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setComment("");
      }, 2000);
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const avgRating = stats?.averageRating ?? 4.2;
  const totalCount = Number(stats?.count ?? BigInt(127));

  return (
    <div className="p-4 lg:p-6 space-y-6 page-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Feedback</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help us improve Trainds for every Mumbai commuter
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Stats */}
        <div className="card-surface p-6">
          <h3 className="font-semibold text-foreground mb-6">Overall Rating</h3>
          <div className="flex items-end gap-4 mb-6">
            <div className="text-6xl font-black text-foreground">
              {avgRating.toFixed(1)}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(avgRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalCount.toLocaleString()} reviews
              </div>
            </div>
          </div>

          {/* Rating bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct =
                star === 5
                  ? 45
                  : star === 4
                    ? 32
                    : star === 3
                      ? 15
                      : star === 2
                        ? 5
                        : 3;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">
                    {star}
                  </span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Form */}
        <div className="card-surface p-6">
          <h3 className="font-semibold text-foreground mb-6">
            Submit Feedback
          </h3>

          {submitted ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                <Star className="h-7 w-7 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="font-medium text-foreground">
                Thank you for your feedback!
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-ocid="feedback.form"
            >
              {/* Star Rating */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Your Rating *
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                      data-ocid={`feedback.star_${star}.toggle`}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {
                      ["Poor", "Fair", "Good", "Very Good", "Excellent"][
                        rating - 1
                      ]
                    }
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Comment (optional)
                </p>
                <Textarea
                  placeholder="Share your experience with Trainds..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                  data-ocid="feedback.comment.textarea"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={submitFeedback.isPending}
                data-ocid="feedback.submit_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
                  color: "oklch(0.12 0.025 248)",
                }}
              >
                {submitFeedback.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
