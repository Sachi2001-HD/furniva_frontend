import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Armchair,
  ShoppingBag,
  TrendingUp,
  MessagesSquare,
  Star,
  LogOut,
  Search,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import NotificationMenu from "./notificationMenu";
import AccountMenu from "./accountMenu";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products & Inventory", icon: Armchair },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/sales", label: "Sales", icon: TrendingUp },
  { to: "/admin/requests", label: "Customer Requests", icon: MessagesSquare },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

const woodGrain = {
  backgroundColor: "#2B140C",
  backgroundImage: [
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px)",
    "repeating-linear-gradient(88deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 23px)",
    "repeating-linear-gradient(90deg, rgba(199,123,61,0.07) 0 3px, transparent 3px 41px)",
    "linear-gradient(180deg, #3A1D12 0%, #2B140C 55%, #22100A 100%)",
  ].join(","),
};

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-8 pb-8 pt-10">
        <Link to="/admin" onClick={onNavigate} className="block">
          <span className="block font-display text-4xl font-semibold text-highlight">
            Furniva
          </span>
          <span className="mt-2 block text-xs font-medium uppercase tracking-[0.3em] text-background/60">
            Admin workshop
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1.5 px-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[17px] transition focus-visible:outline-2 focus-visible:outline-highlight ${
                isActive
                  ? "bg-white/10 font-medium text-highlight"
                  : "text-background/80 hover:bg-white/5 hover:text-background"
              }`
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[17px] text-background/80 transition hover:bg-white/5 hover:text-background focus-visible:outline-2 focus-visible:outline-highlight"
        >
          <LogOut size={20} aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-secondary">
      {/* Desktop sidebar */}
      <aside
        style={woodGrain}
        className="hidden text-background lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72 xl:w-80"
      >
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-secondary/60"
          />
          <aside
            style={woodGrain}
            className="relative h-full w-72 max-w-[85%] text-background shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-background/80 hover:bg-white/10"
            >
              <X size={22} />
            </button>
            <SidebarContent
              onNavigate={() => setMenuOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72 xl:pl-80">
        <header className="flex items-start justify-between gap-4 border-b border-accent/50 px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/70 text-primary lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-secondary/70">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <label className="relative mr-1 hidden md:block">
              <span className="sr-only">Search</span>
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50"
              />
              <input
                type="search"
                placeholder="Search..."
                className="h-12 w-52 rounded-2xl border border-accent/60 bg-[#FDF8F1] pl-11 pr-4 text-base outline-none transition placeholder:text-secondary/50 focus:border-primary focus:ring-4 focus:ring-primary/15 xl:w-64"
              />
            </label>

            <NotificationMenu />

            <Link
              to="/admin/products/new"
              className="hidden h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:inline-flex"
            >
              <Plus size={18} aria-hidden="true" />
              Add product
            </Link>

            <AccountMenu user={user} onSwitchAccount={handleLogout} />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}