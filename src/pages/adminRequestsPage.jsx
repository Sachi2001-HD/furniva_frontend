import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, ChevronRight, Hammer, Inbox, MessagesSquare, Search } from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import RequestDrawer from "../components/admin/requestDrawer";
import Pill from "../components/ui/pill";
import Toast from "../components/ui/toast";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";
import { formatDate } from "../utils/format";
import { statusTone } from "../utils/requestStatus";

const LIMIT = 100;

const KINDS = [
  { value: "all", label: "All requests" },
  { value: "consultation", label: "Consultations" },
  { value: "custom", label: "Custom designs" },
];

const STATUSES = {
  all: [
    "Pending", "Confirmed", "Submitted", "In review", "Quoted",
    "Accepted", "In production", "Completed", "Declined", "Cancelled",
  ],
  consultation: ["Pending", "Confirmed", "Completed", "Cancelled"],
  custom: ["Submitted", "In review", "Quoted", "Accepted", "In production", "Completed", "Declined", "Cancelled"],
};

const MODE_LABELS = { video: "Video call", "in-store": "In-store", undecided: "Format open" };

const fromConsultation = (raw) => ({
  key: `consultation-${raw._id}`,
  kind: "consultation",
  title: `${raw.space} consultation`,
  subtitle: MODE_LABELS[raw.mode] ?? raw.mode,
  name: raw.name,
  email: raw.email,
  phone: raw.phone,
  status: raw.status,
  createdAt: raw.createdAt,
  needsAction: raw.status === "Pending",
  raw,
});

