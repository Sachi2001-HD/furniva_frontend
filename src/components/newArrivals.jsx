import { useState } from "react";
import { Link } from "react-router-dom";
import { Armchair, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { useFetchData } from "../hooks/useFetchData";
import { optimizeImage } from "../utils/cloudinary";

const LOW_STOCK = 5; 

const formatMoney = (n) => `Rs. ${Number(n).toLocaleString("en-US")}`;

function Photo({ src, dim = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center bg-accent/40 text-primary/50"
      >
        <Armchair size={56} strokeWidth={1.25} />
      </span>
    );
  }

  return (
    <img
      src={optimizeImage(src, 900)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105 ${
        dim ? "opacity-60" : ""
      }`}
    />
  );
}

function ArrivalCard({ product, productTo }) {
  const onOffer =
    product.offerPrice != null && product.offerPrice < product.price;
  const percent = onOffer
    ? Math.round((1 - product.offerPrice / product.price) * 100)
    : 0;

  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;
  const meta = [product.material, product.colour].filter(Boolean).join(" · ");

  return (
    <li className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-300 hover:shadow-[0_18px_44px_rgba(113,62,38,0.16)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-primary motion-safe:hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-accent/30">
          <Photo src={product.images?.[0]} dim={soldOut} />

          <span className="absolute left-4 top-4 rounded-full bg-[#FDF8F1] px-3.5 py-1 text-xs font-medium uppercase tracking-[0.15em] text-secondary shadow-sm">
            New
          </span>

          {percent > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-highlight px-3 py-1 text-xs font-medium text-secondary shadow-sm">
              -{percent}%
            </span>
          )}

          {soldOut && (
            <span className="absolute bottom-4 left-4 rounded-full bg-secondary/85 px-3.5 py-1 text-xs font-medium text-background">
              Out of stock
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {product.category?.name && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#445444]">
              {product.category.name}
            </p>
          )}

          <h3 className="mt-2 font-display text-2xl leading-tight transition-colors group-hover:text-primary sm:text-[28px]">
            {/* Stretched link: the whole card is clickable */}
            <Link
              to={productTo(product._id)}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 text-secondary/70">
            {product.description}
          </p>

          {(meta || product.reviewCount > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary/65">
              {meta && <span>{meta}</span>}
              {product.reviewCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star
                    size={14}
                    aria-hidden="true"
                    className="fill-highlight text-highlight"
                  />
                  {Number(product.rating).toFixed(1)}
                  <span className="text-secondary/55">
                    ({product.reviewCount})
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-accent/40 pt-5">
            <div>
              {lowStock && (
                <p className="mb-1 text-sm font-medium text-[#8A4B12]">
                  Only {product.stock} left
                </p>
              )}
              <p className="text-xl font-medium">
                {formatMoney(onOffer ? product.offerPrice : product.price)}
              </p>
              {onOffer && (
                <s className="text-sm text-secondary/60">
                  <span className="sr-only">Original price </span>
                  {formatMoney(product.price)}
                </s>
              )}
            </div>

            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-background transition group-hover:bg-secondary"
            >
              <ArrowUpRight
                size={20}
                className="transition motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </article>
    </li>
  );
}

function CardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1]"
    >
      <span className="block aspect-4/3 bg-accent/40 motion-safe:animate-pulse" />
      <div className="space-y-3 p-6">
        <span className="block h-3 w-1/4 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-6 w-2/3 rounded bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-4 w-full rounded bg-accent/30 motion-safe:animate-pulse" />
        <span className="block h-4 w-4/5 rounded bg-accent/30 motion-safe:animate-pulse" />
        <span className="mt-4 block h-6 w-1/3 rounded bg-accent/40 motion-safe:animate-pulse" />
      </div>
    </li>
  );
}

export default function NewArrivals({
  count = 3, 
  viewAllTo = "/shop",
  productTo = (id) => `/shop/${id}`, 
}) {
  const { data, loading, error, reload } = useFetchData(
    `/products?sort=newest&limit=${count}`
  );
  const products = data?.products ?? [];

  if (!loading && !error && products.length === 0) return null;

  return (
    <section
      id="new-arrivals"
      aria-labelledby="arrivals-heading"
      className="px-4 py-8 sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">
              A fresh perspective
            </p>
            <h2
              id="arrivals-heading"
              className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              New arrivals
            </h2>
          </div>

          <Link
            to={viewAllTo}
            className="group inline-flex items-center gap-2 text-base font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-lg"
          >
            Shop new arrivals
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>

        {loading ? (
          <>
            <p role="status" className="sr-only">
              Loading new arrivals
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {Array.from({ length: count }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </ul>
          </>
        ) : error ? (
          <div
            role="alert"
            className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-12 text-center"
          >
            <p className="font-display text-2xl">
              We couldn’t load the new arrivals
            </p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <ArrivalCard
                key={product._id}
                product={product}
                productTo={productTo}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}