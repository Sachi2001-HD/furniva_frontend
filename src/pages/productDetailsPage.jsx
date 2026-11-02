import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Maximize2,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";
import { addToCart } from "../utils/cart";

const MAX_PER_ORDER = 20;
const LOW_STOCK = 5;

const swatches = [
  ["walnut", "#5B3A24"],
  ["oak", "#C9A06A"],
  ["teak", "#A9692F"],
  ["maple", "#D9B382"],
  ["mahogany", "#6B2E1F"],
  ["pine", "#D8B982"],
  ["cherry", "#8A3F2B"],
];

const swatchFor = (...names) => {
  const text = names.filter(Boolean).join(" ").toLowerCase();
  return swatches.find(([key]) => text.includes(key))?.[1] ?? "#C58B4E";
};

const formatMoney = (n) => `Rs. ${Number(n).toLocaleString("en-US")}`;

const pad = (n) => String(n).padStart(2, "0");

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function SafeImage({
  src,
  alt = "",
  className = "",
  fit = "object-cover",
  iconSize = 48,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`grid place-items-center bg-accent/40 text-primary/50 ${className}`}
      >
        <Armchair size={iconSize} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${fit} ${className}`}
    />
  );
}

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
          <Star key={i} size={17} className="shrink-0 fill-current" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-highlight"
        style={{ width: `${(rating / 5) * 100}%` }}
      >
        {stars.map((_, i) => (
          <Star key={i} size={17} className="shrink-0 fill-current" />
        ))}
      </span>
    </span>
  );
}

function Accordion({ title, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen} className="group border-b border-accent/60">
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 text-lg font-medium [&::-webkit-details-marker]:hidden ${focusRing}`}
      >
        {title}
        <ChevronDown
          size={20}
          aria-hidden="true"
          className="shrink-0 text-secondary/60 transition group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