const fromCustom = (raw) => ({
  key: `custom-${raw._id}`,
  kind: "custom",
  title: raw.piece,
  subtitle: `${raw.timber} · ${raw.finish} · ${raw.dimensions?.w}×${raw.dimensions?.d}×${raw.dimensions?.h} cm`,
  name: raw.contactName,
  email: raw.contactEmail,
  phone: raw.contactPhone,
  status: raw.status,
  createdAt: raw.createdAt,
  needsAction: ["Submitted", "In review"].includes(raw.status),
  raw,
});

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/40 text-primary">
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl leading-none text-primary">{value}</p>
      <p className="mt-2 text-sm text-secondary/65">{note}</p>
    </div>
  );
}

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ consultations: 0, requests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [actionOnly, setActionOnly] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [consultations, custom] = await Promise.all([
        apiRequest(`/consultations?limit=${LIMIT}`, { token }),
        apiRequest(`/custom-requests?limit=${LIMIT}`, { token }),
      ]);

      setItems([
        ...(consultations.consultations ?? []).map(fromConsultation),
        ...(custom.requests ?? []).map(fromCustom),
      ]);
      setTotals({ consultations: consultations.total ?? 0, requests: custom.total ?? 0 });
    } catch (failure) {
      if (failure.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: "/admin/requests" } });
        return;
      }
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleUpdated = (item, updated, message) => {
    const merged = { ...item.raw, ...updated }; 
    setItems((previous) =>
      previous.map((entry) =>
        entry.key === item.key
          ? (item.kind === "consultation" ? fromConsultation(merged) : fromCustom(merged))
          : entry
      )
    );
    if (message) setToast({ type: "success", text: message, id: Date.now() });
  };

  const stats = useMemo(
    () => ({
      needsAction: items.filter((item) => item.needsAction).length,
      upcoming: items.filter((item) => item.kind === "consultation" && item.status === "Confirmed").length,
      quoted: items.filter((item) => item.status === "Quoted").length,
      production: items.filter((item) => item.status === "In production").length,
    }),
    [items]
  );

  const counts = useMemo(
    () => ({
      all: items.length,
      consultation: items.filter((item) => item.kind === "consultation").length,
      custom: items.filter((item) => item.kind === "custom").length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter((item) => kind === "all" || item.kind === kind)
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => !actionOnly || item.needsAction)
      .filter(
        (item) =>
          !q ||
          [item.name, item.email, item.title, item.raw.reference]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(q))
      )
      .sort(
        (a, b) =>
          Number(b.needsAction) - Number(a.needsAction) ||
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [items, kind, status, search, actionOnly]);

  const selected = items.find((item) => item.key === selectedKey) ?? null;
  const hasFilters = kind !== "all" || status !== "all" || !!search || actionOnly;
  const truncated = totals.consultations > LIMIT || totals.requests > LIMIT;

  const clearFilters = () => {
    setKind("all");
    setStatus("all");
    setSearch("");
    setActionOnly(false);
  };

  return (
    <AdminLayout
      title="Customer Requests"
      subtitle="Consultations and custom designs from your customers."
    >
      <Toast toast={toast} />

      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Inbox} label="Needs action" value={stats.needsAction} note="Waiting for your reply" />
          <StatCard icon={CalendarClock} label="Upcoming calls" value={stats.upcoming} note="Confirmed consultations" />
          <StatCard icon={MessagesSquare} label="Quotes sent" value={stats.quoted} note="Waiting for the customer" />
          <StatCard icon={Hammer} label="In production" value={stats.production} note="Pieces being made" />
        </div>
      )}

      {/* Filters */}
      <section
        aria-label="Search and filters"
        className="mt-8 space-y-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-220px flex-1">
            <span className="sr-only">Search requests</span>
            <Search size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, reference or piece"
              className="h-11 w-full rounded-2xl border border-accent/60 bg-background pl-11 pr-4 text-[15px] outline-none transition placeholder:text-secondary/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>

          <label className="block w-full sm:w-52">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 w-full rounded-2xl border border-accent/60 bg-background px-4 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="all">All statuses</option>
              {STATUSES[kind].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            aria-pressed={actionOnly}
            onClick={() => setActionOnly((value) => !value)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              actionOnly
                ? "border-primary bg-primary font-medium text-background"
                : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
            }`}
          >
            Needs action
          </button>
        </div>

        <div role="tablist" aria-label="Request type" className="flex flex-wrap gap-2 border-t border-accent/40 pt-4">
          {KINDS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={kind === value}
              onClick={() => {
                setKind(value);
                setStatus("all");
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                kind === value
                  ? "border-primary bg-primary font-medium text-background"
                  : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {label}
              <span className={kind === value ? "text-background/80" : "text-secondary/65"}>{counts[value]}</span>
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* List */}
      <section aria-label="Requests" className="mt-6">
        {loading ? (
          <>
            <p role="status" className="sr-only">Loading requests</p>
            <ul className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} aria-hidden="true" className="h-24 rounded-3xl bg-accent/40 motion-safe:animate-pulse" />
              ))}
            </ul>
          </>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
            <p className="font-display text-2xl">We couldn’t load the requests</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
              <Inbox size={26} aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-2xl">{hasFilters ? "No requests match" : "No requests yet"}</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              {hasFilters ? "Try a different search or clear the filters." : "New consultations and custom designs will appear here."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex h-11 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {visible.map((item) => {
                const Icon = item.kind === "consultation" ? CalendarClock : Hammer;

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(item.key)}
                      className="group grid w-full items-center gap-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 text-left shadow-[0_6px_20px_rgba(113,62,38,0.05)] transition hover:border-primary/40 hover:shadow-[0_14px_36px_rgba(113,62,38,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_110px_160px_20px]"
                    >
                      <span className="flex min-w-0 items-center gap-4">
                        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-display text-lg text-background">
                          {item.name?.charAt(0).toUpperCase() || "?"}
                          {item.needsAction && (
                            <span
                              aria-label="Needs action"
                              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#FDF8F1] bg-highlight"
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{item.name}</span>
                          <span className="block truncate text-sm text-secondary/65">{item.email}</span>
                        </span>
                      </span>

                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{item.title}</span>
                          <span className="block truncate text-sm text-secondary/65">{item.subtitle}</span>
                        </span>
                      </span>

                      <span className="text-sm text-secondary/65">{formatDate(item.createdAt)}</span>

                      <span>
                        <Pill tone={statusTone(item.status)}>{item.status}</Pill>
                      </span>

                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                        className="hidden text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary md:block"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {truncated && (
              <p className="mt-4 text-center text-sm text-secondary/60">
                Showing the latest {LIMIT} of each type.
              </p>
            )}
          </>
        )}
      </section>

      {selected && (
        <RequestDrawer
          key={selected.key}
          item={selected}
          token={token}
          onClose={() => setSelectedKey(null)}
          onUpdated={handleUpdated}
        />
      )}
    </AdminLayout>
  );
}