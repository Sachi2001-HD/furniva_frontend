import { useState } from "react";
import {
  Bell,
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  LogOut,
  User,
  MapPin,
  ClipboardList,
  CalendarCheck,
  Palette,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const links = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Consultation", path: "/consultation" },
  { label: "Custom Furniture", path: "/custom-furniture" },
  { label: "About Us", path: "/about" },
];

const accountLinks = [
  { label: "My Profile", path: "/account", icon: User },
  { label: "My Addresses", path: "/account/addresses", icon: MapPin },
  { label: "My Orders", path: "/orders", icon: ClipboardList },
  {
    label: "My Consultations",
    path: "/my-consultations",
    icon: CalendarCheck,
  },
  {
    label: "My Custom Requests",
    path: "/my-custom-requests",
    icon: Palette,
  },
];

const iconBtn =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-secondary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary";

const shadow = "shadow-[0_8px_30px_rgba(113,62,38,0.08)]";

export default function CustomerNavbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const initial = user?.firstName?.charAt(0).toUpperCase() || "U";

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const go = (path) => {
    setOpen(false);
    setAccountOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    setAccountOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="relative mx-auto max-w-[1680px]">
      <div
        className={`flex h-20 items-center justify-between gap-3 rounded-4xl border border-accent/40 bg-background/90 py-2.5 pl-3 pr-3 backdrop-blur xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4 ${shadow}`}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            setOpen(false);
            setAccountOpen(false);
          }}
          className="flex items-center gap-2.5 justify-self-start"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
            F
          </span>

          <span className="hidden font-display text-[22px] font-semibold text-primary min-[360px]:inline">
            Furniva
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden rounded-full bg-accent/30 p-1 xl:flex">
          {links.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => go(path)}
              aria-current={isActive(path) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[16px] transition ${
                isActive(path)
                  ? "bg-background font-medium text-primary shadow-sm"
                  : "font-medium text-secondary/70 hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Customer Actions */}
        <div className="flex items-center gap-1 justify-self-end">
          <button
            aria-label="Search products"
            onClick={() => go("/products")}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Search size={21} />
          </button>

          <button
            aria-label="Notifications"
            onClick={() => go("/notifications")}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Bell size={21} />
          </button>

          <button
            aria-label="Wishlist"
            onClick={() => go("/wishlist")}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Heart size={21} />
          </button>

          <button
            aria-label={`Cart, ${cartCount} items`}
            onClick={() => go("/cart")}
            className="ml-1 flex h-9 items-center gap-2 rounded-full bg-primary pl-3.5 pr-1.5 text-[14px] font-medium text-background transition hover:bg-primary/90"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Cart</span>

            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-highlight px-1 text-xs">
              {cartCount}
            </span>
          </button>

          <span className="mx-2 hidden h-6 w-px bg-accent sm:block" />

          {/* My Account */}
          <button
            aria-label="My Account"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((previous) => !previous)}
            className="hidden h-9 items-center gap-2 rounded-full bg-accent/50 px-2 text-[14px] font-medium text-primary transition hover:bg-accent/70 sm:flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-background font-semibold">
              {initial}
            </span>
            <span className="hidden lg:inline">My Account</span>
            <ChevronDown
              size={15}
              className={`hidden transition-transform lg:block ${
                accountOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => {
              setOpen((previous) => !previous);
              setAccountOpen(false);
            }}
            className={`${iconBtn} xl:hidden`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* My Account Dropdown */}
      {accountOpen && (
        <div
          className={`absolute right-0 top-full z-30 mt-2 hidden w-64 rounded-3xl border border-accent/40 bg-background p-3 sm:block ${shadow}`}
        >
          <div className="border-b border-accent/40 px-3 pb-3 pt-1">
            <p className="font-medium text-primary">
              {user?.firstName || "My Account"}
            </p>
            {user?.email && (
              <p className="mt-1 break-all text-sm text-secondary/70">
                {user.email}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-1">
            {accountLinks.map(({ label, path, icon: Icon }) => (
              <button
                key={label}
                onClick={() => go(path)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] text-secondary/80 transition hover:bg-accent/30 hover:text-primary"
              >
                <Icon size={18} />
                {label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="mt-1 flex items-center gap-3 rounded-2xl border-t border-accent/40 px-3 py-3 text-left text-[14px] font-medium text-primary transition hover:bg-accent/30"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {open && (
        <nav
          className={`absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-3xl border border-accent/40 bg-background p-3 xl:hidden ${shadow}`}
        >
          {links.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => go(path)}
              aria-current={isActive(path) ? "page" : undefined}
              className={`rounded-2xl px-4 py-3 text-left text-[16px] ${
                isActive(path)
                  ? "bg-accent/30 font-medium text-primary"
                  : "text-secondary/80"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="mt-1 flex flex-col gap-1 border-t border-accent/40 pt-2 sm:hidden">
            <button
              onClick={() => go("/products")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <Search size={20} />
              Search Products
            </button>

            <button
              onClick={() => go("/notifications")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <Bell size={20} />
              Notifications
            </button>

            <button
              onClick={() => go("/wishlist")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <Heart size={20} />
              Wishlist
            </button>

            <button
              onClick={() => go("/cart")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <ShoppingBag size={20} />
              Cart ({cartCount})
            </button>

            <div className="mt-1 border-t border-accent/40 pt-2">
              <p className="px-4 py-2 text-sm font-semibold text-primary">
                My Account
              </p>

              {accountLinks.map(({ label, path, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => go(path)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80 transition hover:bg-accent/30"
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[16px] font-medium text-background"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
