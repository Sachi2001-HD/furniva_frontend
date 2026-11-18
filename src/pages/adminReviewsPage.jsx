import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Armchair,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";

const PAGE_SIZE = 8;
const LONG_COMMENT = 220; 

const statusFilters = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

const sorts = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
];

const byDateDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const sorters = {
  newest: byDateDesc,
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  highest: (a, b) => b.rating - a.rating || byDateDesc(a, b),
  lowest: (a, b) => a.rating - b.rating || byDateDesc(a, b),
};

const statusPill = {
  published: {
    label: "Published",
    className: "border-[#BBD6B2] bg-[#DDEBD8] text-[#2F5D3A]",
  },
  hidden: {
    label: "Hidden",
    className: "border-[#E9C98F] bg-[#F7E3C3] text-[#7A4A12]",
  },
};

const defaultFilters = {
  search: "",
  status: "all",
  rating: "all",
  sort: "newest",
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const cardClass =
  "overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)]";

const fullName = (user) => {
  if (!user) return "Deleted customer";

  return (
    [user.firstName, user.lastName]
      .filter((part) => part && part !== "-")
      .join(" ") || "Customer"
  );
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Stars({ rating, size = 17 }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className="inline-flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
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

function Avatar({ user, className = "h-11 w-11" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [user?.image]);

  if (user?.image && !failed) {
    return (
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const initial = (user?.firstName?.[0] || "C").toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background ${className}`}
    >
      {initial}
    </span>
  );
}

function Thumb({ src, className = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-xl bg-accent/40 text-primary/60 ${className}`}
      >
        <Armchair size={20} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl object-cover ${className}`}
    />
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-accent/60 bg-background pl-4 pr-10 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60"
      />
    </label>
  );
}

function Chip({ active, count, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition ${focusRing} ${
        active
          ? "border-primary bg-primary font-medium text-background"
          : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
      {count != null && (
        <span
          className={`text-xs ${active ? "text-background/80" : "text-secondary/65"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Metric({ label, value, note, tone }) {
  const noteColor =
    tone === "warn" ? "text-[#8A4B12]" : "text-secondary/65";

  return (
    <div className="bg-[#FDF8F1] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-primary xl:text-[40px]">
        {value}
      </p>
      <p className={`mt-3 text-sm ${noteColor}`}>{note}</p>
    </div>
  );
}

function Overview({ loading, ready, stats, ratingFilter, onPickRating }) {
  const dash = loading ? "–" : null;

  return (
    <section
      aria-label="Reviews overview"
      className={`${cardClass} transition duration-500 motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="grid gap-px bg-accent/40 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total reviews"
          value={dash ?? stats.total}
          note={loading ? "\u00a0" : `${stats.withComment} with a written comment`}
        />
        <Metric
          label="Published"
          value={dash ?? stats.published}
          note="Visible in the shop"
        />
        <Metric
          label="Hidden"
          value={dash ?? stats.hidden}
          note="Not shown to customers"
          tone={stats.hidden > 0 ? "warn" : undefined}
        />
        <Metric
          label="Average rating"
          value={dash ?? (stats.published ? stats.average.toFixed(1) : "–")}
          note="Of published reviews"
        />
      </div>

      {!loading && stats.total > 0 && (
        <div className="border-t border-accent/40 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Rating breakdown</h2>
            <p className="text-sm text-secondary/65">All reviews. Select a row to filter.</p>
          </div>

          <ul className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.byRating[star] ?? 0;
              const active = ratingFilter === String(star);

              return (
                <li key={star}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${star}-star reviews: ${count}`}
                    onClick={() => onPickRating(active ? "all" : String(star))}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-accent/25 ${focusRing} ${
                      active ? "bg-accent/30" : ""
                    }`}
                  >
                    <span aria-hidden="true" className="flex w-10 shrink-0 items-center gap-1">
                      {star}
                      <Star size={13} className="fill-highlight text-highlight" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-accent/40"
                    >
                      <span
                        style={{
                          width: ready ? `${(count / stats.total) * 100}%` : "0%",
                        }}
                        className="block h-full rounded-full bg-highlight transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                      />
                    </span>
                    <span aria-hidden="true" className="w-8 shrink-0 text-right text-secondary/70">
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, text, children }) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <Star size={26} aria-hidden="true" />
      </span>
      <p className="mt-5 font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-secondary/70">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function Pagination({ start, count, total, current, pages, onPage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 px-6 py-4">
      <p className="text-sm text-secondary/70">
        Showing {start + 1}–{start + count} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
          className={`grid h-10 w-10 place-items-center rounded-xl border border-accent/70 text-primary transition hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="min-w-24 text-center text-sm">
          Page {current} of {pages}
        </span>
        <button
          type="button"
          onClick={() => onPage(current + 1)}
          disabled={current === pages}
          aria-label="Next page"
          className={`grid h-10 w-10 place-items-center rounded-xl border border-accent/70 text-primary transition hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ review, busy, onApproval, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const pill = statusPill[review.isApproved ? "published" : "hidden"];
  const comment = review.comment?.trim() ?? "";
  const isLong = comment.length > LONG_COMMENT;

  const actionButton = `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

  return (
    <li
      className={`border-l-4 px-5 py-6 sm:px-6 ${
        review.isApproved
          ? "border-transparent"
          : "border-highlight bg-accent/10"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3">
            <Avatar user={review.user} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                {fullName(review.user)}
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-normal text-primary">
                    <ShieldCheck size={13} aria-hidden="true" />
                    Verified purchase
                  </span>
                )}
              </p>
              {review.user?.email && (
                <p className="truncate text-sm text-secondary/65">
                  {review.user.email}
                </p>
              )}
            </div>
          </div>

          {/* Rating, date and status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Stars rating={review.rating} />
            <time
              dateTime={review.createdAt}
              className="text-sm text-secondary/65"
            >
              {formatDate(review.createdAt)}
            </time>
            <span
              className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${pill.className}`}
            >
              {pill.label}
            </span>
          </div>

          {/* Comment */}
          {comment ? (
            <div>
              <p
                className={`whitespace-pre-line wrap-break-word text-[15px] leading-7 text-secondary/85 ${
                  isLong && !expanded ? "line-clamp-3" : ""
                }`}
              >
                {comment}
              </p>
              {isLong && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((previous) => !previous)}
                  className={`mt-1 rounded text-sm font-medium text-primary hover:underline ${focusRing}`}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-[15px] italic text-secondary/65">
              Rating only. No written comment.
            </p>
          )}

          {/* Product */}
          <div className="flex items-center gap-3 rounded-2xl bg-accent/20 p-3">
            <Thumb src={review.product?.images?.[0]} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.15em] text-secondary/65">
                Product
              </p>
              {review.product ? (
                <Link
                  to={`/shop/${review.product._id}`}
                  className={`block truncate font-medium text-primary hover:underline ${focusRing}`}
                >
                  {review.product.name}
                </Link>
              ) : (
                <p className="text-secondary/70">Removed product</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:w-48 lg:flex-col lg:items-stretch">
          {confirming ? (
            <div className="w-full space-y-3 rounded-2xl border border-[#9B2C1F]/30 bg-[#9B2C1F]/5 p-3">
              <p className="text-sm text-[#9B2C1F]">
                Delete this review for good?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirming(false)}
                  className={`${actionButton} flex-1 border border-accent bg-background text-primary hover:bg-accent/30`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(review)}
                  className={`${actionButton} flex-1 bg-[#9B2C1F] text-white hover:bg-[#7F2318]`}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              {review.isApproved ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onApproval(review, false)}
                  className={`${actionButton} border border-accent bg-background text-primary hover:bg-accent/30`}
                >
                  <EyeOff size={16} aria-hidden="true" />
                  Hide review
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onApproval(review, true)}
                  className={`${actionButton} bg-primary text-background hover:bg-secondary`}
                >
                  <Eye size={16} aria-hidden="true" />
                  Publish review
                </button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(true)}
                className={`${actionButton} border border-[#9B2C1F]/30 text-[#9B2C1F] hover:bg-[#9B2C1F]/10`}
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export default function AdminReviewsPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const session = useRef({});
  session.current = { logout, navigate };

  const [ready, setReady] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text, id: Date.now() });

  const setBusyFor = (id, value) =>
    setBusy((previous) => {
      const next = { ...previous };
      if (value) next[id] = true;
      else delete next[id];
      return next;
    });

  const fail = (error) => {
    if (error.status === 401) {
      session.current.logout();
      session.current.navigate("/login", {
        replace: true,
        state: { from: "/admin/reviews" },
      });
      return;
    }
    showToast("error", error.message);
  };

  // Load every review
  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setLoading(true);
    setLoadError("");

    apiRequest("/reviews/admin/all", { token })
      .then((data) => {
        if (active) setReviews(data.reviews ?? []);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          session.current.logout();
          session.current.navigate("/login", {
            replace: true,
            state: { from: "/admin/reviews" },
          });
          return;
        }
        setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, reloadKey]);

  const setApproval = async (review, isApproved) => {
    setBusyFor(review._id, true);

    try {
      await apiRequest(`/reviews/admin/${review._id}/approve`, {
        method: "PATCH",
        token,
        body: { isApproved },
      });

      setReviews((previous) =>
        previous.map((item) =>
          item._id === review._id ? { ...item, isApproved } : item
        )
      );
      showToast(
        "success",
        isApproved ? "Review published" : "Review hidden from the shop"
      );
    } catch (error) {
      fail(error);
    } finally {
      setBusyFor(review._id, false);
    }
  };

  const removeReview = async (review) => {
    setBusyFor(review._id, true);

    try {
      await apiRequest(`/reviews/admin/${review._id}`, {
        method: "DELETE",
        token,
      });

      setReviews((previous) =>
        previous.filter((item) => item._id !== review._id)
      );
      showToast("success", "Review deleted");
    } catch (error) {
      fail(error);
    } finally {
      setBusyFor(review._id, false);
    }
  };

  const setFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters((previous) => ({ ...defaultFilters, sort: previous.sort }));
    setPage(1);
  };

  const stats = useMemo(() => {
    const published = reviews.filter((review) => review.isApproved);
    const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      byRating[review.rating] = (byRating[review.rating] ?? 0) + 1;
    });

    return {
      total: reviews.length,
      published: published.length,
      hidden: reviews.length - published.length,
      average: published.length
        ? published.reduce((sum, review) => sum + review.rating, 0) /
          published.length
        : 0,
      withComment: reviews.filter((review) => review.comment?.trim()).length,
      byRating,
    };
  }, [reviews]);

  const statusCounts = {
    all: stats.total,
    published: stats.published,
    hidden: stats.hidden,
  };

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const list = reviews.filter((review) => {
      if (
        q &&
        ![
          fullName(review.user),
          review.user?.email,
          review.product?.name,
          review.comment,
        ].some((value) => value?.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (filters.status === "published" && !review.isApproved) return false;
      if (filters.status === "hidden" && review.isApproved) return false;
      if (filters.rating !== "all" && review.rating !== Number(filters.rating)) {
        return false;
      }
      return true;
    });

    return [...list].sort(sorters[filters.sort] ?? sorters.newest);
  }, [reviews, filters]);

  const hasFilters =
    filters.search || filters.status !== "all" || filters.rating !== "all";

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);

  let content;

  if (loading) {
    content = (
      <div className={cardClass}>
        <p role="status" className="sr-only">
          Loading reviews
        </p>
        <ul aria-hidden="true" className="divide-y divide-accent/40">
          {[0, 1, 2].map((i) => (
            <li key={i} className="space-y-4 px-6 py-6">
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-full bg-accent/40 motion-safe:animate-pulse" />
                <span className="h-4 w-40 rounded bg-accent/40 motion-safe:animate-pulse" />
              </div>
              <span className="block h-4 w-32 rounded bg-accent/30 motion-safe:animate-pulse" />
              <span className="block h-4 w-3/4 rounded bg-accent/30 motion-safe:animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (loadError) {
    content = (
      <div role="alert" className={`${cardClass} px-6 py-16 text-center`}>
        <p className="font-display text-2xl">We couldn’t load the reviews</p>
        <p className="mx-auto mt-2 max-w-sm text-secondary/70">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className={`mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary ${focusRing}`}
        >
          Try again
        </button>
      </div>
    );
  } else if (reviews.length === 0) {
    content = (
      <div className={cardClass}>
        <EmptyState
          title="No reviews yet"
          text="Reviews appear here after customers rate products from delivered orders."
        />
      </div>
    );
  } else if (visible.length === 0) {
    content = (
      <div className={cardClass}>
        <EmptyState
          title="No reviews match"
          text="Try a different search or clear your filters."
        >
          <button
            type="button"
            onClick={clearFilters}
            className={`inline-flex h-11 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 ${focusRing}`}
          >
            Clear filters
          </button>
        </EmptyState>
      </div>
    );
  } else {
    content = (
      <div className={cardClass}>
        <ul className="divide-y divide-accent/40">
          {rows.map((review) => (
            <ReviewRow
              key={review._id}
              review={review}
              busy={!!busy[review._id]}
              onApproval={setApproval}
              onDelete={removeReview}
            />
          ))}
        </ul>

        <Pagination
          start={start}
          count={rows.length}
          total={visible.length}
          current={current}
          pages={pages}
          onPage={setPage}
        />
      </div>
    );
  }

  return (
    <AdminLayout
      title="Reviews"
      subtitle="Moderate what customers say about your products."
    >
      {/* Toast */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed left-1/2 top-6 z-70 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] ${
            toast.type === "error" ? "bg-[#9B2C1F]" : "bg-[#1F5C36]"
          }`}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
            {toast.type === "error" ? (
              <X size={16} aria-hidden="true" />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
          </span>
          {toast.text}
        </div>
      )}

      <Overview
        loading={loading}
        ready={ready}
        stats={stats}
        ratingFilter={filters.rating}
        onPickRating={(value) => setFilter("rating", value)}
      />

      {/* Toolbar */}
      <section
        aria-label="Search and filters"
        className="mt-8 space-y-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-55 flex-1">
            <span className="sr-only">Search reviews</span>
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search by customer, product or comment"
              className="h-11 w-full rounded-2xl border border-accent/60 bg-background pl-11 pr-4 text-[15px] outline-none transition placeholder:text-secondary/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>

          <div className="w-full sm:w-56">
            <FilterSelect
              label="Sort by"
              value={filters.sort}
              onChange={(value) => setFilter("sort", value)}
            >
              {sorts.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter by rating"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          <Chip
            active={filters.rating === "all"}
            count={stats.total}
            onClick={() => setFilter("rating", "all")}
          >
            All ratings
          </Chip>
          {[5, 4, 3, 2, 1].map((star) => (
            <Chip
              key={star}
              active={filters.rating === String(star)}
              count={stats.byRating[star]}
              onClick={() => setFilter("rating", String(star))}
            >
              {star}
              <Star
                size={13}
                aria-hidden="true"
                className="fill-highlight text-highlight"
              />
              <span className="sr-only">stars</span>
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 pt-4">
          <div
            role="group"
            aria-label="Filter by status"
            className="flex flex-wrap gap-1 rounded-full bg-accent/30 p-1"
          >
            {statusFilters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filters.status === value}
                onClick={() => setFilter("status", value)}
                className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary ${
                  filters.status === value
                    ? "bg-[#FDF8F1] font-medium text-primary shadow-sm"
                    : "text-secondary/70 hover:text-primary"
                }`}
              >
                {label}
                <span className="ml-1.5 text-secondary/65">
                  {statusCounts[value]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`rounded text-sm font-medium text-primary hover:underline ${focusRing}`}
              >
                Clear filters
              </button>
            )}

            {!loading && !loadError && (
              <p role="status" className="text-sm text-secondary/65">
                {visible.length} {visible.length === 1 ? "review" : "reviews"}
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Reviews" className="mt-6">
        {content}
      </section>
    </AdminLayout>
  );
}