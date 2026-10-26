import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck } from "lucide-react";
import signupImg from "../assets/images/signup_img.jpg";
import { useAuth } from "../context/authContext";
import "../app.css";

const API_URL = import.meta.env.VITE_API_URL;

const inputClass =
  "h-11 w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

function getStrength(password) {
  if (password.length < 8) return 0;

  let strength = 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return strength;
}

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

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} pr-12`}
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

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from || "/";

  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));

    return () => cancelAnimationFrame(id);
  }, []);

  const set = (key) => (event) => {
    setValues((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Enter your first name.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Enter your last name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (values.confirm !== values.password) {
    errors.confirm = "Passwords do not match.";
  }

  if (!agreed) {
    errors.agree = "Please agree to the Terms and Privacy Policy to continue.";
  }

  const showError = (key) =>
    (submitted || (key === "confirm" && values.confirm)) && errors[key];

  const strength = getStrength(values.password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Signup failed. Please try again.");
        return;
      }

      login(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch {
      setServerError("Cannot reach the server. Please try again.");
    } finally {
      setLoading(false);
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
          <section className="min-w-0 px-3 py-4 sm:px-10 sm:py-8 lg:px-10 xl:px-12">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
                F
              </span>

              <span className="font-display text-[22px] font-semibold text-primary">
                Furniva
              </span>
            </Link>

            <h1 className="font-display text-center text-primary text-4xl leading-tight tracking-tight">
              Sign up
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-secondary/70">
              Save favourites, track orders & get early access to new
              collections.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="First name"
                  icon={User}
                  error={showError("firstName")}
                >
                  <input
                    id="firstName"
                    value={values.firstName}
                    onChange={set("firstName")}
                    autoComplete="given-name"
                    aria-invalid={!!showError("firstName")}
                    aria-describedby={
                      showError("firstName") ? "firstName-error" : undefined
                    }
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="lastName"
                  label="Last name"
                  icon={User}
                  error={showError("lastName")}
                >
                  <input
                    id="lastName"
                    value={values.lastName}
                    onChange={set("lastName")}
                    autoComplete="family-name"
                    aria-invalid={!!showError("lastName")}
                    aria-describedby={
                      showError("lastName") ? "lastName-error" : undefined
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

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
                  autoComplete="email"
                  aria-invalid={!!showError("email")}
                  aria-describedby={
                    showError("email") ? "email-error" : undefined
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                id="password"
                label="Password"
                icon={Lock}
                error={showError("password")}
              >
                <PasswordInput
                  id="password"
                  value={values.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  invalid={!!showError("password")}
                  describedBy={
                    showError("password") ? "password-error" : undefined
                  }
                />

                {values.password && (
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

                    <span
                      aria-live="polite"
                      className="w-16 text-right text-xs text-secondary/60"
                    >
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </Field>

              <Field
                id="confirm"
                label="Confirm password"
                icon={ShieldCheck}
                error={showError("confirm")}
              >
                <PasswordInput
                  id="confirm"
                  value={values.confirm}
                  onChange={set("confirm")}
                  autoComplete="new-password"
                  invalid={!!showError("confirm")}
                  describedBy={
                    showError("confirm") ? "confirm-error" : undefined
                  }
                />
              </Field>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    aria-invalid={!!showError("agree")}
                    aria-describedby={
                      showError("agree") ? "agree-error" : undefined
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />

                  <label
                    htmlFor="agree"
                    className="text-sm leading-5 text-secondary/70"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {showError("agree") && (
                  <p id="agree-error" className="mt-1.5 text-sm text-[#9B2C1F]">
                    {errors.agree}
                  </p>
                )}
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-full bg-primary text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-3 text-center text-sm text-secondary/70">
              Already have an account?{" "}
              <Link
                to="/login"
                state={location.state}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </section>

          {/* Image section */}
          <aside className="hidden p-2 lg:block">
            <div className="relative h-full min-h-600px overflow-hidden rounded-3xl bg-[#E8D9C5]">
              <img
                src={signupImg}
                alt="Warm, natural wood furniture in an elegant living room"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1600ms ease-out motion-reduce:transition-none ${
                  ready ? "scale-100" : "scale-110"
                }`}
              />

              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,21,14,0.88),rgba(40,21,14,0.15)_60%,transparent)]" />

              <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10">
                <p className="font-display text-3xl leading-tight text-background xl:text-4xl">
                  Timeless wood, crafted for the way you live.
                </p>

                <p className="mt-3 max-w-sm text-base leading-7 text-background/80">
                  Members get 10% off their first order & free design
                  consultations.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
