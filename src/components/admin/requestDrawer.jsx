import { useRef, useState } from "react";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Video, X } from "lucide-react";
import Pill from "../ui/pill";
import PiecePreview from "../custom/piecePreview";
import { PIECES, WOODS } from "../custom/options";
import { useDialog } from "../../hooks/useDialog";
import { apiRequest } from "../../utils/api";
import { formatDate, formatLongDate, formatMoney, formatTime } from "../../utils/format";
import { statusTone } from "../../utils/requestStatus";

const MODES = { video: Video, "in-store": MapPin, undecided: MessageCircle };
const MODE_LABELS = { video: "Video call", "in-store": "In-store visit", undecided: "Not decided" };
const WINDOW_HOURS = { Morning: "10:00", Afternoon: "14:00", Evening: "18:00" };

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15";
const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const outline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-accent bg-background px-6 text-[15px] font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
const danger =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#EBB8B0] bg-[#F8DCD7]/60 px-6 text-[15px] font-medium text-[#8A1F14] transition hover:bg-[#F8DCD7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C1F] disabled:cursor-not-allowed disabled:opacity-60";

const toLocalInput = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const startingTime = (raw) => {
  if (raw.scheduledAt) return toLocalInput(raw.scheduledAt);
  if (raw.preferredDate) {
    const day = new Date(raw.preferredDate).toISOString().slice(0, 10);
    return `${day}T${WINDOW_HOURS[raw.preferredTime] ?? "10:00"}`;
  }
  return "";
};

function Section({ title, children }) {
  return (
    <section className="border-t border-accent/40 pt-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-secondary/60">{title}</h3>
      {children}
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-secondary/60">{label}</dt>
      <dd className="mt-0.5 wrap-break-word text-[15px]">{children}</dd>
    </div>
  );
}

