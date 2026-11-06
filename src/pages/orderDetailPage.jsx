import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import PageShell from "../components/pageShell";
import StatusPill from "../components/orders/statusPill";
import { Thumb } from "../components/cart/cartParts";
import { useAuth } from "../context/authContext";
import { STEPS, fetchOrder, statusInfo } from "../utils/orderApi";
import { formatDate, formatMoney } from "../utils/format";

const paymentLabel = (value = "") => {
  const labels = { cod: "Cash on delivery", bank_transfer: "Bank transfer" };
  if (labels[value]) return labels[value];
  const text = value.replace(/[_-]/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Not specified";
};

function Timeline({ step }) {
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((item, index) => {
        const reached = index <= step;
        const current = index === step;

        return (
          <li
            key={item.key}
            aria-current={current ? "step" : undefined}
            className="relative text-center"
          >
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  index < step ? "bg-primary" : "bg-accent"
                }`}
              />
            )}

            <span
              className={`relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full border-2 transition ${
                reached
                  ? "border-primary bg-primary text-background"
                  : "border-accent bg-background text-transparent"
              } ${current ? "ring-4 ring-primary/20" : ""}`}
            >
              <Check size={16} aria-hidden="true" />
            </span>

            <p
              className={`mt-3 text-xs sm:text-sm ${
                reached ? "font-medium" : "text-secondary/55"
              }`}
            >
              {item.label}
              <span className="sr-only">
                {current ? " (current step)" : reached ? " (done)" : " (upcoming)"}
              </span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.06)] sm:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const justPlaced = !!location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchOrder(token, id)
      .then((result) => active && setOrder(result))
      .catch((failure) => {
        if (!active) return;
        if (failure.status === 401) {
          logout();
          navigate("/login", { replace: true, state: { from: `/orders/${id}` } });
          return;
        }
        setError(
          failure.status === 404 ? "We couldn’t find that order." : failure.message
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, token, reloadKey, logout, navigate]);

  if (loading) {
    return (
      <PageShell width="max-w-5xl">
        <p role="status" className="sr-only">
          Loading your order
        </p>
        <div aria-hidden="true" className="space-y-6">
          <span className="block h-10 w-1/3 rounded bg-accent/40 motion-safe:animate-pulse" />
          <span className="block h-32 rounded-3xl bg-accent/30 motion-safe:animate-pulse" />
          <span className="block h-64 rounded-3xl bg-accent/30 motion-safe:animate-pulse" />
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell width="max-w-3xl">
        <div
          role="alert"
          className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center"
        >
          <p className="font-display text-2xl">{error || "We couldn’t find that order."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
            <Link
              to="/orders"
              className="inline-flex h-11 items-center rounded-full border border-accent px-6 font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              All orders
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const info = statusInfo(order.status);
  const address = order.address ?? {};
  const addressLines = [
    address.fullName,
    address.addressLine1,
    address.addressLine2,
    [address.city, address.postalCode].filter(Boolean).join(" "),
    address.phone,
  ].filter(Boolean);

  return (
    <PageShell width="max-w-5xl">
      {justPlaced && (
        <div
          role="status"
          className="mb-8 flex items-start gap-4 rounded-3xl border border-[#BBD6B2] bg-[#DDEBD8] p-6 text-[#2F5D3A]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2F5D3A] text-white">
            <Check size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-2xl">Thank you, your order is placed!</p>
            <p className="mt-1">
              We’ve received order #{order.number}. You can follow its progress on this page.
            </p>
          </div>
        </div>
      )}

      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Order #{order.number}
          </h1>
          <p className="mt-2 text-secondary/70">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-8 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.06)] sm:p-8">
        {info.step === -1 ? (
          <p className="text-[#8A1F14]">
            This order was cancelled. If this is a surprise, please get in touch with us.
          </p>
        ) : (
          <Timeline step={info.step} />
        )}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Items">
          <ul className="divide-y divide-accent/40">
            {order.items.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <Thumb src={item.image} className="h-20 w-20" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-0.5 text-sm text-secondary/65">
                    {item.quantity} × {formatMoney(item.price)}
                  </p>
                </div>
                <p className="shrink-0 font-medium">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-8">
          <Panel title="Summary">
            <dl className="space-y-3 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-secondary/70">Subtotal</dt>
                <dd>{formatMoney(order.subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-accent/40 pt-4">
                <dt className="text-lg">Total</dt>
                <dd className="font-display text-3xl">{formatMoney(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-secondary/65">
              Payment: {paymentLabel(order.paymentMethod)}
            </p>
          </Panel>

          {addressLines.length > 0 && (
            <Panel title="Delivering to">
              <address className="space-y-1 not-italic text-secondary/80">
                {addressLines.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </address>
              {order.notes && (
                <p className="mt-4 border-t border-accent/40 pt-4 text-sm text-secondary/70">
                  Note: {order.notes}
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/shop"
          className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Continue shopping
        </Link>
        <Link
          to="/orders"
          className="inline-flex h-12 items-center rounded-full border border-accent px-7 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          All orders
        </Link>
      </div>
    </PageShell>
  );
}