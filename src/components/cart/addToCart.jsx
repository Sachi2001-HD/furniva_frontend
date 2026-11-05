import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/cartContext";
import { MAX_PER_PRODUCT } from "../../utils/cart";
import { QuantityStepper } from "./cartParts";

export default function AddToCart({ product, compact = false }) {
  const { items, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");

  const id = product._id ?? product.id;
  const stock = product.stock ?? 0;
  const cap = Math.min(stock, MAX_PER_PRODUCT);
  const inCart = items.find((line) => line.id === id)?.quantity ?? 0;
  const room = cap - inCart; 
  const soldOut = stock <= 0;
  const maxed = !soldOut && room <= 0;
  const qty = Math.min(quantity, Math.max(room, 1));

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(timer);
  }, [added]);

  const handleAdd = () => {
    const result = addItem(product, qty);

    if (!result.ok) {
      setMessage("Sorry, this piece is out of stock.");
      return;
    }

    setMessage(
      result.capped
        ? `You can order up to ${cap} of this piece, so we added the most we can.`
        : ""
    );
    setAdded(true);
    setQuantity(1);
  };

  const label = soldOut
    ? "Out of stock"
    : maxed
    ? "Maximum in cart"
    : added
    ? "Added to cart"
    : "Add to cart";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!compact && !soldOut && (
          <QuantityStepper
            value={qty}
            max={Math.max(room, 1)}
            label={product.name}
            disabled={maxed}
            onChange={(next) =>
              setQuantity(Math.min(Math.max(1, next), Math.max(room, 1)))
            }
          />
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || maxed}
          className={`inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
            compact ? "h-11 px-5 text-[15px]" : "h-12 px-8 text-base"
          } ${
            added
              ? "bg-[#1F5C36] text-white"
              : "bg-primary text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] hover:bg-secondary"
          }`}
        >
          {added ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <ShoppingBag size={18} aria-hidden="true" />
          )}
          {label}
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm text-[#8A4B12]">
          {message}
        </p>
      )}
    </div>
  );
}