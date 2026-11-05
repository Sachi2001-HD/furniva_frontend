import { ShoppingBag } from "lucide-react";
import { useCart } from "../../context/cartContext";

export default function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-primary px-5 text-[15px] font-medium text-background shadow-[0_8px_20px_rgba(113,62,38,0.22)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <ShoppingBag size={19} aria-hidden="true" />
      Cart
      {itemCount > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-background px-1.5 text-xs font-semibold text-primary">
          {itemCount}
        </span>
      )}
    </button>
  );
}