export default function RequestDrawer({ item, token, onClose, onUpdated }) {
  const panelRef = useRef(null);
  useDialog(panelRef, onClose);

  const raw = item.raw;
  const isConsultation = item.kind === "consultation";
  const base_ = isConsultation ? `/consultations/${raw._id}` : `/custom-requests/${raw._id}`;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  // Consultation form
  const [when, setWhen] = useState(() => (isConsultation ? startingTime(raw) : ""));
  const [link, setLink] = useState(raw.meetingLink ?? "");

  // Quote form
  const [amount, setAmount] = useState(raw.quote?.amount ? String(raw.quote.amount) : "");
  const [validUntil, setValidUntil] = useState(
    raw.quote?.validUntil ? new Date(raw.quote.validUntil).toISOString().slice(0, 10) : ""
  );
  const [quoteNote, setQuoteNote] = useState(raw.quote?.note ?? "");

  const call = async (path, body, success) => {
    setBusy(true);
    setError("");

    try {
      const updated = await apiRequest(path, { method: "PATCH", token, body });
      onUpdated(item, updated, success);
      setNote("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const needNote = () => {
    if (note.trim()) return true;
    setError("Add a short reason so the customer knows why.");
    return false;
  };

  // Consultations
  const saveConsultation = (confirm) => {
    if (!when) {
      setError("Choose the date and time first.");
      return;
    }
    call(
      base_,
      {
        scheduledAt: new Date(when).toISOString(),
        meetingLink: link.trim(),
        adminNote: note.trim() || raw.adminNote || "",
        ...(confirm ? { status: "Confirmed" } : {}),
      },
      confirm ? "Consultation confirmed" : "Changes saved"
    );
  };

  // Custom designs
  const sendQuote = () => {
    if (!(Number(amount) > 0)) {
      setError("Enter the quote amount.");
      return;
    }
    call(
      `${base_}/quote`,
      {
        amount: Number(amount),
        note: quoteNote.trim() || undefined,
        validUntil: validUntil || undefined,
      },
      "Quote sent to the customer"
    );
  };

  const changeStatus = (status, success, requireNote = false) => {
    if (requireNote && !needNote()) return;

    const path = isConsultation ? base_ : `${base_}/status`;
    call(path, { status, adminNote: note.trim() || raw.adminNote || "" }, success);
  };

  const piece = PIECES.find((entry) => entry.label === raw.piece);
  const wood = WOODS.find((entry) => entry.label === raw.timber);
  const ModeIcon = MODES[raw.mode] ?? MessageCircle;

  const noteField = (label, id) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea
        id={id}
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setError("");
        }}
        maxLength={500}
        className={`${base} min-h-20 resize-y py-3 leading-6`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-80" role="dialog" aria-modal="true" aria-labelledby="request-title">
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
        <div className="flex items-start justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary/60">
              {isConsultation ? "Consultation" : "Custom design"} · {raw.reference}
            </p>
            <h2 id="request-title" className="mt-1 truncate font-display text-2xl">{item.title}</h2>
            <div className="mt-2"><Pill tone={statusTone(item.status)}>{item.status}</Pill></div>
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

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <Section title="Customer">
            <p className="font-display text-xl">{item.name}</p>
            <p className="text-sm text-secondary/60">
              {raw.user?.email || raw.user ? "Has an account" : "Guest"} · Received {formatDate(raw.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={`mailto:${item.email}`} className={`${outline} h-10 px-4 text-sm`}>
                <Mail size={15} aria-hidden="true" />
                {item.email}
              </a>
              {item.phone && (
                <a href={`tel:${item.phone}`} className={`${outline} h-10 px-4 text-sm`}>
                  <Phone size={15} aria-hidden="true" />
                  {item.phone}
                </a>
              )}
            </div>
          </Section>

          {isConsultation ? (
            <Section title="Request">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Format">
                  <span className="inline-flex items-center gap-2">
                    <ModeIcon size={16} aria-hidden="true" />
                    {MODE_LABELS[raw.mode] ?? raw.mode}
                  </span>
                </Detail>
                <Detail label="Space">{raw.space}</Detail>
                <Detail label="Budget">{raw.budget || "Not given"}</Detail>
                <Detail label="Preferred time">
                  {raw.preferredDate ? formatLongDate(raw.preferredDate, true) : "No date chosen"}
                  {raw.preferredTime && raw.preferredTime !== "Any time" ? ` · ${raw.preferredTime}` : ""}
                </Detail>
              </dl>
              <p className="mt-4 text-sm text-secondary/60">Their message</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px]">{raw.message}</p>
            </Section>
          ) : (
            <Section title="The design">
              <div className="flex flex-wrap items-center gap-5">
                <div className="w-44 shrink-0 rounded-2xl bg-[#F5E8DC] p-2">
                  <PiecePreview
                    shape={piece?.shape ?? "table"}
                    label={raw.piece}
                    color={wood?.color ?? "#8F5A38"}
                    width={raw.dimensions?.w}
                    height={raw.dimensions?.h}
                  />
                </div>
                <dl className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Detail label="Piece">{raw.piece}</Detail>
                  <Detail label="Timber">{raw.timber}</Detail>
                  <Detail label="Finish">{raw.finish}</Detail>
                  <Detail label="Size (W × D × H)">
                    {raw.dimensions?.w} × {raw.dimensions?.d} × {raw.dimensions?.h} cm
                  </Detail>
                </dl>
              </div>
              {raw.notes && (
                <>
                  <p className="mt-4 text-sm text-secondary/60">Their notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-[15px]">{raw.notes}</p>
                </>
              )}
            </Section>
          )}

          {raw.adminNote && (
            <Section title="Your last note to the customer">
              <p className="whitespace-pre-wrap text-[15px]">{raw.adminNote}</p>
            </Section>
          )}

          {/* Actions: consultations */}
          {isConsultation && ["Pending", "Confirmed"].includes(raw.status) && (
            <Section title={raw.status === "Pending" ? "Confirm the consultation" : "Consultation details"}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="rq-when" className="mb-1.5 block text-sm font-medium">Date and time</label>
                  <input
                    id="rq-when"
                    type="datetime-local"
                    value={when}
                    onChange={(event) => {
                      setWhen(event.target.value);
                      setError("");
                    }}
                    data-autofocus
                    className={`${base} h-12`}
                  />
                  {raw.scheduledAt && (
                    <p className="mt-1.5 text-sm text-secondary/60">
                      Currently {formatLongDate(raw.scheduledAt)} at {formatTime(raw.scheduledAt)}
                    </p>
                  )}
                </div>

                {raw.mode !== "in-store" && (
                  <div>
                    <label htmlFor="rq-link" className="mb-1.5 block text-sm font-medium">
                      Meeting link <span className="font-normal text-secondary/60">(optional)</span>
                    </label>
                    <input
                      id="rq-link"
                      value={link}
                      onChange={(event) => setLink(event.target.value)}
                      placeholder="https://meet.example.com/..."
                      className={`${base} h-12`}
                    />
                  </div>
                )}

                {noteField("Note to the customer (optional)", "rq-note")}

                <div className="flex flex-wrap gap-3">
                  {raw.status === "Pending" ? (
                    <button type="button" disabled={busy} onClick={() => saveConsultation(true)} className={primary}>
                      {busy ? "Saving..." : "Confirm consultation"}
                    </button>
                  ) : (
                    <>
                      <button type="button" disabled={busy} onClick={() => saveConsultation(false)} className={primary}>
                        {busy ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus("Completed", "Marked as completed")}
                        className={outline}
                      >
                        Mark completed
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus("Cancelled", "Consultation cancelled", true)}
                    className={danger}
                  >
                    {raw.status === "Pending" ? "Decline" : "Cancel"}
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* Actions: custom designs */}
          {!isConsultation && ["Submitted", "In review", "Quoted"].includes(raw.status) && (
            <Section title={raw.status === "Quoted" ? "Update the quote" : "Send a quote"}>
              {raw.quote && (
                <p className="mb-4 rounded-2xl bg-[#DDEBD8] px-4 py-3 text-[15px] text-[#2F5D3A]">
                  Current quote: <strong>{formatMoney(raw.quote.amount)}</strong>
                  {raw.quote.validUntil ? `, valid until ${formatDate(raw.quote.validUntil)}` : ""}
                </p>
              )}

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rq-amount" className="mb-1.5 block text-sm font-medium">Price (Rs.)</label>
                    <input
                      id="rq-amount"
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setError("");
                      }}
                      data-autofocus
                      className={`${base} h-12`}
                    />
                  </div>
                  <div>
                    <label htmlFor="rq-valid" className="mb-1.5 block text-sm font-medium">
                      Valid until <span className="font-normal text-secondary/60">(optional)</span>
                    </label>
                    <input
                      id="rq-valid"
                      type="date"
                      value={validUntil}
                      onChange={(event) => setValidUntil(event.target.value)}
                      className={`${base} h-12`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rq-quote-note" className="mb-1.5 block text-sm font-medium">
                    What’s included <span className="font-normal text-secondary/60">(optional)</span>
                  </label>
                  <textarea
                    id="rq-quote-note"
                    value={quoteNote}
                    onChange={(event) => setQuoteNote(event.target.value)}
                    maxLength={500}
                    placeholder="Delivery, assembly, lead time..."
                    className={`${base} min-h-20 resize-y py-3 leading-6`}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button" disabled={busy} onClick={sendQuote} className={primary}>
                    {busy ? "Sending..." : raw.status === "Quoted" ? "Update quote" : "Send quote"}
                  </button>
                  {raw.status === "Submitted" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => changeStatus("In review", "Moved to in review")}
                      className={outline}
                    >
                      Start review
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-accent/40 pt-6">
                {noteField("Not able to make this piece? Say why", "rq-decline-note")}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => changeStatus("Declined", "Request declined", true)}
                  className={danger}
                >
                  Decline request
                </button>
              </div>
            </Section>
          )}

          {!isConsultation && raw.status === "Accepted" && (
            <Section title="Next step">
              <p className="mb-4 text-[15px] text-secondary/75">
                The customer accepted the quote. Start building when you’re ready.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => changeStatus("In production", "Moved to production")}
                className={primary}
              >
                Start production
              </button>
            </Section>
          )}

          {!isConsultation && raw.status === "In production" && (
            <Section title="Next step">
              <p className="mb-4 text-[15px] text-secondary/75">
                Mark it completed once the piece is finished and delivered.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => changeStatus("Completed", "Marked as completed")}
                className={primary}
              >
                Mark completed
              </button>
            </Section>
          )}

          {error && (
            <p role="alert" className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]">
              {error}
            </p>
          )}
        </div>

        {isConsultation && raw.status === "Confirmed" && raw.meetingLink && (
          <div className="border-t border-accent/50 px-6 py-4">
            <a
              href={raw.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${outline} w-full`}
            >
              Open meeting link
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}