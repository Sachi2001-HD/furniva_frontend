import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Info, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../../context/cartContext";
import { formatMoney } from "../../utils/format";
import { LinePrice, QuantityStepper, Thumb } from "./cartParts";

const LOW_STOCK = 5;

function RemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#9B2C1F] transition hover:bg-[#9B2C1F]/10 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}

function LineRow({ item, onClose, onQuantity, onRemove, onRetry }) {
  if (item.status === "loading") {
    return (
      <li aria-hidden="true" className="flex gap-4 py-5">
        <span className="h-24 w-24 shrink-0 rounded-2xl bg-accent/40 motion-safe:animate-pulse" />
        <div className="flex-1 space-y-3">
          <span className="block h-4 w-2/3 rounded bg-accent/40 motion-safe:animate-pulse" />
          <span className="block h-3 w-1/3 rounded bg-accent/30 motion-safe:animate-pulse" />
        </div>
      </li>
    );
  }

  if (item.status === "error") {
    return (
      <li className="flex items-center justify-between gap-3 py-5">
        <p className="text-sm text-secondary/70">We couldn’t load this item.</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="h-9 rounded-full border border-accent px-4 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Try again
          </button>
          <RemoveButton label="Remove this item from cart" onClick={() => onRemove(item.id)} />
        </div>
      </li>
    );
  }

  if (item.status === "unavailable") {
    return (
      <li className="flex gap-4 py-5">
        <Thumb src={item.image} dim className="h-24 w-24" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{item.name || "This product"}</p>
            <RemoveButton
              label={`Remove ${item.name || "this product"} from cart`}
              onClick={() => onRemove(item.id)}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-[#9B2C1F]">
            No longer available. Please remove it to continue.
          </p>
        </div>
      </li>
    );
  }

  const meta = [item.material, item.colour].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-4 py-5">
      <Thumb src={item.image} className="h-24 w-24" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${item.id}`}
              onClick={onClose}
              className="line-clamp-2 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {item.name}
            </Link>
            {meta && (
              <p className="mt-0.5 truncate text-sm text-secondary/65">{meta}</p>
            )}
          </div>
          <RemoveButton
            label={`Remove ${item.name} from cart`}
            onClick={() => onRemove(item.id)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            max={item.max}
            label={item.name}
            onChange={(next) => onQuantity(item.id, next)}
          />
          <LinePrice item={item} />
        </div>

        {item.stock <= LOW_STOCK && (
          <p className="mt-2 text-sm font-medium text-[#8A4B12]">
            Only {item.stock} left
          </p>
        )}

        {item.notice && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#8A4B12]">
            <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            {item.notice}
          </p>
        )}
      </div>
    </li>
  );
}

function DrawerPanel() {
  const navigate = useNavigate();
  const {
    items,
    readyItems,
    itemCount,
    subtotal,
    savings,
    hasUnavailable,
    hasPending,
    refreshing,
    closeCart,
    setQuantity,
    removeItem,
    refresh,
  } = useCart();

  const panelRef = useRef(null);
  const closeRef = useRef(closeCart);
  closeRef.current = closeCart;
  const [shown, setShown] = useState(false);

  // Fresh prices and stock every time the cart opens
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector("button")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const goCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <div
      className="fixed inset-0 z-80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={closeCart}
        className="absolute inset-0 bg-secondary/60"
      />

      <aside
        ref={panelRef}
        aria-busy={refreshing}
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#FDF8F1] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div>
            <h2 id="cart-title" className="font-display text-2xl">
              Your cart
            </h2>
            <p className="mt-0.5 text-sm text-secondary/65" role="status">
              {refreshing
                ? "Checking the latest prices..."
                : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-secondary/70 transition hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-8 py-16 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
                <ShoppingBag size={28} aria-hidden="true" />
              </span>
              <p className="mt-6 font-display text-2xl">Your cart is empty</p>
              <p className="mx-auto mt-2 max-w-xs text-secondary/70">
                Pieces you add will wait for you here.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Browse the shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-accent/40 overflow-y-auto px-6">
              {items.map((item) => (
                <LineRow
                  key={item.id}
                  item={item}
                  onClose={closeCart}
                  onQuantity={setQuantity}
                  onRemove={removeItem}
                  onRetry={refresh}
                />
              ))}
            </ul>

            <div className="border-t border-accent/50 bg-[#FDF8F1] px-6 py-5">
              {savings > 0 && (
                <p className="mb-2 text-sm text-[#2F5D3A]">
                  You’re saving {formatMoney(savings)} with offers
                </p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="text-lg">Subtotal</span>
                <span className="font-display text-3xl">{formatMoney(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-secondary/65">
                Delivery and payment details come next.
              </p>

              {hasUnavailable && (
                <p role="alert" className="mt-3 text-sm text-[#9B2C1F]">
                  Remove the unavailable items to continue.
                </p>
              )}

              <button
                type="button"
                onClick={goCheckout}
                disabled={readyItems.length === 0 || hasUnavailable || hasPending}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Checkout
                <ArrowRight size={18} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-accent text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// Mounted only while open
export default function CartDrawer() {
  const { drawerOpen } = useCart();
  return drawerOpen ? <DrawerPanel /> : null;
}