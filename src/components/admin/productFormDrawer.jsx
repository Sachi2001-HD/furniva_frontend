import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";
const inputClass = `${base} h-11`;
const textareaClass = `${base} min-h-28 resize-y py-3 leading-6`;

const badgeOptions = [
  { value: "", label: "No badge" },
  { value: "Bestseller", label: "Bestseller" },
  { value: "New", label: "New" },
];

const initialValues = (product) => ({
  name: product?.name ?? "",
  description: product?.description ?? "",
  category: product?.category?._id ?? product?.category ?? "",
  material: product?.material ?? "",
  colour: product?.colour ?? "",
  price: product ? String(product.price) : "",
  offerPrice: product?.offerPrice != null ? String(product.offerPrice) : "",
  stock: product ? String(product.stock) : "0",
  w: product?.dimensions?.w != null ? String(product.dimensions.w) : "",
  d: product?.dimensions?.d != null ? String(product.dimensions.d) : "",
  h: product?.dimensions?.h != null ? String(product.dimensions.h) : "",
  badge: product?.badge ?? "",
  isFeatured: !!product?.isFeatured,
  images: product?.images ?? [],
});

function validate(v) {
  const e = {};
  const price = Number(v.price);
  const offer = Number(v.offerPrice);
  const stock = Number(v.stock);

  if (!v.name.trim()) e.name = "Enter a product name.";
  if (!v.description.trim()) e.description = "Add a short description.";
  if (!v.category) e.category = "Choose a category.";
  if (!v.material.trim()) e.material = "Enter the main material.";

  if (v.price === "" || !Number.isFinite(price) || price < 0) {
    e.price = "Enter a valid price.";
  }

  if (v.offerPrice !== "") {
    if (!Number.isFinite(offer) || offer < 0) {
      e.offerPrice = "Enter a valid offer price.";
    } else if (!e.price && offer >= price) {
      e.offerPrice = "Offer price must be lower than the regular price.";
    }
  }

  if (v.stock === "" || !Number.isInteger(stock) || stock < 0) {
    e.stock = "Enter a whole number, 0 or more.";
  }

  ["w", "d", "h"].forEach((key) => {
    const n = Number(v[key]);
    if (v[key] === "" || !Number.isFinite(n) || n < 1) e[key] = true;
  });

  if (v.images.length === 0) e.images = "Add at least one product image.";

  return e;
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
      {error && typeof error === "string" && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#9B2C1F]">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectBox({ id, value, onChange, invalid, describedBy, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} appearance-none pr-11`}
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60"
      />
    </div>
  );
}

function ImagePreview({ src }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="grid h-full w-full place-items-center bg-accent/40 px-1 text-center text-[10px] text-secondary/60">
        Can’t load
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-secondary/60">
      {children}
    </h3>
  );
}

