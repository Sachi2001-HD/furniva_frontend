import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiRequest } from "../utils/api";

export default function OrderProductReview({ productId, token }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest(`/reviews/my/${productId}`, { token })
      .then((data) => {
        if (active) setReview(data.review ?? null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!rating) {
      setError("Please select a star rating.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await apiRequest(`/reviews/${productId}`, {
        method: "POST",
        token,
        body: {
          rating,
          comment: comment.trim(),
        },
      });

      setReview(data.review);
      setSuccess("Thank you! Your review has been submitted.");
    } catch (err) {
      setError(err.message || "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="mt-3 text-sm text-secondary/60">
        Checking review status...
      </p>
    );
  }

  if (review) {
    return (
      <div className="mt-4 rounded-xl bg-accent/20 p-4">
        <p className="font-medium text-primary">Review submitted</p>
        <div className="mt-2 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={17}
              className={
                star <= review.rating
                  ? "fill-highlight text-highlight"
                  : "text-accent"
              }
            />
          ))}
        </div>
        {review.comment && (
          <p className="mt-2 text-sm text-secondary/75">
            {review.comment}
          </p>
        )}
        <p className="mt-2 text-xs text-secondary/60">
          Thank you for sharing your experience.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-accent/50 bg-background p-4"
    >
      <p className="font-medium text-primary">Rate this product</p>

      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} out of 5`}
            aria-pressed={rating === star}
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Star
              size={26}
              className={
                star <= rating
                  ? "fill-highlight text-highlight"
                  : "text-accent hover:text-highlight"
              }
            />
          </button>
        ))}
      </div>

      <label
        htmlFor={`review-comment-${productId}`}
        className="mt-4 block text-sm font-medium text-secondary"
      >
        Your comment <span className="font-normal text-secondary/55">(optional)</span>
      </label>

      <textarea
        id={`review-comment-${productId}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Share your experience with this product..."
        className="mt-2 w-full resize-y rounded-xl border border-accent bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      <p className="mt-1 text-right text-xs text-secondary/50">
        {comment.length}/1000
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
