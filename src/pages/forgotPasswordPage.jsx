import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, KeyRound, LoaderCircle, Mail, MailCheck } from "lucide-react";
import AuthShell from "../components/auth/authShell";
import { apiRequest } from "../utils/api";

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async (address) => {
    setLoading(true);
    setError("");

    try {
      await apiRequest("/password/forgot", { method: "POST", body: { email: address } });
      setSentTo(address);
      setCooldown(COOLDOWN_SECONDS);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    send(value);
  };

  if (sentTo) {
    return (
      <AuthShell>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
          <MailCheck size={28} aria-hidden="true" />
        </span>

        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-primary">
          Check your inbox
        </h1>
        <p className="mt-3 text-base leading-7 text-secondary/75" role="status">
          If an account exists for <span className="font-medium text-secondary">{sentTo}</span>,
          we’ve sent a link to reset your password. It expires in 30 minutes. If you
          can’t see it, check your spam folder.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => send(sentTo)}
            disabled={cooldown > 0 || loading}
            className="inline-flex h-12 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSentTo("");
              setError("");
            }}
            className="inline-flex h-12 items-center rounded-full px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Use a different email
          </button>
        </div>

        <Link
          to="/login"
          className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <KeyRound size={26} aria-hidden="true" />
      </span>

      <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-primary">
        Forgot your password?
      </h1>
      <p className="mt-3 text-base leading-7 text-secondary/75">
        No problem. Enter the email you signed up with and we’ll send you a link to
        choose a new one.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="fp-email" className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            <Mail size={16} aria-hidden="true" className="text-primary" />
            Email
          </label>
          <input
            id="fp-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            autoComplete="email"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "fp-error" : undefined}
            className="h-12 w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-invalid=true:border-[#9B2C1F]"
          />
          {error && (
            <p id="fp-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9B2C1F]">
              <AlertCircle size={15} aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthShell>
  );
}