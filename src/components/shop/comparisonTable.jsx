import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Armchair, Star, X } from "lucide-react";
import {
  dimensionsOf,
  formatPrice,
  idOf,
  imageOf,
  priceOf,
  stockState,
} from "../../utils/compare";

const stockLabel = {
  in: { text: "In stock", dot: "bg-[#4C8F5E]" },
  low: { text: "Low stock", dot: "bg-highlight" },
  out: { text: "Out of stock", dot: "bg-[#B5392B]" },
};

const tagClass =
  "ml-2 inline-flex rounded-full bg-highlight/25 px-2 py-0.5 text-xs font-medium text-[#7A4A12]";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Thumb({ product, className = "" }) {
  const src = imageOf(product);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center bg-accent/40 text-primary/50 ${className}`}
      >
        <Armchair size={22} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}

export default function ComparisonTable({
  items,
  currentId,
  onRemove,
  getLink,
}) {
  const prices = items.map(priceOf);
  const ratings = items.map((product) => Number(product.rating || 0));
  const lowestPrice = Math.min(...prices);
  const topRating = Math.max(...ratings);

  const tagPrice = items.length > 1 && new Set(prices).size > 1;
  const tagRating =
    items.length > 1 && topRating > 0 && new Set(ratings).size > 1;

  const rows = [
    {
      label: "Price",
      cell: (product) => {
        const price = priceOf(product);
        const onOffer =
          product.offerPrice != null &&
          Number(product.offerPrice) < Number(product.price);

        return (
          <>
            <span className="font-semibold">{formatPrice(price)}</span>
            {onOffer && (
              <s className="ml-2 text-secondary/55">
                <span className="sr-only">Original price </span>
                {formatPrice(product.price)}
              </s>
            )}
            {tagPrice && price === lowestPrice && (
              <span className={tagClass}>Lowest price</span>
            )}
          </>
        );
      },
    },
    { label: "Dimensions", cell: (product) => dimensionsOf(product) },
    { label: "Material", cell: (product) => product.material || "–" },
    { label: "Finish", cell: (product) => product.colour || "Natural finish" },
    {
      label: "Rating",
      cell: (product) => {
        const rating = Number(product.rating || 0);
        const count = Number(product.reviewCount || 0);

        if (!rating && !count) {
          return <span className="text-secondary/65">No reviews yet</span>;
        }

        return (
          <>
            <span className="inline-flex items-center gap-1">
              <Star
                size={14}
                aria-hidden="true"
                className="fill-highlight text-highlight"
              />
              {rating.toFixed(1)}
            </span>
            {count > 0 && <span className="text-secondary/65"> ({count})</span>}
            {tagRating && rating === topRating && (
              <span className={tagClass}>Top rated</span>
            )}
          </>
        );
      },
    },
    {
      label: "Availability",
      cell: (product) => {
        const state = stockLabel[stockState(product)];

        return (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${state.dot}`}
            />
            {state.text}
          </span>
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-136 table-fixed border-collapse text-left">
        <caption className="sr-only">
          Side-by-side comparison of {items.map((product) => product.name).join(", ")}
        </caption>

        <colgroup>
          <col className="w-28" />
          {items.map((product) => (
            <col key={idOf(product)} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <td />
            {items.map((product) => {
              const isCurrent = currentId && idOf(product) === currentId;

              return (
                <th
                  key={idOf(product)}
                  scope="col"
                  className="px-2 pb-4 align-top font-normal"
                >
                  <div className="relative">
                    <Thumb
                      product={product}
                      className="aspect-square w-full rounded-2xl"
                    />

                    {isCurrent && (
                      <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-background">
                        Viewing
                      </span>
                    )}

                    {onRemove && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => onRemove(product)}
                        aria-label={`Remove ${product.name} from the comparison`}
                        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-secondary shadow transition hover:bg-background ${focusRing}`}
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <p className="mt-3 font-display text-lg leading-snug text-secondary">
                    {getLink && !isCurrent ? (
                      <Link
                        to={getLink(product)}
                        className={`hover:text-primary hover:underline ${focusRing}`}
                      >
                        {product.name}
                      </Link>
                    ) : (
                      product.name
                    )}
                  </p>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-accent/40">
              <th
                scope="row"
                className="py-3.5 pr-3 text-left text-sm font-medium text-secondary/60"
              >
                {row.label}
              </th>

              {items.map((product) => (
                <td
                  key={idOf(product)}
                  className="px-2 py-3.5 align-top text-sm text-secondary"
                >
                  {row.cell(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}