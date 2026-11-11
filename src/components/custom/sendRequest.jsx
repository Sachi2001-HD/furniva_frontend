import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, LoaderCircle, Send } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { createCustomRequest } from "../../utils/customRequestApi";

export default function SendRequest({ brief }) {
  const navigate = useNavigate();
  const { isLoggedIn, token, logout } = useAuth();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState("");

  const toLogin = () =>
    navigate("/login", { state: { from: "/custom-furniture" } });

  const send = async () => {
    if (!isLoggedIn) {
      toLogin();
      return;
    }

    setSending(true);
    setError("");

    try {
      setSent(
        await createCustomRequest(token, {
          piece: brief.piece.label,
          timber: brief.wood.label,
          finish: brief.finish.label,
          dimensions: brief.size,
          notes: brief.notes,
          contactName: brief.name,
          contactEmail: brief.email,
        })
      );
    } catch (failure) {
      if (failure.status === 401) {
        logout();
        toLogin();
        return;
      }
      setError(failure.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#BBD6B2] bg-[#DDEBD8] p-5 text-[#2F5D3A]"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2F5D3A] text-white">
            <Check size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">Request sent</p>
            <p className="text-sm">Reference {sent.reference}. We’ll review it and reply with a quote.</p>
          </div>
        </div>
        <Link
          to="/my-custom-requests"
          className="inline-flex h-11 items-center rounded-full bg-[#2F5D3A] px-5 text-sm font-medium text-white transition hover:bg-[#244a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5D3A]"
        >
          View my requests
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={send}
        disabled={sending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? (
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Send size={18} aria-hidden="true" />
        )}
        {sending ? "Sending..." : isLoggedIn ? "Send request to Furniva" : "Sign in to send request"}
      </button>

      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]">
          {error}
        </p>
      )}
    </div>
  );
}