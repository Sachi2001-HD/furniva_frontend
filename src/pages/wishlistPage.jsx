import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import PageShell from "../components/pageShell";
import ProductCard from "../components/productCard";
import Toast from "../components/ui/toast";
import { useCart } from "../context/cartContext";
import { useWishlist } from "../context/wishlistContext";

function CardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="overflow-hidden rounded-[28px] border border-accent/50 bg-white/70 p-3"
    >
      <span className="block aspect-5/4 rounded-[20px] bg-accent/40 motion-safe:animate-pulse" />
      <div className="space-y-3 p-2 pt-4">
        <span className="block h-5 w-2/3 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-4 w-full rounded bg-accent/30 motion-safe:animate-pulse" />
        <span className="block h-11 w-full rounded-full bg-accent/30 motion-safe:animate-pulse" />
      </div>
    </li>
  );
}

export default function WishlistPage() {
  const { items, loading, error, refresh, clear } = useWishlist();
  const { addItem, openCart } = useCart();

  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text, id: Date.now() });

  const products = items.filter((product) => product && product.isActive !== false);
  const available = products.filter((product) => product.stock > 0);

  const addAll = () => {
    let added = 0;
    available.forEach((product) => {
      if (addItem(product, 1, { open: false }).ok) added += 1;
    });

    if (added === 0) {
      showToast("error", "Nothing could be added to your cart.");
      return;
    }
    openCart();
  };

  const clearAll = async () => {
    setConfirming(false);
    const result = await clear();

    if (result.ok) showToast("success", "Wishlist cleared");
    else showToast("error", result.message ?? "Couldn’t clear your wishlist.");
  };

  return (
    <PageShell>
      <Toast toast={toast} />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">Your collection</p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            My wishlist
          </h1>
          <p className="mt-3 max-w-xl text-secondary/70 sm:text-lg">
            {products.length > 0
              ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} you’ve saved for later.`
              : "Keep the furniture you love close at hand."}
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {available.length > 0 && (
              <button
                type="button"
                onClick={addAll}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
              >
                <ShoppingBag size={18} aria-hidden="true" />
                Add {available.length === products.length ? "all" : `${available.length} available`} to cart
              </button>
            )}

            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-accent px-5 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <Trash2 size={17} aria-hidden="true" />
                Clear all
              </button>
            ) : (
              <span
                role="alert"
                className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#9B2C1F]/10 py-1.5 pl-5 pr-1.5 text-sm text-[#9B2C1F]"
              >
                Remove everything?
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="inline-flex h-9 items-center rounded-full border border-accent bg-[#FDF8F1] px-4 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-9 items-center rounded-full bg-[#9B2C1F] px-4 text-sm font-medium text-white transition hover:bg-[#7F2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C1F]"
                >
                  Clear all
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <section aria-label="Saved products" className="mt-10">
        {loading && items.length === 0 ? (
          <>
            <p role="status" className="sr-only">Loading your wishlist</p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </ul>
          </>
        ) : error && items.length === 0 ? (
          <div role="alert" className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
            <p className="font-display text-2xl">We couldn’t load your wishlist</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={() => refresh()}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-[#FDF8F1] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
              <Heart size={28} aria-hidden="true" />
            </span>
            <p className="mt-6 font-display text-2xl">Your wishlist is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              Tap the heart on any piece you love and it will wait for you here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <li key={product._id} className="flex [&>article]:w-full">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}