import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { formatDate } from "../../utils/format";
import { FINISHES, PIECES, SIZE_FIELDS, WOODS } from "./options";
import PiecePreview from "./piecePreview";
import BriefModal from "./briefModal";

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";
const inputClass = `${base} h-12`;

const toStrings = (sizes) => ({
  w: String(sizes.w),
  d: String(sizes.d),
  h: String(sizes.h),
});

const showValue = (value) =>
  value !== "" && Number.isFinite(Number(value)) ? value : "–";

function validate({ size, piece, details }) {
  const errors = {};

  SIZE_FIELDS.forEach(({ key }) => {
    const [min, max] = piece.ranges[key];
    const number = Number(size[key]);

    if (
      size[key] === "" ||
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      errors[key] = `Enter ${min} to ${max} cm.`;
    }
  });

  if (!details.name.trim()) errors.name = "Enter your name.";

  if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function WoodSwatch({ color, round = true, className = "h-12 w-12" }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12),inset_0_-6px_10px_rgba(0,0,0,0.12)] ${
        round ? "rounded-full" : "rounded-2xl"
      } ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage:
          "repeating-linear-gradient(95deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 7px), repeating-linear-gradient(88deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 11px)",
      }}
    />
  );
}

function StepLegend({ n, children }) {
  return (
    <legend className="mb-5 flex items-center gap-3 text-lg font-medium">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm text-background">
        {n}
      </span>
      {children}
    </legend>
  );
}

function Chip({ name, value, checked, onChange, children }) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="inline-flex h-12 items-center rounded-full border border-accent/70 bg-accent/30 px-6 text-base transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-background peer-checked:shadow-[0_8px_20px_rgba(113,62,38,0.25)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
        {children}
      </span>
    </label>
  );
}

