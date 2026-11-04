import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./productCard";

function CardSkeleton() {
  return (
    <li className="space-y-4">
      <span className="block aspect-4/3 rounded-3xl bg-accent/40 motion-safe:animate-pulse" />
      <span className="block h-5 w-2/3 rounded bg-accent/40 motion-safe:animate-pulse" />
      <span className="block h-4 w-full rounded bg-accent/30 motion-safe:animate-pulse" />
      <span className="block h-4 w-1/3 rounded bg-accent/30 motion-safe:animate-pulse" />
    </li>
  );
}

export default function FeaturedProducts({
  products = [],
  loading = false,
  error = "",
  onRetry,
  viewAllTo = "/shop",
}) {
  if (!loading && !error && products.length === 0) return null;

  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="px-4 sm:px-8"
    >
      <div className="mx-auto max-w-[1680px] border-t border-accent pt-4 sm:pt-8">
        <h2
          id="featured-heading"
          className="mb-8 font-display text-4xl leading-tight tracking-tight sm:mb-10 sm:text-5xl"
        >
          Featured products
        </h2>

        {loading ? (
          <>
            <p role="status" className="sr-only">
              Loading featured products
            </p>
            <ul
              aria-hidden="true"
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[0, 1, 2].map((i) => (
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
              We couldn’t load the featured products
            </p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 flex justify-end border-b border-accent pb-5 sm:mt-12 sm:pb-6">
              <Link
                to={viewAllTo}
                className="group inline-flex items-center gap-2 text-2xl font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-lg"
              >
                View all
                <ArrowRight
                  size={18}
                  className="transition motion-safe:group-hover:translate-x-1"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}