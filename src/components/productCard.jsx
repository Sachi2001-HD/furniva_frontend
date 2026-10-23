import { useState } from "react";
import { Heart, Plus, Star, ArrowUpRight } from "lucide-react";

const formatPrice = (n) => `Rs. ${n.toLocaleString("en-US")}`;

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
  onAddToCart,
  onToggleWishlist,
}) {
  const {
    name,
    description,
    price,
    offerPrice,
    rating = 0,
    reviewCount = 0,
    image,
    href = "#",
  } = product;

  const [liked, setLiked] = useState(false);

  const onOffer = offerPrice != null && offerPrice < price;
  const discount = onOffer ? Math.round((1 - offerPrice / price) * 100) : 0;

  const handleWishlist = () => {
    setLiked(!liked);
    onToggleWishlist?.(product, !liked);
  };

  return (
    <article className="group flex flex-col rounded-[28px] border border-accent/50 bg-white/70 p-3 shadow-[0_6px_24px_rgba(113,62,38,0.08)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(113,62,38,0.15)]">
      {/* Image */}
      <div className="relative overflow-hidden rounded-[20px] bg-accent/30">
        <a href={href} tabIndex={-1} aria-hidden="true" className="block">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="aspect-5/4 w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
          />
        </a>

        {onOffer && (
          <span className="absolute left-3 top-3 rounded-full bg-highlight px-3 py-1.5 text-xs font-semibold text-secondary shadow-sm">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={liked}
          aria-label={
            liked ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`
          }
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/80 text-secondary shadow-sm backdrop-blur-md transition hover:bg-background ${focusRing}`}
        >
          <Heart
            size={19}
            className={liked ? "fill-primary text-primary" : ""}
          />
        </button>
      </div>

      {/* Details */}
      <div className="mt-3.5 flex flex-1 flex-col px-1.5 pb-1">
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

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-medium text-background transition hover:bg-secondary motion-safe:active:scale-[0.98] ${focusRing}`}
          >
            <Plus size={18} />
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}