export default function ProductFormDrawer({
  product,
  categories,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [shown, setShown] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [values, setValues] = useState(() => initialValues(product));
  const [imageInput, setImageInput] = useState("");
  const [imageError, setImageError] = useState("");

  const isEdit = !!product;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector("input, select, textarea")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
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
    setValues((previousValues) => ({
      ...previousValues,
      [key]: event.target.value,
    }));

  const errors = validate(values);
  const showError = (key) => (attempted ? errors[key] : undefined);

  const categoryOptions = categories.filter(
    (category) => category.isActive !== false || category._id === values.category
  );

  const price = Number(values.price);
  const offer = Number(values.offerPrice);
  const discount =
    values.offerPrice !== "" && price > 0 && offer >= 0 && offer < price
      ? Math.round((1 - offer / price) * 100)
      : 0;

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;

    if (!/^(https?:\/\/|\/)\S+$/i.test(url)) {
      setImageError("Use a full link (https://...) or a path starting with /.");
      return;
    }
    if (values.images.includes(url)) {
      setImageError("That image is already added.");
      return;
    }
    if (values.images.length >= 8) {
      setImageError("You can add up to 8 images.");
      return;
    }

    setValues((previousValues) => ({
      ...previousValues,
      images: [...previousValues.images, url],
    }));
    setImageInput("");
    setImageError("");
  };

  const removeImage = (url) =>
    setValues((previousValues) => ({
      ...previousValues,
      images: previousValues.images.filter((image) => image !== url),
    }));

  const makeCover = (url) =>
    setValues((previousValues) => ({
      ...previousValues,
      images: [url, ...previousValues.images.filter((image) => image !== url)],
    }));

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
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      material: values.material.trim(),
      colour: values.colour.trim(),
      price: Number(values.price),
      offerPrice: values.offerPrice === "" ? null : Number(values.offerPrice),
      dimensions: {
        w: Number(values.w),
        d: Number(values.d),
        h: Number(values.h),
      },
      images: values.images,
      stock: Number(values.stock),
      badge: values.badge || null,
      isFeatured: values.isFeatured,
    });
  };

  const dimensionsInvalid = attempted && (errors.w || errors.d || errors.h);

  return (
    <div
      className="fixed inset-0 z-60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <aside
        ref={panelRef}
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#FDF8F1] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div>
            <h2 id="product-form-title" className="font-display text-2xl">
              {isEdit ? "Edit product" : "Add product"}
            </h2>
            <p className="mt-0.5 text-sm text-secondary/65">
              {isEdit
                ? "Update details, pricing and stock."
                : "Fill in the details to add it to your catalogue."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
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
          <div className="flex-1 space-y-9 overflow-y-auto px-6 py-6">
            {/* Basics */}
            <section>
              <SectionTitle>Basics</SectionTitle>
              <div className="space-y-5">
                <Field id="pf-name" label="Product name" error={showError("name")}>
                  <input
                    id="pf-name"
                    value={values.name}
                    onChange={set("name")}
                    placeholder="e.g. Alder Dining Set"
                    aria-invalid={!!showError("name")}
                    aria-describedby={showError("name") ? "pf-name-error" : undefined}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="pf-description"
                  label="Description"
                  error={showError("description")}
                >
                  <textarea
                    id="pf-description"
                    value={values.description}
                    onChange={set("description")}
                    placeholder="A short description customers will see"
                    aria-invalid={!!showError("description")}
                    aria-describedby={
                      showError("description") ? "pf-description-error" : undefined
                    }
                    className={textareaClass}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="pf-category"
                    label="Category"
                    error={showError("category")}
                  >
                    <SelectBox
                      id="pf-category"
                      value={values.category}
                      onChange={set("category")}
                      invalid={!!showError("category")}
                      describedBy={
                        showError("category") ? "pf-category-error" : undefined
                      }
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </SelectBox>
                    {categories.length === 0 && (
                      <p className="mt-1.5 text-sm text-secondary/65">
                        No categories yet. Create one first.
                      </p>
                    )}
                  </Field>

                  <Field
                    id="pf-material"
                    label="Material"
                    error={showError("material")}
                  >
                    <input
                      id="pf-material"
                      value={values.material}
                      onChange={set("material")}
                      placeholder="e.g. Teak"
                      aria-invalid={!!showError("material")}
                      aria-describedby={
                        showError("material") ? "pf-material-error" : undefined
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field id="pf-colour" label="Colour" optional>
                  <input
                    id="pf-colour"
                    value={values.colour}
                    onChange={set("colour")}
                    placeholder="e.g. Honey brown"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Pricing and stock */}
            <section>
              <SectionTitle>Pricing and stock</SectionTitle>
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="pf-price"
                    label="Price (Rs.)"
                    error={showError("price")}
                  >
                    <input
                      id="pf-price"
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={values.price}
                      onChange={set("price")}
                      aria-invalid={!!showError("price")}
                      aria-describedby={
                        showError("price") ? "pf-price-error" : undefined
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    id="pf-offer"
                    label="Offer price (Rs.)"
                    optional
                    error={showError("offerPrice")}
                  >
                    <input
                      id="pf-offer"
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={values.offerPrice}
                      onChange={set("offerPrice")}
                      aria-invalid={!!showError("offerPrice")}
                      aria-describedby={
                        showError("offerPrice") ? "pf-offer-error" : undefined
                      }
                      className={inputClass}
                    />
                    {discount > 0 && !showError("offerPrice") && (
                      <p className="mt-1.5 text-sm text-[#2F5D3A]">
                        Customers see {discount}% off.
                      </p>
                    )}
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="pf-stock"
                    label="Stock quantity"
                    error={showError("stock")}
                  >
                    <input
                      id="pf-stock"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={values.stock}
                      onChange={set("stock")}
                      aria-invalid={!!showError("stock")}
                      aria-describedby={
                        showError("stock") ? "pf-stock-error" : undefined
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field id="pf-badge" label="Badge" optional>
                    <SelectBox
                      id="pf-badge"
                      value={values.badge}
                      onChange={set("badge")}
                    >
                      {badgeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectBox>
                  </Field>
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values.isFeatured}
                    onChange={(event) =>
                      setValues((previousValues) => ({
                        ...previousValues,
                        isFeatured: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />
                  <span>
                    <span className="block text-[15px] font-medium">
                      Feature on the home page
                    </span>
                    <span className="block text-sm text-secondary/65">
                      Shows in the Featured products section.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {/* Size */}
            <section>
              <SectionTitle>Size (cm)</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["w", "Width"],
                  ["d", "Depth"],
                  ["h", "Height"],
                ].map(([key, label]) => (
                  <Field key={key} id={`pf-${key}`} label={label}>
                    <input
                      id={`pf-${key}`}
                      type="number"
                      min="1"
                      inputMode="decimal"
                      value={values[key]}
                      onChange={set(key)}
                      aria-invalid={!!(attempted && errors[key])}
                      aria-describedby={dimensionsInvalid ? "pf-size-error" : undefined}
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>
              {dimensionsInvalid && (
                <p id="pf-size-error" className="mt-2 text-sm text-[#9B2C1F]">
                  Enter the width, depth and height in cm (1 or more).
                </p>
              )}
            </section>

            {/* Images */}
            <section>
              <SectionTitle>Images</SectionTitle>

              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <label htmlFor="pf-image" className="sr-only">
                    Image link
                  </label>
                  <input
                    id="pf-image"
                    value={imageInput}
                    onChange={(event) => {
                      setImageInput(event.target.value);
                      setImageError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addImage();
                      }
                    }}
                    placeholder="https://... or /images/sofa.jpg"
                    aria-invalid={!!imageError || !!showError("images")}
                    aria-describedby="pf-image-error"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-primary px-4 text-[15px] font-medium text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Plus size={16} aria-hidden="true" />
                  Add
                </button>
              </div>

              <p id="pf-image-error" className="mt-1.5 text-sm text-[#9B2C1F]">
                {imageError || showError("images") || ""}
              </p>
              <p className="text-sm text-secondary/60">
                The first image is the cover shown in the shop.
              </p>

              {values.images.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {values.images.map((url, index) => (
                    <li
                      key={url}
                      className="overflow-hidden rounded-2xl border border-accent/60 bg-background"
                    >
                      <div className="relative aspect-4/3 bg-accent/30">
                        <ImagePreview src={url} />
                        {index === 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-background">
                            Cover
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                        {index === 0 ? (
                          <span className="px-1 text-xs text-secondary/60">
                            Main image
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => makeCover(url)}
                            className="rounded-lg px-1.5 py-1 text-xs font-medium text-primary hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            Make cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          aria-label={`Remove image ${index + 1}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-[#9B2C1F] hover:bg-[#9B2C1F]/10 focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
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
                {saving ? "Saving..." : isEdit ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}