import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import useDropdown from "./admin/useDropdown";
import { useNotifications } from "../context/notificationContext";
import { useAuth } from "../context/authContext";
import {
  getTypeMeta,
  isInternalLink,
  timeAgo,
} from "../utils/notifications";

const RECENT = 6;

const buttonStyles = {
  plain: "h-11 w-11 text-secondary hover:bg-accent/30",
  outlined:
    "h-12 w-12 border border-accent/60 bg-[#FDF8F1] text-secondary hover:bg-accent/30",
};

function MenuRow({ notification: n, onOpen }) {
  const meta = getTypeMeta(n.type);
  const Icon = meta.icon;

  const className = `flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-accent/25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
    n.isRead ? "" : "bg-accent/15"
  }`;

  const inner = (
    <>
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${meta.tint}`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] ${
            n.isRead ? "font-medium" : "font-semibold"
          }`}
        >
          {!n.isRead && <span className="sr-only">Unread. </span>}
          {n.title}
        </span>

        <span className="line-clamp-2 text-sm text-secondary/70">
          {n.message}
        </span>

        <span className="mt-1 block text-xs text-secondary/60">
          {timeAgo(n.createdAt)}
        </span>
      </span>

      {!n.isRead && (
        <span
          aria-hidden="true"
          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-highlight"
        />
      )}
    </>
  );

  return isInternalLink(n.link) ? (
    <Link
      to={n.link}
      onClick={() => onOpen(n, true)}
      className={className}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => onOpen(n, false)}
      className={className}
    >
      {inner}
    </button>
  );
}

function MenuSkeleton() {
  return (
    <ul aria-hidden="true" className="divide-y divide-accent/40">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-start gap-3 px-5 py-4">
          <span className="h-10 w-10 rounded-full bg-accent/40 motion-safe:animate-pulse" />

          <div className="flex-1 space-y-2">
            <span className="block h-4 w-1/2 rounded bg-accent/40 motion-safe:animate-pulse" />
            <span className="block h-3 w-3/4 rounded bg-accent/30 motion-safe:animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function NotificationMenu({
  viewAllPath,
  variant = "plain",
}) {
  const { open, setOpen, ref, buttonRef } = useDropdown();

  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    status,
    refresh,
    retry,
    markRead,
    markAllRead,
  } = useNotifications();

  const notificationPath =
    viewAllPath ||
    (user?.role === "admin"
      ? "/admin/notifications"
      : "/notifications");

  const recent = notifications.slice(0, RECENT);
  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  const toggle = () => {
    if (!open) refresh();
    setOpen(!open);
  };

  const openItem = (notification, navigates) => {
    markRead(notification._id);

    if (navigates) {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="notifications-panel"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={toggle}
        className={`relative grid shrink-0 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-primary ${
          buttonStyles[variant] || buttonStyles.plain
        }`}
      >
        <Bell size={21} aria-hidden="true" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-highlight px-1 text-[11px] font-semibold text-secondary"
          >
            {badge}
          </span>
        )}
      </button>

      <span className="sr-only" aria-live="polite">
        {unreadCount > 0
          ? `${unreadCount} unread notifications`
          : ""}
      </span>

      {open && (
        <div
          id="notifications-panel"
          className="fixed inset-x-4 top-24 z-40 overflow-hidden rounded-2xl border border-accent/50 bg-[#FDF8F1] shadow-[0_20px_50px_rgba(113,62,38,0.25)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-104"
        >
          <div className="flex items-center justify-between gap-3 border-b border-accent/40 bg-accent/25 px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl">
                Notifications
              </h2>

              {unreadCount > 0 && (
                <span className="rounded-full bg-highlight/25 px-2.5 py-0.5 text-xs font-medium text-[#7A4A12]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          {status === "loading" || status === "idle" ? (
            <MenuSkeleton />
          ) : status === "error" ? (
            <div role="alert" className="px-5 py-10 text-center">
              <p className="font-medium">
                We couldn’t load your notifications
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try again
              </button>
            </div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/40 text-primary">
                <Bell size={22} aria-hidden="true" />
              </span>

              <p className="mt-4 font-medium">
                You’re all caught up
              </p>

              <p className="mt-1 text-sm text-secondary/65">
                New updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-104 divide-y divide-accent/40 overflow-y-auto">
              {recent.map((notification) => (
                <li key={notification._id}>
                  <MenuRow
                    notification={notification}
                    onOpen={openItem}
                  />
                </li>
              ))}
            </ul>
          )}

          <Link
            to={notificationPath}
            onClick={() => setOpen(false)}
            className="block border-t border-accent/40 px-5 py-3.5 text-center text-sm font-medium text-primary transition hover:bg-accent/25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
