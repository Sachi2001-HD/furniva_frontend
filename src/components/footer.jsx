const explore = ["Home", "Shop Products", "Custom Furniture", "Consultation"];
const care = ["Contact Us", "FAQs", "Delivery Information", "Returns & Refunds"];

const linkClass =
  "text-background/70 transition hover:text-background focus-visible:text-background focus-visible:outline-2 focus-visible:outline-highlight";

export default function Footer() {
  return (
    <footer className="bg-secondary text-background">
      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-8 sm:px-8 lg:pt-20">
        
        {/* Brand */}
        <div>
          <a href="/" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
              F
            </span>
            <span className="font-display text-2xl font-semibold">Furniva</span>
          </a>
          <p className="mt-4 max-w-3xl font-display text-xl leading-tight sm:text-4xl lg:text-5xl">
            Stylish Furniture for <em className="text-primary">Every Space</em>
          </p>
        </div>

        {/* Columns */}
        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-[1fr_1fr_1.6fr]">
          <div className="border-t border-primary pt-8">
            <h3 className="font-display text-2xl">Explore</h3>
            <ul className="mt-5 space-y-2 text-lg">
              {explore.map((item) => (
                <li key={item}>
                  <a href="#" className={linkClass}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-primary pt-8">
            <h3 className="font-display text-2xl">Customer Care</h3>
            <ul className="mt-5 space-y-2 text-lg">
              {care.map((item) => (
                <li key={item}>
                  <a href="#" className={linkClass}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-primary pt-8 sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-2xl">Stay inspired</h3>
            <p className="mt-5 max-w-md text-lg text-background/70">
              Get updates on new collections and furniture ideas.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email address"
                className="h-12 w-full flex-1 rounded-full border border-background/25 bg-background/5 px-5 text-base text-background outline-none placeholder:text-background/50 focus:border-highlight"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-highlight px-7 text-base font-medium text-secondary transition hover:bg-highlight/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col-reverse gap-5 border-t border-primary pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Furniva. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-highlight">
            <a
              href="#"
              aria-label="Instagram"
              className="transition hover:text-background"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="transition hover:text-background"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}