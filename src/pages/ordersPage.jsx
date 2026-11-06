import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import PageShell from "../components/pageShell";
import StatusPill from "../components/orders/statusPill";
import { Thumb } from "../components/cart/cartParts";
import { useAuth } from "../context/authContext";
import { fetchMyOrders, statusInfo } from "../utils/orderApi";
import { formatDate, formatMoney } from "../utils/format";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "In progress" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const groupOf = (order) => {
  const { step } = statusInfo(order.status);
  return step === -1 ? "cancelled" : step === 3 ? "delivered" : "active";
};

function OrderCard({ order }) {
  const shown = order.items.slice(0, 4);
  const extra = order.items.length - shown.length;
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <li>
      <article className="group relative rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)] transition duration-300 hover:shadow-[0_18px_44px_rgba(113,62,38,0.14)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-primary sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">
              <Link
                to={`/orders/${order.id}`}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                Order #{order.number}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-secondary/65">
              Placed on {formatDate(order.createdAt)} · {count}{" "}
              {count === 1 ? "item" : "items"}
            </p>
          </div>
          <StatusPill status={order.status} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          {shown.map((item, index) => (
            <Thumb key={`${item.id}-${index}`} src={item.image} className="h-16 w-16" />
          ))}
          {extra > 0 && (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-sm font-medium text-primary">
              +{extra}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-accent/40 pt-4">
          <div>
            <p className="text-sm text-secondary/65">Total</p>
            <p className="text-xl font-medium">{formatMoney(order.total)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-medium text-primary group-hover:underline">
            View details
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </article>
    </li>
  );
}

function CardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="space-y-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6"
    >
      <span className="block h-6 w-1/3 rounded bg-accent/40 motion-safe:animate-pulse" />
      <span className="block h-4 w-1/2 rounded bg-accent/30 motion-safe:animate-pulse" />
      <span className="block h-16 w-2/3 rounded-2xl bg-accent/30 motion-safe:animate-pulse" />
    </li>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchMyOrders(token)
      .then((list) => {
        if (!active) return;
        // Newest first
        setOrders([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch((failure) => {
        if (!active) return;
        if (failure.status === 401) {
          logout();
          navigate("/login", { replace: true, state: { from: "/orders" } });
          return;
        }
        setError(failure.message);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [token, reloadKey, logout, navigate]);

  const counts = useMemo(() => {
    const result = { all: orders.length, active: 0, delivered: 0, cancelled: 0 };
    orders.forEach((order) => (result[groupOf(order)] += 1));
    return result;
  }, [orders]);

  const visible = orders.filter((order) => filter === "all" || groupOf(order) === filter);

  return (
    <PageShell width="max-w-5xl">
      <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">Your account</p>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        My orders
      </h1>
      <p className="mt-3 text-secondary/70 sm:text-lg">
        Track your orders and revisit what you’ve bought.
      </p>

      {!loading && !error && orders.length > 0 && (
        <div role="group" aria-label="Filter orders" className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                filter === value
                  ? "border-primary bg-primary font-medium text-background"
                  : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {label}
              <span className={filter === value ? "text-background/80" : "text-secondary/65"}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>
      )}

      <section aria-label="Orders" className="mt-8">
        {loading ? (
          <>
            <p role="status" className="sr-only">
              Loading your orders
            </p>
            <ul className="space-y-5">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </ul>
          </>
        ) : error ? (
          <div
            role="alert"
            className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center"
          >
            <p className="font-display text-2xl">We couldn’t load your orders</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
              <PackageOpen size={28} aria-hidden="true" />
            </span>
            <p className="mt-6 font-display text-2xl">No orders yet</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              When you place an order, you’ll be able to follow it here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Start shopping
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-12 text-center text-secondary/70">
            No orders in this view.
          </p>
        ) : (
          <ul className="space-y-5">
            {visible.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}