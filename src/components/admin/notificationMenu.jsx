import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ShoppingBag, Package, MessagesSquare, Star } from "lucide-react";
import useDropdown from "./useDropdown";

const iconBtn =
  "relative grid h-12 w-12 place-items-center rounded-full border border-accent/60 bg-[#FDF8F1] text-secondary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary";

// Sample notifications
const sample = [
  {
    id: 1,
    icon: ShoppingBag,
    title: "New order #ORD1025",
    detail: "N. Perera placed an order for Rs. 128,000",
    time: "5 min ago",
    to: "/admin/orders",
    read: false,
  },
  {
    id: 2,
    icon: Package,
    title: "Low stock",
    detail: "Galle Queen Bed has 3 left",
    time: "1 hour ago",
    to: "/admin/products",
    read: false,
  },
  {
    id: 3,
    icon: MessagesSquare,
    title: "New consultation request",
    detail: "S. Fernando asked for a consultation",
    time: "3 hours ago",
    to: "/admin/requests",
    read: false,
  },
  {
    id: 4,
    icon: Star,
    title: "New review",
    detail: "K. Fernando left a 5-star review",
    time: "Yesterday",
    to: "/admin/reviews",
    read: true,
  },
];

export default function NotificationMenu({ initial = sample }) {
  const { open, setOpen, ref, buttonRef } = useDropdown();
  const [items, setItems] = useState(initial);

  const unread = items.filter((item) => !item.read).length;

  const markAllRead = () =>
    setItems((previous) => previous.map((item) => ({ ...item, read: true })));

  const openItem = (id) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="notifications-panel"
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        onClick={() => setOpen(!open)}
        className={iconBtn}
      >
        <Bell size={21} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-highlight px-1 text-[11px] font-semibold text-secondary"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-panel"
          className="fixed inset-x-4 top-24 z-40 overflow-hidden rounded-2xl border border-accent/50 bg-[#FDF8F1] shadow-[0_20px_50px_rgba(113,62,38,0.25)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
        >
          <div className="flex items-center justify-between gap-4 border-b border-accent/40 bg-accent/25 px-5 py-4">
            <h2 className="font-display text-xl">Notifications</h2>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <ul className="max-h-96 divide-y divide-accent/40 overflow-y-auto">
            {items.map(({ id, icon: Icon, title, detail, time, to, read }) => (
              <li key={id}>
                <Link
                  to={to}
                  onClick={() => openItem(id)}
                  className={`flex items-start gap-3 px-5 py-4 transition hover:bg-accent/25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                    read ? "" : "bg-accent/15"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/50 text-primary">
                    <Icon size={18} aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">
                      {title}
                    </span>
                    <span className="block text-sm text-secondary/70">
                      {detail}
                    </span>
                    <span className="mt-1 block text-xs text-secondary/60">
                      {time}
                    </span>
                  </span>

                  {!read && (
                    <>
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-highlight"
                      />
                      <span className="sr-only">Unread</span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}