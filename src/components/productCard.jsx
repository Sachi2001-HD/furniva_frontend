import { useState } from "react";
import {
  Heart,
  Plus,
  Star,
  ArrowUpRight,
  Scale,
  Check,
  Ruler,
  Armchair,
} from "lucide-react";

const formatPrice = (n) => `Rs. ${n.toLocaleString("en-US")}`;

const swatches = {
  Walnut: "#5a3825",
  "White Oak": "#c9ac80",
  Teak: "#b9703a",
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function Stars({ rating }) {
  const stars = [...Array(5)];
  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="flex gap-0.5 text-accent">
        {stars.map((_, i) => (
          <Star key={i} size={14} className="shrink-0 fill-current" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-highlight"
        style={{ width: `${(rating / 5) * 100}%` }}
      >
        {stars.map((_, i) => (
          <Star key={i} size={14} className="shrink-0 fill-current" />
        ))}
      </span>
    </span>
  );
}

export default function ProductCard({
  product,
  view = "grid", // "grid" | "list"
  showMeta = false, // material + dimensions line (shop page)
  saved, // pass to control the heart from outside (shop page)
  comparing = false,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare, // compare button appears only when provided
}) {
  const {
    name,
    description,
    price,
    offerPrice,
    rating = 0,
    reviewCount = 0,
    badge,
    material,
    dimensions,
    href = "#",
  } = product;

  // Works with static data (image) and API data (images[])
  const image = product.image ?? product.images?.[0];
  const inStock =
    product.inStock ?? (product.stock == null ? true : product.stock > 0);

  const [liked, setLiked] = useState(false);
  const isSaved = saved ?? liked;
  const isList = view === "list";

  const onOffer = offerPrice != null && offerPrice < price;
  const discount = onOffer ? Math.round((1 - offerPrice / price) * 100) : 0;

  const handleWishlist = () => {
    if (saved === undefined) setLiked(!liked);
    onToggleWishlist?.(product, !isSaved);
  };

  return (
    <article
      className={`group flex flex-col rounded-[28px] border border-accent/50 bg-white/70 p-3 shadow-[0_6px_24px_rgba(113,62,38,0.08)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(113,62,38,0.15)] ${
        isList ? "sm:flex-row sm:gap-4" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden rounded-[20px] bg-accent/30 ${
          isList ? "sm:min-h-52 sm:w-72 sm:shrink-0" : ""
        }`}
      >
        <a href={href} tabIndex={-1} aria-hidden="true" className="block h-full">
          {image ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              className={`aspect-5/4 w-full object-cover transition duration-500 motion-safe:group-hover:scale-105 ${
                isList ? "sm:aspect-auto sm:h-full" : ""
              }`}
            />
          ) : (
            <div
              className={`grid aspect-5/4 w-full place-items-center bg-[linear-gradient(135deg,#ecdcc4,#d2ba9e)] text-primary/35 ${
                isList ? "sm:aspect-auto sm:h-full" : ""
              }`}
            >
              <Armchair size={52} strokeWidth={1.2} />
            </div>
          )}
        </a>

        {!inStock && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/65">
            <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-background">
              Out of stock
            </span>
          </div>
        )}

        {(onOffer || badge) && (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {onOffer && (
              <span className="rounded-full bg-highlight px-3 py-1.5 text-xs font-semibold text-secondary shadow-sm">
                -{discount}%
              </span>
            )}
            {badge && (
              <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-secondary shadow-sm backdrop-blur-md">
                {badge}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? `Remove ${name} from wishlist`
              : `Add ${name} to wishlist`
          }
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/80 text-secondary shadow-sm backdrop-blur-md transition hover:bg-background ${focusRing}`}
        >
          <Heart
            size={19}
            className={isSaved ? "fill-primary text-primary" : ""}
          />
        </button>
      </div>

      {/* Details */}
      <div
        className={`mt-3.5 flex flex-1 flex-col px-1.5 pb-1 ${
          isList ? "sm:mt-0 sm:py-2 sm:pl-3 sm:pr-3" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl leading-snug">
            <a href={href} className={`hover:text-primary ${focusRing}`}>
              {name}
            </a>
          </h3>

          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold leading-snug">
              {formatPrice(onOffer ? offerPrice : price)}
            </p>
            {onOffer && (
              <s className="text-sm text-secondary/50">
                <span className="sr-only">Original price </span>
                {formatPrice(price)}
              </s>
            )}
          </div>
        </div>

        {showMeta && (material || dimensions) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-secondary/60">
            {material && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: swatches[material] ?? "#d2ba9e" }}
                />
                {material}
              </span>
            )}
            {dimensions && (
              <span className="flex items-center gap-1.5">
                <Ruler size={14} />
                {dimensions.w} × {dimensions.d} × {dimensions.h} cm
              </span>
            )}
          </p>
        )}

        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-secondary/60">
          {description}
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stars rating={rating} />
            <span className="text-sm text-secondary/60">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>

          <a
            href={href}
            className={`inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline ${focusRing}`}
          >
            See details
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            disabled={!inStock}
            onClick={() => onAddToCart?.(product)}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-medium text-background transition hover:bg-secondary motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            {inStock && <Plus size={18} />}
            {inStock ? "Add to cart" : "Out of stock"}
          </button>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(product)}
              aria-pressed={comparing}
              aria-label={`Compare ${name}`}
              title="Compare"
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${
                comparing
                  ? "border-primary bg-primary text-background"
                  : "border-accent/70 text-secondary/70 hover:border-primary hover:text-primary"
              } ${focusRing}`}
            >
              {comparing ? <Check size={18} /> : <Scale size={18} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}