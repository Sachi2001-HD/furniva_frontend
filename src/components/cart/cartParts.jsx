import { useState } from "react";
import { Armchair, Minus, Plus } from "lucide-react";
import { optimizeImage } from "../../utils/cloudinary";
import { formatMoney, sellingPrice } from "../../utils/format";

export function Thumb({ src, className = "h-20 w-20", dim = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-2xl bg-accent/40 text-primary/60 ${className}`}
      >
        <Armchair size={24} />
      </span>
    );
  }

  return (
    <img
      src={optimizeImage(src, 300)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-2xl object-cover ${dim ? "opacity-50" : ""} ${className}`}
    />
  );
}

export function QuantityStepper({ value, max, onChange, label, disabled = false }) {
  const atMax = max != null && value >= max;
  const button =
    "grid h-9 w-9 place-items-center text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center overflow-hidden rounded-xl border border-accent/70 bg-background"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label={`Decrease quantity of ${label}`}
        className={button}
      >
        <Minus size={15} aria-hidden="true" />
      </button>

      <output
        aria-live="polite"
        className="grid h-9 min-w-10 place-items-center border-x border-accent/70 px-2 text-[15px] font-medium"
      >
        {value}
      </output>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || atMax}
        aria-label={`Increase quantity of ${label}`}
        title={atMax ? "That’s the most you can add" : undefined}
        className={button}
      >
        <Plus size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function LinePrice({ item, quantity = item.quantity }) {
  const onOffer = item.offerPrice != null && item.offerPrice < item.price;

  return (
    <div className="text-right">
      <p className="font-medium">{formatMoney(sellingPrice(item) * quantity)}</p>
      {onOffer && (
        <s className="text-sm text-secondary/60">
          <span className="sr-only">Original price </span>
          {formatMoney(item.price * quantity)}
        </s>
      )}
    </div>
  );
}