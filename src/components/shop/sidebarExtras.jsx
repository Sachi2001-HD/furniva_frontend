import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Ruler, Star } from "lucide-react";

const formatPrice = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const tips = [
  "Delivery charges are confirmed at checkout.",
  "Every piece lists its dimensions, so you can check the fit.",
  "Press / anywhere to jump to the search box.",
  "Tap the heart to save a piece, then use “Saved pieces only”.",
];

function Thumb({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="h-16 w-16 shrink-0 rounded-2xl bg-accent/40"
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-16 w-16 shrink-0 rounded-2xl object-cover"
    />
  );
}

export default function SidebarExtras({ products }) {
  const picks = useMemo(() => {
    const time = (product) => new Date(product.createdAt || 0).getTime();

    return products
      .filter((product) => product.inStock)
      .sort(
        (a, b) =>
          Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
          b.rating - a.rating ||
          time(b) - time(a)
      )
      .slice(0, 4);
  }, [products]);

  return (
    <div className="mt-6 space-y-5">
      {/* Top picks */}
      {picks.length > 0 && (
        <section
          aria-labelledby="top-picks-heading"
          className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_6px_24px_rgba(113,62,38,0.06)]"
        >
          <h2
            id="top-picks-heading"
            className="font-display text-xl text-primary"
          >
            Top picks
          </h2>

          <ul className="mt-3 space-y-1">
            {picks.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/shop/${product.id}`}
                  className={`group flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-accent/30 ${focusRing}`}
                >
                  <Thumb src={product.images?.[0]} />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-secondary group-hover:text-primary">
                      {product.name}
                    </span>
                    <span className="block text-sm text-secondary/65">
                      {formatPrice(product.offerPrice ?? product.price)}
                    </span>
                    {product.rating > 0 && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-secondary/65">
                        <Star
                          size={12}
                          aria-hidden="true"
                          className="fill-highlight text-highlight"
                        />
                        {product.rating.toFixed(1)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Made to measure */}
      <section
        aria-labelledby="made-to-measure-heading"
        className="rounded-3xl border border-accent/50 bg-accent/25 p-5"
      >
        <div className="flex items-center gap-2">
          <Ruler size={20} aria-hidden="true" className="text-primary" />
          <h2
            id="made-to-measure-heading"
            className="font-display text-xl text-primary"
          >
            Made to measure
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-secondary/70">
          Can’t find the right size or finish? We can build a piece around your
          space.
        </p>

        <Link
          to="/custom-furniture"
          className={`mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-background ${focusRing}`}
        >
          Request custom furniture
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {/* Good to know */}
      <section aria-labelledby="good-to-know-heading" className="px-1">
        <h2
          id="good-to-know-heading"
          className="text-sm font-semibold text-secondary"
        >
          Good to know
        </h2>

        <ul className="mt-3 space-y-2.5">
          {tips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2.5 text-sm leading-5 text-secondary/70"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight"
              />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}