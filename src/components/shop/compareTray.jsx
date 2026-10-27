import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { categories, formatPrice } from "../../data/products";

const rows = [
  ["Price", (p) => formatPrice(p.offerPrice ?? p.price)],
  ["Dimensions", (p) => `${p.dimensions.w} × ${p.dimensions.d} × ${p.dimensions.h} cm`],
  ["Material", (p) => p.material],
  ["Category", (p) => categories.find((c) => c.id === p.category)?.label],
  ["Rating", (p) => `${p.rating} (${p.reviewCount} reviews)`],
  ["Availability", (p) => (p.inStock ? "In stock" : "Out of stock")],
];

const imageOf = (p) => p.image ?? p.images?.[0];

export default function CompareTray({ items, onRemove, onClear }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
                key={p.id}
                type="button"
                onClick={() => onRemove(p)}
                title={`Remove ${p.name}`}
                aria-label={`Remove ${p.name} from comparison`}
                className="group relative h-11 w-11 overflow-hidden rounded-full bg-accent/40 ring-2 ring-background"
              >
                {imageOf(p) && (
                  <img src={imageOf(p)} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 grid place-items-center bg-secondary/60 text-background opacity-0 transition group-hover:opacity-100">
                  <X size={16} />
                </span>
              </button>
            ))}
          </div>

          <p className="hidden text-sm text-secondary/70 sm:block">
            <span className="font-semibold text-secondary">{items.length}/3</span>{" "}
            to compare
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
            disabled={items.length < 2}
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Scale size={16} />
            Compare
          </button>
        </div>
      </div>

      {/* Comparison modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Compare products"
          className="fixed inset-0 z-60 grid place-items-center p-4"
        >
          <button
            type="button"
            aria-label="Close comparison"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-secondary/50 backdrop-blur-sm"
          />

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-4xl bg-background p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl text-primary">Compare pieces</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30"
              >
                <X size={22} />
              </button>
            </div>

            <div
              className="grid gap-x-4"
              style={{
                gridTemplateColumns: `88px repeat(${items.length}, minmax(0, 1fr))`,
              }}
            >
              <div />
              {items.map((p) => (
                <div key={p.id} className="pb-4">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-accent/30">
                    {imageOf(p) && (
                      <img
                        src={imageOf(p)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-3 font-display text-lg leading-snug text-secondary">
                    {p.name}
                  </p>
                </div>
              ))}

              {rows.map(([label, getValue]) => (
                <div key={label} className="contents">
                  <p className="border-t border-accent/40 py-3 text-sm font-medium text-secondary/60">
                    {label}
                  </p>
                  {items.map((p) => (
                    <p
                      key={p.id}
                      className="border-t border-accent/40 py-3 text-sm text-secondary"
                    >
                      {getValue(p)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}