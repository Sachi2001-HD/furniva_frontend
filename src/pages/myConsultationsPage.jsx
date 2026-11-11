import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, ChevronDown, ExternalLink, Phone, Plus, Video } from "lucide-react";
import PageShell from "../components/pageShell";
import Pill from "../components/ui/pill";
import Toast from "../components/ui/toast";
import ConsultationDrawer from "../components/consultations/consultationDrawer";
import { useAuth } from "../context/authContext";
import {
  cancelConsultation,
  createConsultation,
  fetchMyConsultations,
} from "../utils/consultationApi";
import { formatLongDate, formatTime } from "../utils/format";

const STATUS = {
  Pending: { label: "Awaiting confirmation", tone: "warn" },
  Confirmed: { label: "Confirmed", tone: "good" },
  Completed: { label: "Completed", tone: "info" },
  Cancelled: { label: "Cancelled", tone: "bad" },
};

const TABS = [
  { value: "upcoming", label: "Upcoming", statuses: ["Pending", "Confirmed"] },
  { value: "past", label: "Completed", statuses: ["Completed"] },
  { value: "cancelled", label: "Cancelled", statuses: ["Cancelled"] },
];

const dayParts = (item) => {
  const date = new Date(item.scheduledAt ?? item.preferredDate);
  const options = item.scheduledAt ? {} : { timeZone: "UTC" };

  return {
    day: date.toLocaleDateString("en-GB", { day: "numeric", ...options }),
    month: date.toLocaleDateString("en-GB", { month: "short", ...options }),
  };
};

