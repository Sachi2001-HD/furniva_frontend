import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const links = [
  { label: "Shop", to: "/shop" },
  { label: "Consultation", to: "/consultation" },
  { label: "Custom Furniture", to: "/custom-furniture" },
  { label: "About Us", to: "/about" },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight";

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export default function SmallFooter() {
  const backToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="mt-auto bg-secondary text-background">
      <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-7 px-4 py-8 sm:px-8 lg:flex-row lg:justify-between lg:gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/"
            className={`inline-flex items-center gap-2.5 rounded-full ${focusRing}`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-base font-semibold text-background">
              F
            </span>
            <span className="font-display text-xl font-semibold">Furniva</span>
          </Link>

          <p className="text-center text-sm text-background/65 sm:text-left">
            © {new Date().getFullYear()} Furniva. Crafted in wood.
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm">
            {links.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`rounded text-background/75 transition hover:text-background ${focusRing}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social and back to top */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            aria-label="Furniva on Instagram"
            className={`rounded text-highlight transition hover:text-background ${focusRing}`}
          >
            <svg {...iconProps}>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="Furniva on Facebook"
            className={`rounded text-highlight transition hover:text-background ${focusRing}`}
          >
            <svg {...iconProps}>
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={backToTop}
            aria-label="Back to top"
            className={`ml-2 grid h-10 w-10 place-items-center rounded-full border border-background/25 text-background/80 transition hover:border-background/60 hover:bg-white/10 hover:text-background ${focusRing}`}
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}