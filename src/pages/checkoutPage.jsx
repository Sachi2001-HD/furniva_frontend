import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, Check, Landmark, ShoppingBag } from "lucide-react";
import PageShell from "../components/pageShell";
import { Thumb } from "../components/cart/cartParts";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { buildOrderPayload, placeOrder } from "../utils/orderApi";
import { formatMoney, sellingPrice } from "../utils/format";
import SavedAddressPicker from "../components/addresses/savedAddressPicker";
import { fetchAddresses } from "../utils/addressApi";

const DELIVERY_FEE = null;

const PAYMENT_METHODS = [
  {
    value: "cod",
    label: "Cash on delivery",
    hint: "Pay in cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    hint: "We’ll share our bank details once your order is confirmed.",
    icon: Landmark,
  },
];

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";
const inputClass = `${base} h-11`;

function validate(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = "Enter the name of the person receiving the order.";
  if (!/^\+?[\d\s-]{7,18}$/.test(v.phone.trim()) || v.phone.replace(/\D/g, "").length < 7) {
    e.phone = "Enter a valid phone number.";
  }
  if (!v.addressLine1.trim()) e.addressLine1 = "Enter your delivery address.";
  if (!v.city.trim()) e.city = "Enter your city.";
  return e;
}

function Steps() {
  const steps = ["Cart", "Details", "Confirmation"];

  return (
    <ol aria-label="Checkout progress" className="flex flex-wrap items-center gap-3 text-sm">
      {steps.map((label, index) => (
        <li
          key={label}
          aria-current={index === 1 ? "step" : undefined}
          className="flex items-center gap-3"
        >
          <span
            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-medium ${
              index === 0
                ? "bg-primary text-background"
                : index === 1
                ? "border-2 border-primary text-primary"
                : "border border-accent text-secondary/50"
            }`}
          >
            {index === 0 ? <Check size={14} aria-hidden="true" /> : index + 1}
          </span>
          <span className={index === 1 ? "font-medium" : "text-secondary/60"}>
            {label}
          </span>
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="h-px w-6 bg-accent sm:w-10" />
          )}
        </li>
      ))}
    </ol>
  );
}

function Card({ title, hint, children }) {
  return (
    <section className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.06)] sm:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-secondary/65">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ id, label, optional, error, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-secondary/60">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#9B2C1F]">
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryLine({ item }) {
  if (item.status === "loading") {
    return (
      <li aria-hidden="true" className="flex items-center gap-4 py-4">
        <span className="h-16 w-16 shrink-0 rounded-2xl bg-accent/40 motion-safe:animate-pulse" />
        <span className="block h-4 w-1/2 rounded bg-accent/40 motion-safe:animate-pulse" />
      </li>
    );
  }

  if (item.status === "error") {
    return (
      <li className="py-4 text-sm text-[#9B2C1F]">
        We couldn’t load one of your items. Open your cart and try again.
      </li>
    );
  }

  if (item.status === "unavailable") {
    return (
      <li className="flex items-center gap-4 py-4">
        <Thumb src={item.image} dim className="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-medium">
            {item.name || "An item in your cart"}
          </p>
          <p className="text-sm font-medium text-[#9B2C1F]">
            No longer available. Remove it from your cart to continue.
          </p>
        </div>
      </li>
    );
  }

  const meta = [item.material, item.colour].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center gap-4 py-4">
      <div className="relative">
        <Thumb src={item.image} className="h-16 w-16" />
        <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-secondary px-1.5 text-xs font-medium text-background">
          {item.quantity}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] font-medium">{item.name}</p>
        {meta && <p className="truncate text-sm text-secondary/65">{meta}</p>}
        {item.notice && <p className="mt-1 text-sm text-[#8A4B12]">{item.notice}</p>}
      </div>

      <p className="shrink-0 text-[15px] font-medium">
        {formatMoney(sellingPrice(item) * item.quantity)}
      </p>
    </li>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const {
    items,
    readyItems,
    itemCount,
    subtotal,
    savings,
    hasUnavailable,
    hasPending,
    refreshing,
    refresh,
    openCart,
    clearCart,
  } = useCart();

  const formRef = useRef(null);
  const placed = useRef(false);

  const [form, setForm] = useState(() => ({
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    phone: user?.contactNumber ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    paymentMethod: PAYMENT_METHODS[0].value,
    notes: "",
  }));

  const [savedAddresses, setSavedAddresses] = useState([]);
const [addressId, setAddressId] = useState("new");

const applyAddress = (address) => {
  setAddressId(address._id);
  setForm((previous) => ({
    ...previous,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.address,
    addressLine2: "",
    city: address.city,
    postalCode: address.postalCode ?? "",
  }));
};

const useNewAddress = () => {
  setAddressId("new");
  setForm((previous) => ({
    ...previous,
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  }));
};

// Load saved addresses and fill in the default one
useEffect(() => {
  let active = true;

  fetchAddresses(token)
    .then((list) => {
      if (!active) return;
      setSavedAddresses(list);
      const preferred = list.find((item) => item.isDefault);
      if (preferred) applyAddress(preferred);
    })
    .catch(() => {}); // checkout still works with a typed address

  return () => {
    active = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [token]);

  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Make sure prices and stock are current before the customer pays
  useEffect(() => {
    refresh();
  }, [refresh]);

  const set = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const errors = validate(form);
  const showError = (key) => (attempted ? errors[key] : undefined);
  const total = subtotal + (DELIVERY_FEE ?? 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    setFormError("");

    if (Object.keys(errors).length > 0) {
      setTimeout(
        () => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
        0
      );
      return;
    }

    if (hasUnavailable) {
      setFormError(
        "Some items are no longer available. Please remove them from your cart to continue."
      );
      return;
    }

    setSubmitting(true);

    try {
      const order = await placeOrder(token, buildOrderPayload(readyItems, form));
      placed.current = true;
      clearCart();
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: "/checkout" } });
        return;
      }
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !placed.current) {
    return (
      <PageShell width="max-w-3xl">
        <div className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
            <ShoppingBag size={28} aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-3xl">Your cart is empty</h1>
          <p className="mx-auto mt-2 max-w-sm text-secondary/70">
            Add a piece you love, then come back here to check out.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Browse the shop
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-10">
        <Steps />
        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Checkout
        </h1>
        <p className="mt-2 text-secondary/70">
          Tell us where to deliver, then review and place your order.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-14">
        <form
          id="checkout-form"
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-8"
        >
          <Card title="Delivery details" hint="Where should we deliver your order?">
            <SavedAddressPicker
              addresses={savedAddresses}
              selectedId={addressId}
              onSelect={applyAddress}
              onNew={useNewAddress}
            />
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="co-name" label="Full name" error={showError("fullName")}>
                  <input
                    id="co-name"
                    value={form.fullName}
                    onChange={set("fullName")}
                    autoComplete="name"
                    aria-invalid={!!showError("fullName")}
                    aria-describedby={showError("fullName") ? "co-name-error" : undefined}
                    className={inputClass}
                  />
                </Field>

                <Field id="co-phone" label="Phone number" error={showError("phone")}>
                  <input
                    id="co-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    autoComplete="tel"
                    placeholder="e.g. 077 123 4567"
                    aria-invalid={!!showError("phone")}
                    aria-describedby={showError("phone") ? "co-phone-error" : undefined}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="co-address" label="Address" error={showError("addressLine1")}>
                <input
                  id="co-address"
                  value={form.addressLine1}
                  onChange={set("addressLine1")}
                  autoComplete="address-line1"
                  placeholder="House number and street"
                  aria-invalid={!!showError("addressLine1")}
                  aria-describedby={
                    showError("addressLine1") ? "co-address-error" : undefined
                  }
                  className={inputClass}
                />
              </Field>

              <Field id="co-address2" label="Apartment, landmark or other details" optional>
                <input
                  id="co-address2"
                  value={form.addressLine2}
                  onChange={set("addressLine2")}
                  autoComplete="address-line2"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="co-city" label="City" error={showError("city")}>
                  <input
                    id="co-city"
                    value={form.city}
                    onChange={set("city")}
                    autoComplete="address-level2"
                    aria-invalid={!!showError("city")}
                    aria-describedby={showError("city") ? "co-city-error" : undefined}
                    className={inputClass}
                  />
                </Field>

                <Field id="co-postal" label="Postal code" optional>
                  <input
                    id="co-postal"
                    value={form.postalCode}
                    onChange={set("postalCode")}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="co-notes" label="Delivery notes" optional>
                <textarea
                  id="co-notes"
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Anything we should know, like access instructions or a preferred time"
                  className={`${base} min-h-24 resize-y py-3 leading-6`}
                />
              </Field>
            </div>
          </Card>

          <Card title="Payment method" hint="You won’t be charged online.">
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {PAYMENT_METHODS.map(({ value, label, hint, icon: Icon }) => (
                  <label key={value} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={form.paymentMethod === value}
                      onChange={set("paymentMethod")}
                      className="peer sr-only"
                    />
                    <span className="flex h-full gap-4 rounded-2xl border border-accent/70 bg-background p-5 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_0_3px_rgba(113,62,38,0.12)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary hover:border-primary/50">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-medium">{label}</span>
                        <span className="mt-1 block text-sm leading-5 text-secondary/65">
                          {hint}
                        </span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>
        </form>

        {/* Summary */}
        <aside aria-labelledby="summary-title" className="lg:sticky lg:top-28">
          <div className="rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 id="summary-title" className="font-display text-2xl">
                Order summary
              </h2>
              <button
                type="button"
                onClick={openCart}
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Edit cart
              </button>
            </div>

            <ul className="mt-6 divide-y divide-accent/40">
              {items.map((item) => (
                <SummaryLine key={item.id} item={item} />
              ))}
            </ul>

            <dl className="mt-2 space-y-3 border-t border-accent/40 pt-6 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-secondary/70">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </dt>
                <dd>{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary/70">Delivery</dt>
                <dd className="text-right">
                  {DELIVERY_FEE == null
                    ? "Confirmed after you order"
                    : formatMoney(DELIVERY_FEE)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-accent/40 pt-4">
                <dt className="text-lg">Total</dt>
                <dd className="font-display text-3xl">{formatMoney(total)}</dd>
              </div>
            </dl>

            {savings > 0 && (
              <p className="mt-3 text-sm text-[#2F5D3A]">
                You’re saving {formatMoney(savings)} with offers
              </p>
            )}

            {formError && (
              <p
                role="alert"
                className="mt-5 rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || refreshing || hasPending || readyItems.length === 0}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Placing your order..."
                : refreshing
                ? "Checking latest prices..."
                : "Place order"}
            </button>

            {hasPending && !refreshing && (
              <p className="mt-3 text-center text-sm text-[#9B2C1F]">
                Some items couldn’t be loaded. Open your cart and try again.
              </p>
            )}

            <p className="mt-4 text-center text-sm text-secondary/60">
              By placing your order you agree to our{" "}
              <Link to="/terms" className="font-medium text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}