function ConsultationCard({ item, busy, onCancel }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const info = STATUS[item.status];
  const { day, month } = dayParts(item);
  const ModeIcon = item.mode === "online" ? Video : Phone;
  const cancellable = ["Pending", "Confirmed"].includes(item.status);

  const when = item.scheduledAt
    ? `${formatLongDate(item.scheduledAt)} at ${formatTime(item.scheduledAt)}`
    : `${formatLongDate(item.preferredDate, true)} · ${item.timeWindow}`;

  return (
    <li className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)] sm:p-7">
      <div className="flex flex-wrap items-start gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-primary text-background">
          <div className="text-center">
            <p className="font-display text-3xl leading-none">{day}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-background/80">{month}</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{item.topic}</h2>
            <Pill tone={info.tone}>{info.label}</Pill>
          </div>

          <p className="mt-2 text-secondary/80">{when}</p>
          {!item.scheduledAt && item.status === "Pending" && (
            <p className="text-sm text-secondary/60">We’ll confirm the exact time with you.</p>
          )}

          <p className="mt-2 inline-flex items-center gap-2 text-sm text-secondary/70">
            <ModeIcon size={16} aria-hidden="true" />
            {item.mode === "online" ? "Online video call" : "Phone call"}
            <span aria-hidden="true">·</span>
            {item.reference}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {item.status === "Confirmed" && item.meetingLink && (
              <a
                href={item.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Join video call
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {open ? "Hide details" : "View details"}
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-6 space-y-4 border-t border-accent/40 pt-6">
          <dl className="grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-sm text-secondary/60">Phone</dt>
              <dd>{item.phone}</dd>
            </div>
            {item.roomType && (
              <div>
                <dt className="text-sm text-secondary/60">Room</dt>
                <dd>{item.roomType}</dd>
              </div>
            )}
            {item.budget && (
              <div>
                <dt className="text-sm text-secondary/60">Budget</dt>
                <dd>{item.budget}</dd>
              </div>
            )}
          </dl>

          {item.message && (
            <div>
              <p className="text-sm text-secondary/60">Your message</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px]">{item.message}</p>
            </div>
          )}

          {item.adminNote && (
            <div className="rounded-2xl bg-accent/30 px-4 py-3">
              <p className="text-sm text-secondary/60">A note from Furniva</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px]">{item.adminNote}</p>
            </div>
          )}

          {cancellable && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={busy}
              className="text-sm font-medium text-[#9B2C1F] hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
            >
              Cancel this consultation
            </button>
          )}

          {confirming && (
            <div role="alert" className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-3">
              <p className="text-sm text-[#9B2C1F]">Cancel this consultation?</p>
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
                  Cancel consultation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function MyConsultationsPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState(null);

  const expireSession = useCallback(() => {
    logout();
    navigate("/login", { replace: true, state: { from: "/my-consultations" } });
  }, [logout, navigate]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");

      try {
        setItems(await fetchMyConsultations(token));
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

  const showToast = (type, text) => setToast({ type, text, id: Date.now() });

  const book = async (payload) => {
    setSaving(true);
    setFormError("");

    try {
      await createConsultation(token, payload);
      await load({ silent: true });
      setTab("upcoming");
      setDrawer(false);
      showToast("success", "Consultation requested. We’ll confirm the time with you.");
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (item) => {
    setBusy((previous) => ({ ...previous, [item._id]: true }));

    try {
      await cancelConsultation(token, item._id);
      await load({ silent: true });
      showToast("success", "Consultation cancelled");
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else showToast("error", failure.message);
    } finally {
      setBusy((previous) => {
        const next = { ...previous };
        delete next[item._id];
        return next;
      });
    }
  };

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map(({ value, statuses }) => [
          value,
          items.filter((item) => statuses.includes(item.status)).length,
        ])
      ),
    [items]
  );

  const visible = useMemo(() => {
    const statuses = TABS.find((item) => item.value === tab).statuses;
    const list = items.filter((item) => statuses.includes(item.status));
    const key = (item) => new Date(item.scheduledAt ?? item.preferredDate);

    return [...list].sort((a, b) => (tab === "upcoming" ? key(a) - key(b) : key(b) - key(a)));
  }, [items, tab]);

  const bookButton = (
    <button
      type="button"
      onClick={() => {
        setFormError("");
        setDrawer(true);
      }}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
    >
      <Plus size={18} aria-hidden="true" />
      Book a consultation
    </button>
  );

  return (
    <PageShell width="max-w-5xl">
      <Toast toast={toast} />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">Your account</p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            My consultations
          </h1>
          <p className="mt-3 max-w-xl text-secondary/70 sm:text-lg">
            A little direction goes a long way. Book a chat about your space and follow it here.
          </p>
        </div>
        {!loading && !error && items.length > 0 && bookButton}
      </div>

      {!loading && !error && items.length > 0 && (
        <div role="tablist" aria-label="Consultations" className="mt-8 flex flex-wrap gap-2">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                tab === value
                  ? "border-primary bg-primary font-medium text-background"
                  : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {label}
              <span className={tab === value ? "text-background/80" : "text-secondary/65"}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>
      )}

      <section aria-label="Consultations" className="mt-8">
        {loading ? (
          <>
            <p role="status" className="sr-only">Loading your consultations</p>
            <ul className="space-y-5">
              {[0, 1].map((key) => (
                <li
                  key={key}
                  aria-hidden="true"
                  className="flex gap-5 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-7"
                >
                  <span className="h-20 w-20 rounded-2xl bg-accent/40 motion-safe:animate-pulse" />
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
            <p className="font-display text-2xl">We couldn’t load your consultations</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-[#FDF8F1] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
              <CalendarCheck size={28} aria-hidden="true" />
            </span>
            <p className="mt-6 font-display text-2xl">No consultations yet</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              Book a video or phone call to plan your room, choose pieces, or start a custom design.
            </p>
            <div className="mt-8 flex justify-center">{bookButton}</div>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-12 text-center text-secondary/70">
            Nothing here yet.
          </p>
        ) : (
          <ul className="space-y-5">
            {visible.map((item) => (
              <ConsultationCard
                key={item._id}
                item={item}
                busy={!!busy[item._id]}
                onCancel={() => cancel(item)}
              />
            ))}
          </ul>
        )}
      </section>

      {drawer && (
        <ConsultationDrawer
          defaultPhone={user?.contactNumber ?? ""}
          saving={saving}
          error={formError}
          onClose={() => setDrawer(false)}
          onSubmit={book}
        />
      )}
    </PageShell>
  );
}