import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "../context/notificationContext";
import {
  GROUP_ORDER,
  dayGroup,
  getTypeMeta,
  isInternalLink,
  timeAgo,
  typeLabel,
} from "../utils/notifications";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const textButton = `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-primary transition hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm transition ${focusRing} ${
        active
          ? "border-primary bg-primary font-medium text-background"
          : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full transition ${focusRing} ${
        danger
          ? "text-[#9B2C1F] hover:bg-[#9B2C1F]/10"
          : "text-primary hover:bg-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

function State({ title, text, children }) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <Bell size={26} aria-hidden="true" />
      </span>
      <p className="mt-5 font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-secondary/70">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Loading notifications
      </p>
      <ul aria-hidden="true" className="divide-y divide-accent/40">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-start gap-4 px-5 py-5">
            <span className="h-11 w-11 rounded-full bg-accent/40 motion-safe:animate-pulse" />
            <div className="flex-1 space-y-2.5">
              <span className="block h-4 w-1/3 rounded bg-accent/40 motion-safe:animate-pulse" />
              <span className="block h-3 w-3/4 rounded bg-accent/30 motion-safe:animate-pulse" />
              <span className="block h-3 w-20 rounded bg-accent/30 motion-safe:animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Row({ notification: n, onRead, onDelete }) {
  const meta = getTypeMeta(n.type);
  const Icon = meta.icon;

  const content = (
    <>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {!n.isRead && <span className="sr-only">Unread. </span>}
        <span className={`text-base ${n.isRead ? "font-medium" : "font-semibold"}`}>
          {n.title}
        </span>
        <span className="rounded-full bg-accent/40 px-2.5 py-0.5 text-xs text-secondary/75">
          {meta.label}
        </span>
      </span>
      <span className="mt-1 block leading-6 text-secondary/75">{n.message}</span>
      <time
        dateTime={n.createdAt}
        className="mt-2 block text-sm text-secondary/65"
      >
        {timeAgo(n.createdAt)}
      </time>
    </>
  );

  return (
    <li
      className={`flex items-start gap-4 px-5 py-5 transition ${
        n.isRead ? "" : "bg-accent/15"
      }`}
    >
      <span
        className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full ${meta.tint}`}
      >
        <Icon size={20} aria-hidden="true" />
        {!n.isRead && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#FDF8F1] bg-highlight"
          />
        )}
      </span>

      {isInternalLink(n.link) ? (
        <Link
          to={n.link}
          onClick={() => onRead(n._id)}
          className={`block min-w-0 flex-1 rounded-lg ${focusRing}`}
        >
          {content}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        {!n.isRead && (
          <IconButton label={`Mark "${n.title}" as read`} onClick={() => onRead(n._id)}>
            <Check size={18} aria-hidden="true" />
          </IconButton>
        )}
        <IconButton
          label={`Delete "${n.title}"`}
          onClick={() => onDelete(n._id)}
          danger
        >
          <Trash2 size={17} aria-hidden="true" />
        </IconButton>
      </div>
    </li>
  );
}

export default function NotificationList() {
  const {
    notifications,
    unreadCount,
    status,
    retry,
    markRead,
    markAllRead,
    remove,
    clearAll,
  } = useNotifications();

  const [tab, setTab] = useState("all");
  const [type, setType] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const typesPresent = useMemo(
    () => [...new Set(notifications.map((item) => item.type))],
    [notifications]
  );

  const activeType =
    type === "all" || typesPresent.includes(type) ? type : "all";

  const filtered = useMemo(
    () =>
      notifications.filter(
        (item) =>
          (tab === "all" || !item.isRead) &&
          (activeType === "all" || item.type === activeType)
      ),
    [notifications, tab, activeType]
  );

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((label) => ({
        label,
        items: filtered.filter((item) => dayGroup(item.createdAt) === label),
      })).filter((group) => group.items.length > 0),
    [filtered]
  );

  const resetFilters = () => {
    setTab("all");
    setType("all");
  };

  const showToolbar = status === "ready" && notifications.length > 0;

  let body;

  if (status === "idle" || status === "loading") {
    body = <Skeleton />;
  } else if (status === "error") {
    body = (
      <div role="alert">
        <State
          title="We couldn’t load your notifications"
          text="Check your connection and try again."
        >
          <button
            type="button"
            onClick={retry}
            className={`inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary ${focusRing}`}
          >
            Try again
          </button>
        </State>
      </div>
    );
  } else if (notifications.length === 0) {
    body = (
      <State
        title="You’re all caught up"
        text="New updates about your orders, payments and requests will appear here."
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <State title="Nothing here" text="No notifications match this filter.">
        <button
          type="button"
          onClick={resetFilters}
          className={`inline-flex h-11 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 ${focusRing}`}
        >
          Show all
        </button>
      </State>
    );
  } else {
    body = (
      <div>
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="bg-accent/20 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
              {group.label}
            </h2>
            <ul className="divide-y divide-accent/40">
              {group.items.map((item) => (
                <Row
                  key={item._id}
                  notification={item}
                  onRead={markRead}
                  onDelete={remove}
                />
              ))}
            </ul>
          </section>
        ))}

        {notifications.length >= 50 && (
          <p className="border-t border-accent/40 px-5 py-4 text-center text-sm text-secondary/65">
            Showing your latest 50 notifications.
          </p>
        )}
      </div>
    );
  }

  return (
    <section
      aria-label="Notifications"
      className="overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)]"
    >
      {showToolbar && (
        <div className="space-y-4 border-b border-accent/40 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Show notifications"
              className="flex gap-1 rounded-full bg-accent/30 p-1"
            >
              {[
                ["all", "All", notifications.length],
                ["unread", "Unread", unreadCount],
              ].map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={tab === value}
                  onClick={() => setTab(value)}
                  className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary ${
                    tab === value
                      ? "bg-[#FDF8F1] font-medium text-primary shadow-sm"
                      : "text-secondary/70 hover:text-primary"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 text-secondary/65">{count}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className={textButton}
              >
                <CheckCheck size={17} aria-hidden="true" />
                Mark all as read
              </button>

              {confirmClear ? (
                <span className="flex items-center gap-2 pl-2 text-sm">
                  Clear everything?
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(false);
                      clearAll();
                    }}
                    className={`h-9 rounded-full bg-[#9B2C1F] px-4 font-medium text-white transition hover:bg-[#7F2318] ${focusRing}`}
                  >
                    Yes, clear
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setConfirmClear(false)}
                    className={`h-9 rounded-full border border-accent px-4 font-medium text-primary transition hover:bg-accent/30 ${focusRing}`}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className={textButton}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {typesPresent.length > 1 && (
            <div
              role="group"
              aria-label="Filter by type"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              <Chip active={activeType === "all"} onClick={() => setType("all")}>
                All types
              </Chip>
              {typesPresent.map((value) => (
                <Chip
                  key={value}
                  active={activeType === value}
                  onClick={() => setType(value)}
                >
                  {typeLabel(value)}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {body}
    </section>
  );
}