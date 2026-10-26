
import { useState } from "react";
import { Heart, ShoppingBag, Menu, X, Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const links = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Consultation", path: "/consultation" },
  { label: "Custom Furniture", path: "/custom-furniture" },
  { label: "About Us", path: "/about" },
];

const iconBtn =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-secondary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary";

const shadow = "shadow-[0_8px_30px_rgba(113,62,38,0.08)]";

export default function GuestNavbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const goToSignup = (destination = location.pathname) => {
    setOpen(false);
    navigate("/signup", {
      state: { from: destination },
    });
  };

  return (
    <header className="relative mx-auto max-w-[1680px]">
      <div
        className={`flex h-20 items-center justify-between gap-3 rounded-4xl border border-accent/40 bg-background/90 py-2.5 pl-3 pr-3 backdrop-blur xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4 ${shadow}`}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
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

        {/* Actions */}
        <div className="flex items-center gap-1 justify-self-end">
          <button
            aria-label="Search products"
            onClick={() => go("/products")}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Search size={21} />
          </button>

          <button
            aria-label="Wishlist"
            onClick={() => goToSignup("/wishlist")}
            className={`${iconBtn} hidden sm:grid`}
          >
            <Heart size={21} />
          </button>

          <button
            aria-label="Cart"
            onClick={() => goToSignup("/cart")}
            className="ml-1 flex h-9 items-center gap-2 rounded-full bg-primary pl-3.5 pr-1.5 text-[14px] font-medium text-background transition hover:bg-primary/90"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Cart</span>

            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-highlight px-1 text-xs">
              {cartCount}
            </span>
          </button>

          <span className="mx-2 hidden h-6 w-px bg-accent sm:block" />

          {/* Sign Up */}
          <button
            onClick={() => goToSignup()}
            className="hidden h-9 items-center rounded-full bg-primary px-3.5 text-[14px] font-medium text-background transition hover:bg-primary/90 sm:inline-flex"
          >
            Sign Up
          </button>

          {/* Mobile Menu Toggle */}
          <button
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
            className={`${iconBtn} xl:hidden`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

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
              onClick={() => goToSignup("/wishlist")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <Heart size={20} />
              Wishlist
            </button>

            <button
              onClick={() => goToSignup("/cart")}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80"
            >
              <ShoppingBag size={20} />
              Cart
            </button>

            <button
              onClick={() => goToSignup()}
              className="mt-1 rounded-2xl bg-primary px-4 py-3 text-[16px] font-medium text-background"
            >
              Sign Up
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
