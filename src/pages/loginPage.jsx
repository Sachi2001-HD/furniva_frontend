import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import loginImg from "../assets/images/login.jpg";

const inputClass =
  "h-11 w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";

function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-2 text-sm font-medium"
      >
        {Icon && <Icon size={16} className="text-primary" aria-hidden="true" />}
        {label}
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function LoginPage({ onSubmit, onGoogleClick, error }) {
  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [values, setValues] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));

    return () => cancelAnimationFrame(id);
  }, []);

  const set = (key) => (event) => {
    setValues((previous) => ({
      ...previous,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  };

  const errors = {};

  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  const showError = (key) => submitted && errors[key];

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length === 0) {
      onSubmit?.(values);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)] px-4 py-6 sm:px-8">
      <div
        className={`w-full max-w-6xl overflow-hidden rounded-4xl shadow-accent border border-accent/50 bg-[#FDF8F1] shadow-[0_30px_80px_rgba(113,62,38,0.20)] transition duration-700 ease-out motion-reduce:transition-none ${
          ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="grid items-stretch lg:grid-cols-2">
          {/* Form section */}
          <section className="flex min-w-0 flex-col px-5 py-6 sm:px-10 sm:py-8 xl:px-12">
            {/* Top row: logo and back to shop */}
            <div className="flex items-center justify-between gap-3">
              <a href="/" className="inline-flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
                  F
                </span>

                <span className="font-display text-[22px] font-semibold text-primary">
                  Furniva
                </span>
              </a>

              <a
                href="/shop"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                  className="transition motion-safe:group-hover:-translate-x-1"
                />
                Back to shop
              </a>
            </div>

            <h1 className="mt-4 text-center font-display text-4xl leading-tight tracking-tight text-primary">
              Welcome back
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-secondary/70">
              Sign in and make yourself at home.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-[#9B2C1F]/30 bg-[#9B2C1F]/5 px-4 py-3 text-sm text-[#9B2C1F]"
                >
                  {error}
                </p>
              )}

              <Field
                id="email"
                label="Email"
                icon={Mail}
                error={showError("email")}
              >
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!showError("email")}
                  aria-describedby={showError("email") ? "email-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <Field
                id="password"
                label="Password"
                icon={Lock}
                error={showError("password")}
              >
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={set("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={!!showError("password")}
                    aria-describedby={
                      showError("password") ? "password-error" : undefined
                    }
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-secondary/60 transition hover:bg-accent/30 hover:text-secondary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-secondary/80">
                  <input
                    type="checkbox"
                    checked={values.remember}
                    onChange={set("remember")}
                    className="h-4 w-4 cursor-pointer rounded accent-primary"
                  />
                  Remember me
                </label>

                <a
                  href="/forgot-password"
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
              >
                Sign in
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition motion-safe:group-hover:translate-x-1"
                />
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4 text-sm text-secondary/60">
              <span className="h-px flex-1 bg-accent/70" />
              or continue with
              <span className="h-px flex-1 bg-accent/70" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={onGoogleClick}
              className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-full border border-accent bg-white/70 text-base font-medium transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="mt-5 text-center text-sm text-secondary/70">
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </a>
            </p>

            <p className="mt-6 text-center text-xs text-secondary/50 lg:mt-auto lg:pt-6">
              © {new Date().getFullYear()} Furniva. Crafted in wood.
            </p>
          </section>

          {/* Image section */}
          <aside className="relative hidden min-h-600px overflow-hidden bg-[#E8D9C5] lg:block">
            <img
              src={loginImg}
              alt="Warm, natural wood furniture in an elegant living room"
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1600ms ease-out motion-reduce:transition-none ${
                ready ? "scale-100" : "scale-110"
              }`}
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,21,14,0.88),rgba(40,21,14,0.15)_60%,transparent)]" />

            <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-highlight">
                A place to feel at home
              </p>

              <p className="mt-3 font-display text-3xl leading-tight text-background xl:text-4xl">
                Good to have you home.
              </p>

              <p className="mt-3 max-w-sm text-base leading-7 text-background/80">
                Timeless wood. Thoughtful details. Furniva.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}