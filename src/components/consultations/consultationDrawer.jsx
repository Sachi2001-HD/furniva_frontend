import { useRef, useState } from "react";
import { Phone, Video, X } from "lucide-react";
import { useDialog } from "../../hooks/useDialog";

const TOPICS = ["Room planning", "Choosing furniture", "A custom piece", "Something else"];
const ROOMS = ["Living room", "Bedroom", "Dining room", "Office", "Whole home", "Other"];
const WINDOWS = ["Morning", "Afternoon", "Evening"];
const MODES = [
  { value: "online", label: "Online video call", hint: "Meet face to face from home.", icon: Video },
  { value: "phone", label: "Phone call", hint: "We’ll call you on your number.", icon: Phone },
];
const MAX_DAYS = 90;

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";

const day = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function validate(v) {
  const e = {};
  if (!v.preferredDate) e.preferredDate = "Choose a date.";
  else if (v.preferredDate < day()) e.preferredDate = "Choose today or a later date.";
  else if (v.preferredDate > day(MAX_DAYS)) e.preferredDate = `Choose a date within the next ${MAX_DAYS} days.`;

  if (!/^\+?[\d\s-]{7,18}$/.test(v.phone.trim()) || v.phone.replace(/\D/g, "").length < 7) {
    e.phone = "Enter a valid phone number.";
  }
  return e;
}

function Chips({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span className="inline-flex h-11 items-center rounded-full border border-accent/70 bg-accent/30 px-5 text-[15px] transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ConsultationDrawer({ defaultPhone = "", saving, error, onClose, onSubmit }) {
  const panelRef = useRef(null);
  useDialog(panelRef, onClose);

  const [attempted, setAttempted] = useState(false);
  const [values, setValues] = useState({
    topic: TOPICS[0],
    mode: "online",
    preferredDate: "",
    timeWindow: "Morning",
    phone: defaultPhone,
    roomType: "",
    budget: "",
    message: "",
  });

  const set = (key) => (value) => setValues((previous) => ({ ...previous, [key]: value }));
  const onInput = (key) => (event) => set(key)(event.target.value);

  const errors = validate(values);
  const showError = (key) => (attempted ? errors[key] : undefined);

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      setTimeout(() => panelRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }

    onSubmit({
      ...values,
      phone: values.phone.trim(),
      budget: values.budget.trim(),
      message: values.message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-80" role="dialog" aria-modal="true" aria-labelledby="consult-title">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <aside
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#FDF8F1] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div>
            <h2 id="consult-title" className="font-display text-2xl">Book a consultation</h2>
            <p className="mt-0.5 text-sm text-secondary/65">
              Tell us what you’d like help with and when suits you.
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

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
            <Chips legend="What would you like help with?" name="topic" options={TOPICS} value={values.topic} onChange={set("topic")} />

            <fieldset>
              <legend className="mb-3 text-sm font-medium">How would you like to meet?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODES.map(({ value, label, hint, icon: Icon }) => (
                  <label key={value} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={value}
                      checked={values.mode === value}
                      onChange={() => set("mode")(value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-full gap-3 rounded-2xl border border-accent/70 bg-background p-4 transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_0_3px_rgba(113,62,38,0.12)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
                        <Icon size={19} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium">{label}</span>
                        <span className="block text-sm text-secondary/65">{hint}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-date" className="mb-1.5 block text-sm font-medium">Preferred date</label>
                <input
                  id="c-date"
                  type="date"
                  min={day()}
                  max={day(MAX_DAYS)}
                  value={values.preferredDate}
                  onChange={onInput("preferredDate")}
                  data-autofocus
                  aria-invalid={!!showError("preferredDate")}
                  aria-describedby={showError("preferredDate") ? "c-date-error" : undefined}
                  className={`${base} h-12`}
                />
                {showError("preferredDate") && (
                  <p id="c-date-error" className="mt-1.5 text-sm text-[#9B2C1F]">{errors.preferredDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium">Phone number</label>
                <input
                  id="c-phone"
                  type="tel"
                  value={values.phone}
                  onChange={onInput("phone")}
                  autoComplete="tel"
                  placeholder="e.g. 077 123 4567"
                  aria-invalid={!!showError("phone")}
                  aria-describedby={showError("phone") ? "c-phone-error" : undefined}
                  className={`${base} h-12`}
                />
                {showError("phone") && (
                  <p id="c-phone-error" className="mt-1.5 text-sm text-[#9B2C1F]">{errors.phone}</p>
                )}
              </div>
            </div>

            <Chips legend="Best time of day" name="window" options={WINDOWS} value={values.timeWindow} onChange={set("timeWindow")} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-room" className="mb-1.5 block text-sm font-medium">
                  Room <span className="font-normal text-secondary/60">(optional)</span>
                </label>
                <select id="c-room" value={values.roomType} onChange={onInput("roomType")} className={`${base} h-12`}>
                  <option value="">Not sure yet</option>
                  {ROOMS.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="c-budget" className="mb-1.5 block text-sm font-medium">
                  Budget <span className="font-normal text-secondary/60">(optional)</span>
                </label>
                <input
                  id="c-budget"
                  value={values.budget}
                  onChange={onInput("budget")}
                  maxLength={60}
                  placeholder="e.g. Rs. 300,000"
                  className={`${base} h-12`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium">
                Tell us about your space <span className="font-normal text-secondary/60">(optional)</span>
              </label>
              <textarea
                id="c-message"
                value={values.message}
                onChange={onInput("message")}
                maxLength={1000}
                placeholder="Room size, style you like, pieces you already have…"
                className={`${base} min-h-28 resize-y py-3 leading-6`}
              />
            </div>
          </div>

          <div className="border-t border-accent/50 bg-[#FDF8F1] px-6 py-4">
            {error && (
              <p role="alert" className="mb-3 rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]">
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
                {saving ? "Sending..." : "Request consultation"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}