import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Scale, X } from "lucide-react";
import ComparisonTable, { Thumb } from "./comparisonTable";
import {
  categoryIdOf,
  categoryNameOf,
  formatPrice,
  idOf,
  imageOf,
  priceOf,
  stockState,
} from "../../utils/compare";

const MAX_ITEMS = 3;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function CompareTray({
  items,
  catalog = [],
  onAdd,
  onRemove,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  const first = items[0];
  const categoryId = first ? categoryIdOf(first) : "";
  const categoryName = first ? categoryNameOf(first) : "";
  const full = items.length >= MAX_ITEMS;

  const candidates = useMemo(() => {
    const picked = new Set(items.map(idOf));

    return catalog.filter(
      (product) =>
        categoryIdOf(product) === categoryId && !picked.has(idOf(product))
    );
  }, [catalog, items, categoryId]);

  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating tray */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-accent/50 bg-background/95 py-2 pl-3 pr-2 shadow-[0_20px_50px_rgba(40,21,14,0.25)] backdrop-blur">
          <div className="flex -space-x-2">
            {items.map((p) => (
              <button
                key={idOf(p)}
                type="button"
                onClick={() => onRemove(p)}
                title={`Remove ${p.name}`}
                aria-label={`Remove ${p.name} from comparison`}
                className="group relative h-11 w-11 overflow-hidden rounded-full bg-accent/40 ring-2 ring-background"
              >
                {imageOf(p) && (
                  <img
                    src={imageOf(p)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center bg-secondary/60 text-background opacity-0 transition group-hover:opacity-100">
                  <X size={16} />
                </span>
              </button>
            ))}
          </div>

          <p className="hidden text-sm text-secondary/70 sm:block">
            <span className="font-semibold text-secondary">
              {items.length}/{MAX_ITEMS}
            </span>{" "}
            {categoryName || "to compare"}
          </p>

          <button
            type="button"
            onClick={onClear}
            className="px-2 text-sm text-secondary/60 hover:text-primary"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-background transition hover:bg-secondary"
          >
            <Scale size={16} />
            {items.length < 2 ? "Pick another" : "Compare"}
          </button>
        </div>
      </div>

      {/* Comparison window */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
          className="fixed inset-0 z-60 grid place-items-center p-4"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close comparison"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-secondary/50 backdrop-blur-sm"
          />

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-4xl bg-background p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="compare-title"
                  className="font-display text-3xl text-primary"
                >
                  Compare {categoryName || "pieces"}
                </h2>
                <p className="mt-1 text-sm text-secondary/65">
                  Pick up to {MAX_ITEMS} pieces from the same category to see
                  them side by side.
                </p>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-accent/30 ${focusRing}`}
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-6">
              {items.length >= 2 ? (
                <ComparisonTable items={items} onRemove={onRemove} />
              ) : (
                <div className="rounded-3xl border border-dashed border-accent/70 bg-accent/10 px-6 py-8 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/40 text-primary">
                    <Scale size={22} aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-display text-xl">
                    Choose one more to start comparing
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-secondary/65">
                    Pick another piece from{" "}
                    {categoryName || "the same category"} below to line it up
                    with the {first.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Same-category picker */}
            {onAdd && (
              <section
                aria-labelledby="compare-more-heading"
                className="mt-8 border-t border-accent/40 pt-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3
                    id="compare-more-heading"
                    className="font-display text-xl text-primary"
                  >
                    More in {categoryName || "this category"}
                  </h3>
                  <p className="text-sm text-secondary/65">
                    {full
                      ? `You’ve picked ${MAX_ITEMS}. Remove one to add another.`
                      : `${candidates.length} to choose from`}
                  </p>
                </div>

                {candidates.length === 0 ? (
                  <p className="mt-4 text-sm text-secondary/65">
                    There are no other pieces in{" "}
                    {categoryName || "this category"} to compare yet.
                  </p>
                ) : (
                  <ul className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                    {candidates.map((p) => (
                      <li key={idOf(p)}>
                        <button
                          type="button"
                          onClick={() => onAdd(p)}
                          disabled={full}
                          aria-label={`Add ${p.name} to the comparison`}
                          className={`flex w-full items-center gap-3 rounded-2xl border border-accent/60 bg-white/60 p-2.5 text-left transition hover:border-primary/50 hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >
                          <Thumb
                            product={p}
                            className="h-14 w-14 rounded-xl"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-secondary">
                              {p.name}
                            </span>
                            <span className="block text-sm text-secondary/70">
                              {formatPrice(priceOf(p))}
                              {stockState(p) === "out" && " · Out of stock"}
                            </span>
                          </span>

                          <span
                            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ${
                              full
                                ? "bg-accent text-secondary/60"
                                : "bg-primary text-background"
                            }`}
                          >
                            <Plus size={14} aria-hidden="true" />
                            Add
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}