function SizeField({ id, label, value, range, error, onChange }) {
  const [min, max] = range;
  const number = Number(value);

  const sliderValue = Number.isFinite(number)
    ? Math.min(Math.max(number, min), max)
    : min;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint`}
          className={`${inputClass} pr-12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-secondary/60"
        >
          cm
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={sliderValue}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} slider`}
        className="mt-3 h-2 w-full cursor-pointer accent-primary"
      />

      <p
        id={`${id}-hint`}
        className={`mt-1.5 text-sm ${
          error ? "text-[#9B2C1F]" : "text-secondary/60"
        }`}
      >
        {error || `${min} to ${max} cm`}
      </p>
    </div>
  );
}

export default function DesignStudio() {
  const { user } = useAuth();
  const formRef = useRef(null);

  const [pieceKey, setPieceKey] = useState(PIECES[0].key);
  const [woodKey, setWoodKey] = useState(WOODS[0].key);
  const [finishKey, setFinishKey] = useState(FINISHES[0].key);
  const [size, setSize] = useState(() => toStrings(PIECES[0].defaults));
  const [sizeTouched, setSizeTouched] = useState(false);

  const [details, setDetails] = useState(() => ({
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: user?.email ?? "",
    notes: "",
  }));

  const [attempted, setAttempted] = useState(false);
  const [brief, setBrief] = useState(null);

  const piece = PIECES.find((item) => item.key === pieceKey);
  const wood = WOODS.find((item) => item.key === woodKey);
  const finish = FINISHES.find((item) => item.key === finishKey);

  const errors = validate({ size, piece, details });
  const sizeKeys = SIZE_FIELDS.map((field) => field.key);

  const showError = (key) =>
    attempted || (sizeKeys.includes(key) && sizeTouched)
      ? errors[key]
      : undefined;

  const choosePiece = (key) => {
    setPieceKey(key);

    // Switch to the new piece's typical size, unless the customer typed their own.
    if (!sizeTouched) {
      setSize(toStrings(PIECES.find((item) => item.key === key).defaults));
    }
  };

  const resetSize = () => {
    setSize(toStrings(piece.defaults));
    setSizeTouched(false);
  };

  const setDimension = (key) => (value) => {
    setSize((previous) => ({ ...previous, [key]: value }));
    setSizeTouched(true);
  };

  const setDetail = (key) => (event) =>
    setDetails((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      setTimeout(
        () =>
          formRef.current
            ?.querySelector('[aria-invalid="true"]')
            ?.focus(),
        0
      );
      return;
    }

    setBrief({
      piece,
      wood,
      finish,
      size: {
        w: Number(size.w),
        d: Number(size.d),
        h: Number(size.h),
      },
      name: details.name.trim(),
      email: details.email.trim(),
      notes: details.notes.trim(),
      date: formatDate(new Date()),
    });
  };

  return (
    <section
      id="design-studio"
      aria-labelledby="studio-heading"
      className="scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-[1680px]">
        <p className="text-sm uppercase tracking-[0.2em] text-[#445444]">
          Design studio
        </p>

        <h2
          id="studio-heading"
          className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Build your piece
        </h2>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-16">
          <form
            id="brief-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-14"
          >
            {/* 1. Piece */}
            <fieldset>
              <StepLegend n={1}>What would you like made?</StepLegend>

              <div className="flex flex-wrap gap-3">
                {PIECES.map((item) => (
                  <Chip
                    key={item.key}
                    name="piece"
                    value={item.key}
                    checked={item.key === pieceKey}
                    onChange={() => choosePiece(item.key)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            {/* 2. Wood */}
            <fieldset>
              <StepLegend n={2}>Choose your wood</StepLegend>

              <div className="grid gap-4 sm:grid-cols-3">
                {WOODS.map((item) => (
                  <label key={item.key} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="wood"
                      value={item.key}
                      checked={item.key === woodKey}
                      onChange={() => setWoodKey(item.key)}
                      className="peer sr-only"
                    />

                    <span className="relative flex items-center gap-4 rounded-2xl border border-accent/70 bg-accent/30 p-4 transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-[#FDF8F1] peer-checked:shadow-[0_0_0_3px_rgba(113,62,38,0.15)] peer-checked:[&_.check]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      <WoodSwatch color={item.color} />

                      <span className="min-w-0">
                        <span className="block font-medium">
                          {item.label}
                        </span>
                        <span className="block text-sm text-secondary/65">
                          {item.note}
                        </span>
                      </span>

                      <Check
                        size={18}
                        aria-hidden="true"
                        className="check absolute right-4 top-4 text-primary opacity-0 transition"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 3. Finish */}
            <fieldset>
              <StepLegend n={3}>Finish</StepLegend>

              <div className="flex flex-wrap gap-3">
                {FINISHES.map((item) => (
                  <Chip
                    key={item.key}
                    name="finish"
                    value={item.key}
                    checked={item.key === finishKey}
                    onChange={() => setFinishKey(item.key)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>

              <p aria-live="polite" className="mt-4 text-secondary/70">
                {finish.note}
              </p>
            </fieldset>

            {/* 4. Size */}
            <fieldset>
              <StepLegend n={4}>Size in centimetres</StepLegend>

              <div className="grid gap-6 sm:grid-cols-3">
                {SIZE_FIELDS.map(({ key, label }) => (
                  <SizeField
                    key={key}
                    id={`size-${key}`}
                    label={label}
                    value={size[key]}
                    range={piece.ranges[key]}
                    error={showError(key)}
                    onChange={setDimension(key)}
                  />
                ))}
              </div>

              {sizeTouched && (
                <button
                  type="button"
                  onClick={resetSize}
                  className="mt-5 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Reset to a typical {piece.label.toLowerCase()} size
                </button>
              )}
            </fieldset>

            {/* 5. Details */}
            <fieldset>
              <StepLegend n={5}>Your details</StepLegend>

              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="brief-name"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Name
                    </label>

                    <input
                      id="brief-name"
                      value={details.name}
                      onChange={setDetail("name")}
                      autoComplete="name"
                      aria-invalid={!!showError("name")}
                      aria-describedby={
                        showError("name") ? "brief-name-error" : undefined
                      }
                      className={inputClass}
                    />

                    {showError("name") && (
                      <p
                        id="brief-name-error"
                        className="mt-1.5 text-sm text-[#9B2C1F]"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="brief-email"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Email
                    </label>

                    <input
                      id="brief-email"
                      type="email"
                      value={details.email}
                      onChange={setDetail("email")}
                      autoComplete="email"
                      aria-invalid={!!showError("email")}
                      aria-describedby={
                        showError("email") ? "brief-email-error" : undefined
                      }
                      className={inputClass}
                    />

                    {showError("email") && (
                      <p
                        id="brief-email-error"
                        className="mt-1.5 text-sm text-[#9B2C1F]"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="brief-notes"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Anything else?
                    <span className="ml-1.5 font-normal text-secondary/60">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="brief-notes"
                    value={details.notes}
                    onChange={setDetail("notes")}
                    placeholder="Room, style references, drawers, legs, colour of upholstery…"
                    className={`${base} min-h-36 resize-y py-3 leading-6`}
                  />
                </div>
              </div>
            </fieldset>
          </form>

          {/* Live summary */}
          <aside
            aria-labelledby="summary-heading"
            className="lg:sticky lg:top-28"
          >
            <div className="rounded-2rem border border-accent/60 bg-[#F5E8DC] p-6 shadow-[0_20px_50px_rgba(113,62,38,0.12)] sm:p-8">
              <p
                id="summary-heading"
                className="text-xs font-medium uppercase tracking-[0.2em] text-secondary/60"
              >
                Your design
              </p>

              <div className="mt-5 rounded-2xl bg-[#FDF8F1]/70 p-4">
                <PiecePreview
                  shape={piece.shape}
                  label={piece.label}
                  color={wood.color}
                  width={size.w}
                  height={size.h}
                />

                <p className="mt-1 text-center text-xs text-secondary/55">
                  Front view, drawn to scale
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <WoodSwatch
                  color={wood.color}
                  round={false}
                  className="h-14 w-14"
                />

                <div className="min-w-0">
                  <p
                    aria-live="polite"
                    className="font-display text-3xl leading-tight"
                  >
                    {piece.label}
                  </p>

                  <p className="text-secondary/70">
                    {wood.label} · {finish.label}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-accent/60 py-5 text-center">
                {SIZE_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-[0.12em] text-secondary/60">
                      {label}
                    </dt>

                    <dd className="mt-1 font-display text-3xl">
                      {showValue(size[key])}
                      <span className="ml-1 text-base text-secondary/70">
                        cm
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                type="submit"
                form="brief-form"
                className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-lg font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
              >
                Prepare my brief
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition motion-safe:group-hover:translate-x-1"
                />
              </button>

              {/* Summary note */}
              <p className="mt-4 text-sm leading-6 text-secondary/65">
                Your details stay on this page until you send them. When you’re
                ready, send your brief as a request and we’ll review it and
                reply with a quote.
              </p>
            </div>
          </aside>
        </div>

        {/* Phones: summary*/}
        <div className="sticky bottom-4 z-30 mt-10 lg:hidden">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-accent/60 bg-[#F5E8DC]/95 p-3 pl-5 shadow-[0_12px_30px_rgba(113,62,38,0.2)] backdrop-blur">
            <p className="min-w-0 truncate text-sm">
              <span className="font-medium">{piece.label}</span>
              <span className="text-secondary/70"> · {wood.label}</span>
            </p>

            <button
              type="submit"
              form="brief-form"
              className="inline-flex h-11 shrink-0 items-center rounded-full bg-primary px-5 text-[15px] font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Prepare my brief
            </button>
          </div>
        </div>
      </div>

      {brief && <BriefModal brief={brief} onClose={() => setBrief(null)} />}
    </section>
  );
}