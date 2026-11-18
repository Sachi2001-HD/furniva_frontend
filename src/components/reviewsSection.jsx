import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { apiRequest } from "../utils/api";

const columns = {
  1: "md:max-w-xl",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

function Stars({ rating }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className="flex gap-1"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          aria-hidden="true"
          className={
            i <= rating
              ? "fill-highlight text-highlight"
              : "fill-accent/50 text-accent/50"
          }
        />
      ))}
    </span>
  );
}

function Skeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Loading reviews
      </p>
      <ul
        aria-hidden="true"
        className="mt-10 grid gap-x-12 gap-y-14 md:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <li key={i} className="border-t border-highlight/60 pt-10">
            <span className="block h-5 w-32 rounded bg-accent/40 motion-safe:animate-pulse" />
            <span className="mt-8 block h-6 w-full rounded bg-accent/40 motion-safe:animate-pulse" />
            <span className="mt-3 block h-6 w-4/5 rounded bg-accent/40 motion-safe:animate-pulse" />
            <span className="mt-8 block h-4 w-1/2 rounded bg-accent/30 motion-safe:animate-pulse" />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ReviewsSection({ limit = 3 }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    let active = true;

    apiRequest(`/reviews/featured?limit=${limit}`)
      .then((data) => {
        if (!active) return;
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [limit]);

  if (status === "error" || (status === "ready" && reviews.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="stories-heading"
      className="px-4 py-10 sm:px-8 sm:py-14"
    >
      <div className="mx-auto max-w-[1680px]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              Living with Furniva
            </p>
            <h2
              id="stories-heading"
              className="mt-4 font-display text-3xl tracking-tight sm:text-6xl"
            >
              Stories from home
            </h2>
          </div>

          {summary && summary.count > 0 && (
            <p className="pb-2 text-md text-primary">
              <span className="font-semibold">{summary.average.toFixed(1)}</span>{" "}
              average from {summary.count}{" "}
              {summary.count === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>

        {status === "loading" ? (
          <Skeleton />
        ) : (
          <ul
            className={`mt-12 grid gap-x-12 gap-y-14 ${
              columns[Math.min(reviews.length, 3)]
            }`}
          >
            {reviews.map((review) => (
              <li key={review._id} className="border-t border-highlight/60 pt-10">
                <figure>
                  <Stars rating={review.rating} />

                  <blockquote className="mt-4 line-clamp-4 font-display text-xl leading-snug sm:text-[24px]">
                    “{review.comment}”
                  </blockquote>

                  <figcaption className="mt-8 text-sm text-secondary/70">
                    <span className="font-medium text-secondary">
                      {review.author}
                    </span>
                    {review.product && (
                      <>
                        {" "}
                        · on{" "}
                        <Link
                          to={`/shop/${review.product._id}`}
                          className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          {review.product.name}
                        </Link>
                      </>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}