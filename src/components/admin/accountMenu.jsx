import { Link } from "react-router-dom";
import { ChevronDown, Settings, Store, ArrowLeftRight } from "lucide-react";
import useDropdown from "./useDropdown";

const itemClass =
  "flex w-full items-center gap-3 px-5 py-3 text-left text-[15px] transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

function Avatar({ user, className = "" }) {
  const initial = (user?.firstName?.[0] || "A").toUpperCase();

  if (user?.image) {
    return (
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full bg-primary font-display font-semibold text-background ${className}`}
    >
      {initial}
    </span>
  );
}

export default function AccountMenu({ user, onSwitchAccount }) {
  const { open, setOpen, ref, buttonRef } = useDropdown();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="account-panel"
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Avatar user={user} className="h-12 w-12 text-lg" />
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`hidden text-secondary/60 transition sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="account-panel"
          className="absolute right-0 top-full z-40 mt-3 w-72 overflow-hidden rounded-2xl border border-accent/50 bg-[#FDF8F1] shadow-[0_20px_50px_rgba(113,62,38,0.25)]"
        >
          <div className="flex items-center gap-3 border-b border-accent/40 bg-accent/25 px-5 py-4">
            <Avatar user={user} className="h-12 w-12 shrink-0 text-lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{name}</p>
              {user?.email && (
                <p className="truncate text-sm text-secondary/70">
                  {user.email}
                </p>
              )}
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                {user?.role === "admin" ? "Administrator" : user?.role || "Admin"}
              </span>
            </div>
          </div>

          <div className="py-1.5">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Store size={18} aria-hidden="true" className="text-primary" />
              View store
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Settings size={18} aria-hidden="true" className="text-primary" />
              Settings
            </Link>
          </div>

          <div className="border-t border-accent/40 py-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSwitchAccount?.();
              }}
              className={itemClass}
            >
              <ArrowLeftRight
                size={18}
                aria-hidden="true"
                className="text-primary"
              />
              <span>
                <span className="block">Switch account</span>
                <span className="block text-xs text-secondary/60">
                  Sign in with a different account
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}