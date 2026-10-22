import { useState } from "react";
import { Bell, Heart, ShoppingBag, Menu, X } from "lucide-react";

const links = ["Home", "Products", "Consultation", "Custom Furniture", "About Us"];

const iconBtn =
  "relative h-11 w-11 place-items-center rounded-full text-secondary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary";

const shadow = "shadow-[0_8px_30px_rgba(113,62,38,0.08)]";

export default function Navbar({ cartCount = 0 }) {
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);

  return (
    <header className="relative mx-auto max-w-[1680px]">
      <div
        className={`flex h-20 items-center justify-between gap-3 rounded-4xl border border-accent/40 bg-background/90 py-2.5 pl-3 pr-3 backdrop-blur xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4 ${shadow}`}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 justify-self-start">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
            F
          </span>
          <span className="hidden font-display text-[22px] font-semibold text-primary min-[360px]:inline">
            Furniva
          </span>
        </a>

        <nav className="hidden rounded-full bg-accent/30 p-1 xl:flex">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => setActive(link)}
              className={`rounded-full px-4 py-2 font-medium text-[16px] transition ${
                active === link
                  ? "bg-background font-medium text-primary shadow-sm"
                  : "text-secondary/70 hover:text-primary"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

       
        <div className="flex items-center gap-1 justify-self-end">
          <button
            aria-label="Notifications"
            className={`${iconBtn} hidden sm:grid`}
          >
            <Bell size={21} />
          </button>

          <button aria-label="Wishlist" className={`${iconBtn} hidden sm:grid`}>
            <Heart size={21} />
          </button>

          <button
            aria-label={`Cart, ${cartCount} items`}
            className="ml-1 flex h-9 items-center gap-2 rounded-full bg-primary pl-3.5 pr-1.5 text-[14px] font-medium text-background transition hover:bg-primary/90"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Cart</span>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-highlight px-1 text-xs">
              {cartCount}
            </span>
          </button>

          <span className="mx-2 hidden h-6 w-px bg-accent sm:block" />

          <button className="hidden h-9 items-center rounded-full bg-primary px-3.5 text-[14px] font-medium text-background transition hover:bg-primary/90 sm:inline-flex">
            Sign up
          </button>

          {/* Menu button (below xl) */}
          <button
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={`${iconBtn} grid xl:hidden`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className={`absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-3xl border border-accent/40 bg-background p-3 xl:hidden ${shadow}`}
        >
          {links.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActive(link);
                setOpen(false);
              }}
              className={`rounded-2xl px-4 py-3 text-left text-[16px] ${
                active === link
                  ? "bg-accent/30 font-medium text-primary"
                  : "text-secondary/80"
              }`}
            >
              {link}
            </button>
          ))}

          <div className="mt-1 flex flex-col gap-1 border-t border-accent/40 pt-2 sm:hidden">
            <button className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80">
              <Bell size={20} /> Notifications
            </button>
            <button className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[16px] text-secondary/80">
              <Heart size={20} /> Wishlist
            </button>
            <button className="mt-1 rounded-2xl bg-primary px-4 py-3 text-[16px] font-medium text-background">
              Sign up
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}