import { useEffect, useRef, useState } from "react";
import { Briefcase, Home, MapPin, X } from "lucide-react";

const LABELS = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Other", icon: MapPin },
];

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";
const inputClass = `${base} h-11`;

function validate(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = "Enter the name of the person receiving deliveries.";
  if (!/^\+?[\d\s-]{7,18}$/.test(v.phone.trim()) || v.phone.replace(/\D/g, "").length < 7) {
    e.phone = "Enter a valid phone number.";
  }
  if (!v.address.trim()) e.address = "Enter the street address.";
  if (!v.city.trim()) e.city = "Enter the city.";
  return e;
}

function Field({ id, label, optional, error, children }) {
  return (
    <div>
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

export default function AddressFormDrawer({
  address, 
  defaultName = "",
  isFirst,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const isEdit = !!address;
  const lockedDefault = isFirst || !!address?.isDefault;

  const [shown, setShown] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [values, setValues] = useState(() => ({
    label: address?.label ?? "Home",
    fullName: address?.fullName ?? defaultName,
    phone: address?.phone ?? "",
    address: address?.address ?? "",
    city: address?.city ?? "",
    postalCode: address?.postalCode ?? "",
    isDefault: lockedDefault,
  }));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector("input[type='text'], input[type='tel']")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])'
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

  const set = (key) => (event) =>
    setValues((previous) => ({ ...previous, [key]: event.target.value }));

  const errors = validate(values);
  const showError = (key) => (attempted ? errors[key] : undefined);

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      setTimeout(
        () => panelRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
        0
      );
      return;
    }

    onSubmit({
      label: values.label,
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode.trim(),
      isDefault: values.isDefault,
    });
  };

  return (
    <div
      className="fixed inset-0 z-80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <aside
        ref={panelRef}
        className={`absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-[#FDF8F1] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div>
            <h2 id="address-form-title" className="font-display text-2xl">
              {isEdit ? "Edit address" : "Add a new address"}
            </h2>
            <p className="mt-0.5 text-sm text-secondary/65">
              Where should we deliver your orders?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-secondary/70 transition hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Save as</legend>
              <div className="flex flex-wrap gap-3">
                {LABELS.map(({ value, icon: Icon }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="label"
                      value={value}
                      checked={values.label === value}
                      onChange={set("label")}
                      className="peer sr-only"
                    />
                    <span className="inline-flex h-11 items-center gap-2 rounded-full border border-accent/70 bg-accent/30 px-5 text-[15px] transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      <Icon size={17} aria-hidden="true" />
                      {value}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="ad-name" label="Full name" error={showError("fullName")}>
              <input
                id="ad-name"
                type="text"
                value={values.fullName}
                onChange={set("fullName")}
                autoComplete="name"
                aria-invalid={!!showError("fullName")}
                aria-describedby={showError("fullName") ? "ad-name-error" : undefined}
                className={inputClass}
              />
            </Field>

            <Field id="ad-phone" label="Phone number" error={showError("phone")}>
              <input
                id="ad-phone"
                type="tel"
                value={values.phone}
                onChange={set("phone")}
                autoComplete="tel"
                placeholder="e.g. 077 123 4567"
                aria-invalid={!!showError("phone")}
                aria-describedby={showError("phone") ? "ad-phone-error" : undefined}
                className={inputClass}
              />
            </Field>

            <Field id="ad-address" label="Address" error={showError("address")}>
              <input
                id="ad-address"
                type="text"
                value={values.address}
                onChange={set("address")}
                autoComplete="street-address"
                placeholder="House number, street, landmark"
                aria-invalid={!!showError("address")}
                aria-describedby={showError("address") ? "ad-address-error" : undefined}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="ad-city" label="City" error={showError("city")}>
                <input
                  id="ad-city"
                  type="text"
                  value={values.city}
                  onChange={set("city")}
                  autoComplete="address-level2"
                  aria-invalid={!!showError("city")}
                  aria-describedby={showError("city") ? "ad-city-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id="ad-postal" label="Postal code" optional>
                <input
                  id="ad-postal"
                  type="text"
                  value={values.postalCode}
                  onChange={set("postalCode")}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>
            </div>

            <label
              className={`flex items-start gap-3 ${
                lockedDefault ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={values.isDefault}
                disabled={lockedDefault}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    isDefault: event.target.checked,
                  }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-default"
              />
              <span>
                <span className="block text-[15px] font-medium">
                  Make this my default address
                </span>
                <span className="block text-sm text-secondary/65">
                  {isFirst
                    ? "Your first address is saved as your default."
                    : address?.isDefault
                    ? "This is your default address. To change it, make another address the default."
                    : "It will be filled in for you at checkout."}
                </span>
              </span>
            </label>
          </div>

          <div className="border-t border-accent/50 bg-[#FDF8F1] px-6 py-4">
            {error && (
              <p
                role="alert"
                className="mb-3 rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]"
              >
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 flex-2 items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : isEdit ? "Save changes" : "Save address"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}