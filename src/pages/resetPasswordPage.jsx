import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "../components/auth/authShell";
import { apiRequest } from "../utils/api";

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

function getStrength(password) {
  if (password.length < 8) return 0;
  let strength = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

const inputClass =
  "h-12 w-full rounded-2xl border border-accent/70 bg-background px-4 pr-12 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";

function PasswordInput({ id, value, onChange, invalid, describedBy, autoFocus }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        autoFocus={autoFocus}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShow((previous) => !previous)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-secondary/60 transition hover:bg-accent/30 hover:text-secondary focus-visible:outline-2 focus-visible:outline-primary"
      >
        {show ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState(token ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;

    apiRequest(`/password/validate?token=${encodeURIComponent(token)}`)
      .then((data) => active && setState(data.valid ? "ready" : "invalid"))
      .catch(() => active && setState("invalid"));

    return () => {
      active = false;
    };
  }, [token]);

  const strength = getStrength(password);
  const errors = {};
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (confirm !== password) errors.confirm = "Passwords do not match.";
  const show = (key) => (attempted || (key === "confirm" && confirm)) && errors[key];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    setServerError("");
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      await apiRequest("/password/reset", { method: "POST", body: { token, password } });
      setState("done");
    } catch (failure) {
      if (failure.status === 400 && /invalid or has expired/i.test(failure.message)) {
        setState("invalid");
      } else {
        setServerError(failure.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (state === "checking") {
    return (
      <AuthShell>
        <div role="status" className="flex items-center gap-3 text-secondary/75">
          <LoaderCircle size={22} className="animate-spin text-primary" aria-hidden="true" />
          Checking your reset link...
        </div>
      </AuthShell>
    );
  }

  if (state === "invalid") {
    return (
      <AuthShell>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F8DCD7] text-[#8A1F14]">
          <AlertCircle size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-primary">
          This link has expired
        </h1>
        <p className="mt-3 text-base leading-7 text-secondary/75">
          Reset links work once and last 30 minutes. Request a new one and we’ll send it
          right away.
        </p>
        <Link
          to="/forgot-password"
          className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-primary px-8 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (state === "done") {
    return (
      <AuthShell>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#DDEBD8] text-[#2F5D3A]">
          <CheckCircle2 size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-primary">
          Password updated
        </h1>
        <p role="status" className="mt-3 text-base leading-7 text-secondary/75">
          You can now sign in with your new password.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-primary px-8 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <ShieldCheck size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight text-primary">
        Choose a new password
      </h1>
      <p className="mt-3 text-base leading-7 text-secondary/75">
        Pick something you haven’t used before. At least 8 characters.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="rp-password" className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            <Lock size={16} aria-hidden="true" className="text-primary" />
            New password
          </label>
          <PasswordInput
            id="rp-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            invalid={!!show("password")}
            describedBy={show("password") ? "rp-password-error" : undefined}
            autoFocus
          />
          {show("password") && (
            <p id="rp-password-error" className="mt-1.5 text-sm text-[#9B2C1F]">
              {errors.password}
            </p>
          )}

          {password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((item) => (
                  <span
                    key={item}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      strength >= item ? "bg-primary" : "bg-accent/50"
                    }`}
                  />
                ))}
              </div>
              <span aria-live="polite" className="w-16 text-right text-xs text-secondary/60">
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="rp-confirm" className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={16} aria-hidden="true" className="text-primary" />
            Confirm password
          </label>
          <PasswordInput
            id="rp-confirm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            invalid={!!show("confirm")}
            describedBy={show("confirm") ? "rp-confirm-error" : undefined}
          />
          {show("confirm") && (
            <p id="rp-confirm-error" className="mt-1.5 text-sm text-[#9B2C1F]">
              {errors.confirm}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}