function Lightbox({ images, index, name, onIndex, onClose }) {
  const panelRef = useRef(null);
  const count = images.length;

  const go = (delta) => onIndex((index + delta + count) % count);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button")?.focus();

    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && count > 1) {
        go(-1);
      } else if (event.key === "ArrowRight" && count > 1) {
        go(1);
      } else if (event.key === "Tab") {
        const items = panelRef.current?.querySelectorAll("button:not([disabled])");
        if (!items?.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const arrow =
    "absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-primary shadow transition hover:bg-background focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} images`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-80 flex items-center justify-center bg-secondary/95 p-4 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-background/90 text-primary shadow transition hover:bg-background focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X size={22} aria-hidden="true" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className={`${arrow} left-4`}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className={`${arrow} right-4`}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </>
      )}

      <SafeImage
        src={images[index]}
        alt={`${name}, image ${index + 1} of ${count}`}
        fit="object-contain"
        className="max-h-[85vh] max-w-full rounded-2xl"
      />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="aspect-4/5 rounded-32px bg-accent/40 motion-safe:animate-pulse" />
      <div className="space-y-5 pt-4">
        <span className="block h-4 w-40 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-14 w-3/4 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-10 w-40 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-28 rounded bg-accent/30 motion-safe:animate-pulse" />
        <span className="block h-14 rounded-full bg-accent/40 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function Message({ title, text, children }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <Armchair size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-7 text-secondary/70">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading"); 
  const [errorText, setErrorText] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load the product
  useEffect(() => {
    let active = true;

    window.scrollTo({ top: 0 });
    setStatus("loading");
    setProduct(null);
    setRelated([]);

    apiRequest(`/products/${id}`)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setImageIndex(0);
        setQty(1);
        setLiked(false);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setErrorText(error.message);
        setStatus(error.status === 404 ? "missing" : "error");
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  // Load "A little more to love"
  useEffect(() => {
    if (!product) return;

    let active = true;
    const categoryId = product.category?._id;
    const others = (list) => list.filter((item) => item._id !== product._id);

    const load = async () => {
      let items = [];

      try {
        if (categoryId) {
          const data = await apiRequest(
            `/products?category=${categoryId}&limit=4`
          );
          items = others(data.products ?? []);
        }

        if (items.length < 3) {
          const data = await apiRequest("/products?limit=6");
          others(data.products ?? []).forEach((item) => {
            if (!items.some((existing) => existing._id === item._id)) {
              items.push(item);
            }
          });
        }
      } catch {
      }

      if (active) setRelated(items.slice(0, 3));
    };

    load();

    return () => {
      active = false;
    };
  }, [product]);

  useEffect(() => {
    if (product) document.title = `${product.name} | Furniva`;
    return () => {
      document.title = "Furniva";
    };
  }, [product]);

  const requireLogin = () => {
    if (isLoggedIn) return true;
    navigate("/login", { state: { from: location.pathname } });
    return false;
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast("Link copied");
    } catch (error) {
      if (error?.name !== "AbortError") setToast("Couldn't share the link");
    }
  };

  const handleAdd = (maxQty) => {
    if (!requireLogin()) return;
    addToCart(product._id, qty, maxQty);
    setToast(`${qty} × ${product.name} added to your cart`);
  };

  const handleLike = () => {
    if (!requireLogin()) return;
    setToast(liked ? "Removed from your wishlist" : "Saved to your wishlist");
    setLiked((previous) => !previous);
  };

  let content;

  if (status === "loading") {
    content = (
      <>
        <p role="status" className="sr-only">
          Loading product
        </p>
        <PageSkeleton />
      </>
    );
  } else if (status === "missing") {
    content = (
      <Message
        title="We couldn’t find that piece"
        text="It may have been removed or the link might be wrong. Have a look at the rest of the collection."
      >
        <Link
          to="/shop"
          className={`inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary ${focusRing}`}
        >
          Back to the collection
        </Link>
      </Message>
    );
  } else if (status === "error") {
    content = (
      <Message title="Something went wrong" text={errorText}>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className={`inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary ${focusRing}`}
        >
          Try again
        </button>
        <Link
          to="/shop"
          className={`inline-flex h-12 items-center rounded-full border border-accent px-7 text-base font-medium text-primary transition hover:bg-accent/30 ${focusRing}`}
        >
          Back to the shop
        </Link>
      </Message>
    );
  } else if (product) {
    const images = product.images ?? [];
    const stock = product.stock ?? 0;
    const soldOut = stock <= 0;
    const maxQty = Math.max(1, Math.min(stock, MAX_PER_ORDER));
    const category = product.category?.name;

    const onOffer =
      product.offerPrice != null && product.offerPrice < product.price;
    const price = onOffer ? product.offerPrice : product.price;
    const percent = onOffer
      ? Math.round((1 - product.offerPrice / product.price) * 100)
      : 0;

    const stockInfo = soldOut
      ? { text: "Out of stock", dot: "bg-[#B5392B]", color: "text-[#8A1F14]" }
      : stock <= LOW_STOCK
      ? { text: `Only ${stock} left`, dot: "bg-highlight", color: "text-[#7A4A12]" }
      : { text: "In stock", dot: "bg-[#4C8F5E]", color: "text-[#2F5D3A]" };

    const finish = product.colour || "Natural finish";
    const { w, d, h } = product.dimensions ?? {};

    const details = [
      ["Collection", category],
      ["Material", product.material],
      ["Finish", finish],
      ["Dimensions", w ? `${w} × ${d} × ${h} cm` : null],
      ["Reference", `FNV-${String(product._id).slice(-6).toUpperCase()}`],
    ].filter(([, value]) => value);

    const arrow =
      "absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-primary shadow transition hover:bg-background focus-visible:outline-2 focus-visible:outline-primary";

    content = (
      <>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-secondary/65">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-primary hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/shop" className="hover:text-primary hover:underline">
                Shop
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden="true">/</li>
                <li>{category}</li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-secondary">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-32px bg-accent/30 shadow-[0_30px_80px_rgba(113,62,38,0.15)]">
              <SafeImage
                src={images[imageIndex]}
                alt={product.name}
                className="aspect-4/5 w-full"
              />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {product.badge && (
                  <span className="rounded-lg bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary shadow-sm">
                    {product.badge}
                  </span>
                )}
                {onOffer && (
                  <span className="rounded-lg bg-highlight px-3 py-2 text-xs font-semibold text-secondary shadow-sm">
                    -{percent}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex(
                        (imageIndex - 1 + images.length) % images.length
                      )
                    }
                    aria-label="Previous image"
                    className={`${arrow} left-4`}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                    aria-label="Next image"
                    className={`${arrow} right-4`}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </>
              )}

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  aria-label="View larger image"
                  className="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-background/90 text-primary shadow transition hover:bg-background focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Maximize2 size={19} aria-hidden="true" />
                </button>
              )}
            </div>

            {images.length > 1 && (
              <ul aria-label="Product images" className="mt-4 flex gap-3 overflow-x-auto p-1">
                {images.map((image, index) => (
                  <li key={image} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setImageIndex(index)}
                      aria-label={`Show image ${index + 1} of ${images.length}`}
                      aria-current={index === imageIndex ? "true" : undefined}
                      className={`block h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${focusRing} ${
                        index === imageIndex
                          ? "border-primary"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <SafeImage
                        src={image}
                        className="h-full w-full"
                        iconSize={22}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-between gap-4 text-sm text-secondary/65">
              <span className="min-w-0 truncate">
                {pad(imageIndex + 1)} / {product.name}
              </span>
              {product.material && (
                <span className="inline-flex shrink-0 items-center gap-2">
                  <Leaf size={16} aria-hidden="true" />
                  {product.material}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:pt-2">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                {category ? `${category} collection` : "Furniva"}
              </p>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this product"
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/70 text-primary transition hover:bg-accent/30 ${focusRing}`}
              >
                <Share2 size={19} aria-hidden="true" />
              </button>
            </div>

            <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl xl:text-6xl">
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-3">
                <Stars rating={product.rating} />
                <span className="text-secondary/70">
                  {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                  {product.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="font-display text-4xl text-primary sm:text-5xl">
                {formatMoney(price)}
              </p>
              {onOffer && (
                <>
                  <s className="text-xl text-secondary/60">
                    <span className="sr-only">Original price </span>
                    {formatMoney(product.price)}
                  </s>
                  <span className="rounded-full bg-highlight px-3 py-1 text-sm font-semibold text-secondary">
                    -{percent}%
                  </span>
                </>
              )}
            </div>

            <p className={`mt-3 flex items-center gap-2 text-[15px] font-medium ${stockInfo.color}`}>
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${stockInfo.dot}`} />
              {stockInfo.text}
            </p>

            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-secondary/75">
              {product.description}
            </p>

            {/* Key facts */}
            <div className="mt-8 grid gap-6 border-y border-accent/60 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
                  Wood &amp; finish
                </p>
                <p className="mt-3 flex items-center gap-3 text-lg">
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: swatchFor(product.material, product.colour) }}
                    className="h-7 w-7 shrink-0 rounded-full border border-secondary/15"
                  />
                  {product.material}
                </p>
                <p className="mt-1.5 text-secondary/65">{finish}</p>
              </div>

              {w && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
                    Dimensions
                  </p>
                  <p className="mt-3 flex items-center gap-3 text-lg">
                    <Ruler size={20} aria-hidden="true" className="shrink-0 text-primary" />
                    {w} × {d} × {h} cm
                  </p>
                  <p className="mt-1.5 text-secondary/65">Width × depth × height</p>
                </div>
              )}
            </div>

            {/* Buy */}
            <div className="mt-6 flex flex-wrap items-stretch gap-3">
              <div
                role="group"
                aria-label="Quantity"
                className="inline-flex h-14 items-center rounded-2xl border border-accent/70 bg-background"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={soldOut || qty <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-full w-12 place-items-center rounded-l-2xl text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-lg font-medium">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={soldOut || qty >= maxQty}
                  aria-label="Increase quantity"
                  className="grid h-full w-12 place-items-center rounded-r-2xl text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(maxQty)}
                disabled={soldOut}
                className={`inline-flex h-14 min-w-200px flex-1 items-center justify-center gap-3 rounded-full bg-primary px-8 text-lg font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
              >
                <ShoppingBag size={20} aria-hidden="true" />
                {soldOut ? "Out of stock" : "Add to cart"}
              </button>

              <button
                type="button"
                onClick={handleLike}
                aria-pressed={liked}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/70 bg-background text-primary transition hover:bg-accent/30 ${focusRing}`}
              >
                <Heart
                  size={21}
                  aria-hidden="true"
                  className={liked ? "fill-primary" : ""}
                />
              </button>
            </div>

            <p className="mt-4 text-sm text-secondary/65">
              Delivery charges are confirmed at checkout.
            </p>

            {/* Accordions */}
            <div className="mt-10 border-t border-accent/60">
              <Accordion title="Details & materials" defaultOpen>
                <dl className="space-y-3">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[8rem_1fr] gap-4 text-[15px]"
                    >
                      <dt className="text-secondary/65">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>

              <Accordion title="Care for your piece">
                <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-secondary/75">
                  <li>Wipe with a soft, dry cloth. Dry any spills straight away.</li>
                  <li>Use coasters, mats and trivets to protect the surface.</li>
                  <li>Keep away from direct sunlight and heat sources.</li>
                  <li>Refresh the finish with a wood oil once or twice a year.</li>
                </ul>
              </Accordion>

              <Accordion title="Delivery & returns">
                <div className="space-y-3 text-[15px] leading-7 text-secondary/75">
                  <p>
                    Delivery details and charges are confirmed at checkout, and
                    we’ll keep you updated on the status of your order.
                  </p>
                  <p>
                    If something isn’t right when your piece arrives, contact us
                    and we’ll help put it right.
                  </p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Consultation prompt */}
        <section
          aria-labelledby="plan-heading"
          className="mt-20 flex flex-wrap items-center justify-between gap-6 border-y border-accent/60 py-10"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              A home that feels like you
            </p>
            <h2
              id="plan-heading"
              className="mt-3 font-display text-3xl tracking-tight sm:text-4xl"
            >
              Not sure how it fits your space?
            </h2>
          </div>
          <Link
            to="/consultation"
            className={`group inline-flex h-12 items-center gap-3 rounded-full border border-primary px-7 text-base font-medium text-primary transition hover:bg-primary hover:text-background ${focusRing}`}
          >
            Plan your space
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section aria-labelledby="more-heading" className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="more-heading"
                className="font-display text-4xl tracking-tight sm:text-5xl"
              >
                A little more to love.
              </h2>
              <Link
                to="/shop"
                className={`group inline-flex shrink-0 items-center gap-2 pb-1 text-base font-medium text-primary hover:underline ${focusRing}`}
              >
                View all
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition motion-safe:group-hover:translate-x-1"
                />
              </Link>
            </div>

            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const itemOnOffer =
                  item.offerPrice != null && item.offerPrice < item.price;

                return (
                  <li key={item._id}>
                    <Link to={`/shop/${item._id}`} className={`group block rounded-[28px] ${focusRing}`}>
                      <div className="overflow-hidden rounded-[28px] bg-accent/30">
                        <SafeImage
                          src={item.images?.[0]}
                          className="aspect-square w-full transition duration-500 motion-safe:group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-4 text-sm text-secondary/65">
                        {[item.material, item.category?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <div className="mt-1 flex items-start justify-between gap-4">
                        <h3 className="font-display text-2xl leading-snug group-hover:text-primary">
                          {item.name}
                        </h3>
                        <p className="shrink-0 pt-1 text-lg">
                          {formatMoney(itemOnOffer ? item.offerPrice : item.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-16">
          <Link
            to="/shop"
            className={`group inline-flex items-center gap-3 rounded-full text-lg text-primary hover:underline ${focusRing}`}
          >
            <ArrowLeft
              size={20}
              aria-hidden="true"
              className="transition motion-safe:group-hover:-translate-x-1"
            />
            Back to the collection
          </Link>
        </div>

        {lightbox && images.length > 0 && (
          <Lightbox
            images={images}
            index={imageIndex}
            name={product.name}
            onIndex={setImageIndex}
            onClose={() => setLightbox(false)}
          />
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 top-24 z-70 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#1F5C36] px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
            <Check size={16} aria-hidden="true" />
          </span>
          {toast}
        </div>
      )}

      <div className="px-4 pb-20 pt-10 sm:px-8">
        <div className="mx-auto max-w-[1680px]">{content}</div>
      </div>

      <Footer />
    </main>
  );
}