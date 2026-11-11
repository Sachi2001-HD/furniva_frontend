import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Download, X } from "lucide-react";
import PiecePreview from "./piecePreview";
import SendRequest from "./sendRequest";

export const buildBriefText = (brief) =>
  [
    "FURNIVA · CUSTOM FURNITURE BRIEF",
    `Prepared on ${brief.date}`,
    "",
    `Piece: ${brief.piece.label}`,
    `Timber: ${brief.wood.label}`,
    `Finish: ${brief.finish.label}`,
    `Size: ${brief.size.w} cm wide × ${brief.size.d} cm deep × ${brief.size.h} cm high`,
    "",
    `Name: ${brief.name}`,
    `Email: ${brief.email}`,
    brief.notes ? `Notes: ${brief.notes}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

export default function BriefModal({ brief, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const text = buildBriefText(brief);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
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
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2200);

    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setCopied(true);
    } catch {
      setCopyFailed(true);
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `furniva-brief-${brief.piece.key}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const rows = [
    ["Piece", brief.piece.label],
    ["Timber", brief.wood.label],
    ["Finish", brief.finish.label],
    [
      "Size",
      `${brief.size.w} × ${brief.size.d} × ${brief.size.h} cm (W × D × H)`,
    ],
    ["Name", brief.name],
    ["Email", brief.email],
    ...(brief.notes ? [["Notes", brief.notes]] : []),
  ];

  const action =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div
      className="fixed inset-0 z-80 grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <div
        ref={panelRef}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2rem border border-accent/50 bg-[#FDF8F1] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2F5D3A] text-white">
              <Check size={22} aria-hidden="true" />
            </span>

            <div>
              <h2 id="brief-title" className="font-display text-2xl sm:text-3xl">
                Your brief is ready
              </h2>
              <p className="text-sm text-secondary/65">
                Prepared on {brief.date}
              </p>
            </div>
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

        <div className="grid gap-8 px-6 py-6 sm:grid-cols-[220px_minmax(0,1fr)] sm:px-8 sm:py-8">
          <div className="self-start rounded-2xl bg-[#F5E8DC] p-3">
            <PiecePreview
              shape={brief.piece.shape}
              label={brief.piece.label}
              color={brief.wood.color}
              width={brief.size.w}
              height={brief.size.h}
            />
          </div>

          <dl className="space-y-3">
            {rows.map(([term, detail]) => (
              <div
                key={term}
                className="grid grid-cols-[80px_minmax(0,1fr)] gap-3"
              >
                <dt className="text-sm text-secondary/60">{term}</dt>
                <dd className="whitespace-pre-wrap wrap-break-word font-medium">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-accent/50 px-6 py-6 sm:px-8">

          {/* Submit Custom Furniture Request */}
          <div className="mb-5">
            <SendRequest brief={brief} />
          </div>

          {/* Copy and Download Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copy}
              className={`${action} ${
                copied
                  ? "bg-[#1F5C36] text-white"
                  : "bg-primary text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] hover:bg-secondary"
              }`}
            >
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy brief"}
            </button>

            <button
              type="button"
              onClick={download}
              className={`${action} border border-accent bg-background text-primary hover:bg-accent/30`}
            >
              <Download size={18} aria-hidden="true" />
              Download
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`${action} text-primary hover:bg-accent/30`}
            >
              Edit details
            </button>
          </div>

          {copyFailed && (
            <p role="alert" className="mt-3 text-sm text-[#9B2C1F]">
              We couldn’t copy it automatically. Use Download instead.
            </p>
          )}

          {/* Updated Request Information */}
          <p className="mt-5 text-sm leading-6 text-secondary/65">
            Sending your brief creates a request we’ll review and answer with a
            quote. You can follow it in{" "}
            <Link
              to="/my-custom-requests"
              className="font-medium text-primary hover:underline"
            >
              my requests
            </Link>
            , or{" "}
            <Link
              to="/consultation"
              className="font-medium text-primary hover:underline"
            >
              talk to a designer
            </Link>{" "}
            first.
          </p>
        </div>
      </div>
    </div>
  );
}