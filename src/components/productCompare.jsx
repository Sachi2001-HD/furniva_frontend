import { useEffect, useState } from "react";
import { Check, Scale } from "lucide-react";
import ComparisonTable, { Thumb } from "./shop/comparisonTable";
import { apiRequest } from "../utils/api";
import {
  categoryIdOf,
  categoryNameOf,
  formatPrice,
  idOf,
  priceOf,
} from "../utils/compare";

const MAX_EXTRA = 2;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function ProductCompare({ product, onAvailability }) {
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState("loading"); 
  const [selected, setSelected] = useState([]);

  const categoryName = categoryNameOf(product);
  const currentId = idOf(product);

  useEffect(() => {
    const categoryId = categoryIdOf(product);

    if (!categoryId) {
      setStatus("ready");
      onAvailability?.(false);
      return undefined;
    }

    let active = true;

    apiRequest(`/products?category=${categoryId}&limit=24`)
      .then((data) => {
        if (!active) return;

        const others = (data.products ?? []).filter(
          (item) => idOf(item) !== currentId
        );

        setOptions(others);
        setStatus("ready");
        onAvailability?.(others.length > 0);
      })
      .catch(() => {
        if (!active) return;

        setStatus("error");
        onAvailability?.(false);
      });

    return () => {
      active = false;
    };
  }, [product, currentId, onAvailability]);

  if (status !== "ready" || options.length === 0) return null;

  const full = selected.length >= MAX_EXTRA;

  const toggle = (id) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : previous.length >= MAX_EXTRA
          ? previous
          : [...previous, id]
    );

  const chosen = selected
    .map((id) => options.find((item) => idOf(item) === id))
    .filter(Boolean);

  const items = [product, ...chosen];

  return (
    <section
      id="compare"
      aria-labelledby="compare-heading"
      className="mt-20 scroll-mt-28"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Compare
          </p>

          <h2
            id="compare-heading"
            className="mt-3 font-display text-3xl tracking-tight sm:text-4xl"
          >
            {categoryName
              ? `Compare with other ${categoryName}`
              : "Compare with similar pieces"}
          </h2>

          <p className="mt-2 text-secondary/70">
            Pick up to {MAX_EXTRA} pieces to see how they measure up against
            the {product.name}.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p aria-live="polite" className="text-sm text-secondary/65">
            {chosen.length} of {MAX_EXTRA} selected
          </p>

          {chosen.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className={`rounded text-sm font-medium text-primary hover:underline ${focusRing}`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Pieces to pick from */}
      <ul
        aria-label={`Other pieces to compare`}
        className="mt-8 flex snap-x gap-4 overflow-x-auto p-1 pb-3"
      >
        {options.map((item) => {
          const id = idOf(item);
          const picked = selected.includes(id);
          const blocked = !picked && full;

          return (
            <li key={id} className="w-56 shrink-0 snap-start">
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={picked}
                disabled={blocked}
                className={`w-full rounded-3xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                  picked
                    ? "border-primary bg-accent/25 shadow-sm"
                    : "border-accent/60 bg-white/60 hover:border-primary/50"
                }`}
              >
                <span className="relative block overflow-hidden rounded-2xl bg-accent/30">
                  <Thumb
                    product={item}
                    className="aspect-4/3 w-full rounded-2xl"
                  />

                  <span
                    aria-hidden="true"
                    className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full shadow-sm ${
                      picked
                        ? "bg-primary text-background"
                        : "bg-background/90 text-primary"
                    }`}
                  >
                    {picked ? <Check size={15} /> : <Scale size={14} />}
                  </span>
                </span>

                <span className="mt-3 block truncate font-medium">
                  {item.name}
                </span>

                <span className="mt-0.5 flex items-center justify-between gap-2 text-sm text-secondary/70">
                  <span>{formatPrice(priceOf(item))}</span>
                  <span className={picked ? "font-medium text-primary" : ""}>
                    {picked ? "Added" : blocked ? "Limit reached" : "Compare"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Comparison */}
      <div className="mt-6 rounded-[28px] border border-accent/50 bg-[#FDF8F1] p-4 shadow-[0_10px_30px_rgba(113,62,38,0.08)] sm:p-6">
        {chosen.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/40 text-primary">
              <Scale size={22} aria-hidden="true" />
            </span>

            <p className="mt-4 font-display text-xl">
              Choose a piece above to start
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-secondary/65">
              We’ll line up price, size, materials and ratings next to the{" "}
              {product.name}.
            </p>
          </div>
        ) : (
          <ComparisonTable
            items={items}
            currentId={currentId}
            onRemove={(item) => toggle(idOf(item))}
            getLink={(item) => `/shop/${idOf(item)}`}
          />
        )}
      </div>
    </section>
  );
}