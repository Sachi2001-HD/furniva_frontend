import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Hammer, Plus } from "lucide-react";
import PageShell from "../components/pageShell";
import Pill from "../components/ui/pill";
import Toast from "../components/ui/toast";
import PiecePreview from "../components/custom/piecePreview";
import { PIECES, WOODS } from "../components/custom/options";
import { useAuth } from "../context/authContext";
import {
  acceptCustomQuote,
  cancelCustomRequest,
  fetchMyCustomRequests,
} from "../utils/customRequestApi";
import { formatDate, formatLongDate, formatMoney } from "../utils/format";

const STATUS = {
  Submitted: { label: "Request sent", tone: "warn", step: 0 },
  "In review": { label: "In review", tone: "info", step: 1 },
  Quoted: { label: "Quote ready", tone: "good", step: 2 },
  Accepted: { label: "Quote accepted", tone: "info", step: 3 },
  "In production": { label: "In production", tone: "info", step: 4 },
  Completed: { label: "Completed", tone: "good", step: 5 },
  Declined: { label: "Declined", tone: "bad", step: -1 },
  Cancelled: { label: "Cancelled", tone: "bad", step: -1 },
};

const STEPS = [
  { key: "Submitted", label: "Request sent", text: "We’ve received your design." },
  { key: "In review", label: "In review", text: "We’re reviewing your drawings and details." },
  { key: "Quoted", label: "Quote ready", text: "Review the price, then accept it to go ahead." },
  { key: "Accepted", label: "Quote accepted", text: "We’re planning your build." },
  { key: "In production", label: "In production", text: "Your piece is being made by hand." },
  { key: "Completed", label: "Completed", text: "Brought home, ready to live with." },
];

const GROUPS = {
  action: ["Quoted"],
  active: ["Submitted", "In review", "Accepted", "In production"],
  done: ["Completed"],
  closed: ["Declined", "Cancelled"],
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "action", label: "Needs your reply" },
  { value: "active", label: "In progress" },
  { value: "done", label: "Completed" },
  { value: "closed", label: "Closed" },
];

function Timeline({ step }) {
  return (
    <ol>
      {STEPS.map((item, index) => {
        const reached = index <= step;
        const current = index === step;

        return (
          <li
            key={item.key}
            aria-current={current ? "step" : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${
                  index < step ? "bg-primary" : "bg-accent"
                }`}
              />
            )}

            <span
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
                reached
                  ? "border-primary bg-primary text-background"
                  : "border-accent bg-background text-transparent"
              } ${current ? "ring-4 ring-primary/20" : ""}`}
            >
              <Check size={15} aria-hidden="true" />
            </span>

            <div>
              <p className={reached ? "font-medium" : "text-secondary/55"}>{item.label}</p>
              {current && <p className="mt-0.5 text-sm text-secondary/70">{item.text}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function QuoteBox({ request, busy, onAccept, onDecline }) {
  const { quote } = request;
  const expired = quote.validUntil && new Date(quote.validUntil) < new Date();

  return (
    <div className="rounded-2xl border border-[#BBD6B2] bg-[#EEF5EA] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2F5D3A]">Your quote</p>
      <p className="mt-2 font-display text-4xl text-[#2F5D3A]">{formatMoney(quote.amount)}</p>
      {quote.note && <p className="mt-2 text-[15px] text-secondary/80">{quote.note}</p>}
      {quote.validUntil && (
        <p className={`mt-2 text-sm ${expired ? "text-[#9B2C1F]" : "text-secondary/65"}`}>
          {expired ? "Expired on" : "Valid until"} {formatDate(quote.validUntil)}
        </p>
      )}

      {request.status === "Quoted" && !expired && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAccept}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2F5D3A] px-6 text-[15px] font-medium text-white transition hover:bg-[#244a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5D3A] disabled:opacity-60"
          >
            <Check size={17} aria-hidden="true" />
            Accept quote
          </button>
          <button
            type="button"
            onClick={onDecline}
            disabled={busy}
            className="inline-flex h-11 items-center rounded-full border border-accent bg-[#FDF8F1] px-6 text-[15px] font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, busy, onAccept, onCancel }) {
  const [open, setOpen] = useState(request.status === "Quoted");
  const [confirming, setConfirming] = useState(false);

  const info = STATUS[request.status] ?? STATUS.Submitted;
  const piece = PIECES.find((item) => item.label === request.piece);
  const wood = WOODS.find((item) => item.label === request.timber);
  const { w, d, h } = request.dimensions ?? {};
  const closed = info.step === -1;
  const cancellable = ["Submitted", "In review", "Quoted"].includes(request.status);

  return (
    <li className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)] sm:p-7">
      <div className="flex flex-wrap items-start gap-5">
        <div className="w-32 shrink-0 rounded-2xl bg-[#F5E8DC] p-2 sm:w-40">
          <PiecePreview
            shape={piece?.shape ?? "table"}
            label={request.piece}
            color={wood?.color ?? "#8F5A38"}
            width={w}
            height={h}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl leading-tight sm:text-3xl">{request.piece}</h2>
              <p className="mt-1 text-secondary/70">
                {request.timber} · {request.finish} · {w} × {d} × {h} cm
              </p>
            </div>
            <Pill tone={info.tone}>{info.label}</Pill>
          </div>

          <p className="mt-3 text-sm text-secondary/60">
            {request.reference} · Sent on {formatDate(request.createdAt)}
          </p>

          {request.status === "Quoted" && request.quote && !open && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#DDEBD8] px-4 py-1.5 text-sm font-medium text-[#2F5D3A]">
              Quote ready: {formatMoney(request.quote.amount)}
            </p>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {open ? "Hide details" : "View details"}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-6 grid gap-8 border-t border-accent/40 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            {closed ? (
              <p className={request.status === "Declined" ? "text-[#8A1F14]" : "text-secondary/75"}>
                {request.status === "Declined"
                  ? "We’re sorry, we aren’t able to make this piece. Feel free to adjust the design and send a new request."
                  : "You cancelled this request."}
              </p>
            ) : (
              <Timeline step={info.step} />
            )}
          </div>

          <div className="space-y-5">
            {request.quote && (
              <QuoteBox
                request={request}
                busy={busy}
                onAccept={onAccept}
                onDecline={() => setConfirming(true)}
              />
            )}

            {request.notes && (
              <div>
                <p className="text-sm text-secondary/60">Your notes</p>
                <p className="mt-1 whitespace-pre-wrap text-[15px]">{request.notes}</p>
              </div>
            )}

            {request.adminNote && (
              <div>
                <p className="text-sm text-secondary/60">A note from Furniva</p>
                <p className="mt-1 whitespace-pre-wrap text-[15px]">{request.adminNote}</p>
              </div>
            )}

            {request.acceptedAt && (
              <p className="text-sm text-secondary/65">
                Quote accepted on {formatLongDate(request.acceptedAt)}
              </p>
            )}

            {cancellable && !confirming && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={busy}
                className="text-sm font-medium text-[#9B2C1F] hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
              >
                Cancel this request
              </button>
            )}

            {confirming && (
              <div role="alert" className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-3">
                <p className="text-sm text-[#9B2C1F]">Cancel this request? This can’t be undone.</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                    className="inline-flex h-10 items-center rounded-full border border-accent bg-[#FDF8F1] px-5 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false);
                      onCancel();
                    }}
                    disabled={busy}
                    className="inline-flex h-10 items-center rounded-full bg-[#9B2C1F] px-5 text-sm font-medium text-white transition hover:bg-[#7F2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C1F] disabled:opacity-60"
                  >
                    Cancel request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function MyCustomRequestsPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState(null);

  const expireSession = useCallback(() => {
    logout();
    navigate("/login", { replace: true, state: { from: "/my-custom-requests" } });
  }, [logout, navigate]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");

      try {
        setRequests(await fetchMyCustomRequests(token));
      } catch (failure) {
        if (failure.status === 401) expireSession();
        else setError(failure.message);
      } finally {
        setLoading(false);
      }
    },
    [token, expireSession]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const act = async (request, action, success) => {
    setBusy((previous) => ({ ...previous, [request._id]: true }));

    try {
      await action(token, request._id);
      await load({ silent: true });
      setToast({ type: "success", text: success, id: Date.now() });
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else setToast({ type: "error", text: failure.message, id: Date.now() });
    } finally {
      setBusy((previous) => {
        const next = { ...previous };
        delete next[request._id];
        return next;
      });
    }
  };

  const counts = useMemo(() => {
    const result = { all: requests.length };
    Object.entries(GROUPS).forEach(([key, statuses]) => {
      result[key] = requests.filter((item) => statuses.includes(item.status)).length;
    });
    return result;
  }, [requests]);

  const visible = requests.filter(
    (item) => filter === "all" || GROUPS[filter].includes(item.status)
  );

  const newRequest = (
    <Link
      to="/custom-furniture"
      className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
    >
      <Plus size={18} aria-hidden="true" />
      New request
    </Link>
  );

  return (
    <PageShell width="max-w-5xl">
      <Toast toast={toast} />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">Your account</p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            My custom requests
          </h1>
          <p className="mt-3 max-w-xl text-secondary/70 sm:text-lg">
            Follow the pieces you’ve designed with us, from first sketch to delivery.
          </p>
        </div>
        {!loading && !error && requests.length > 0 && newRequest}
      </div>

      {!loading && !error && requests.length > 0 && (
        <div role="group" aria-label="Filter requests" className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                filter === value
                  ? "border-primary bg-primary font-medium text-background"
                  : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {label}
              <span className={filter === value ? "text-background/80" : "text-secondary/65"}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>
      )}

      <section aria-label="Custom requests" className="mt-8">
        {loading ? (
          <>
            <p role="status" className="sr-only">Loading your requests</p>
            <ul className="space-y-5">
              {[0, 1].map((key) => (
                <li
                  key={key}
                  aria-hidden="true"
                  className="flex gap-5 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-7"
                >
                  <span className="h-24 w-40 rounded-2xl bg-accent/40 motion-safe:animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <span className="block h-7 w-1/2 rounded bg-accent/40 motion-safe:animate-pulse" />
                    <span className="block h-4 w-3/4 rounded bg-accent/30 motion-safe:animate-pulse" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
            <p className="font-display text-2xl">We couldn’t load your requests</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-[#FDF8F1] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
              <Hammer size={28} aria-hidden="true" />
            </span>
            <p className="mt-6 font-display text-2xl">No custom requests yet</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              Design a piece in your own size and timber, and we’ll reply with a quote.
            </p>
            <Link
              to="/custom-furniture"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Start designing
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-12 text-center text-secondary/70">
            No requests in this view.
          </p>
        ) : (
          <ul className="space-y-5">
            {visible.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                busy={!!busy[request._id]}
                onAccept={() => act(request, acceptCustomQuote, "Quote accepted")}
                onCancel={() => act(request, cancelCustomRequest, "Request cancelled")}
              />
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}