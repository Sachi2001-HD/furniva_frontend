import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";

const inputClass =
  "h-11 w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F] read-only:cursor-not-allowed read-only:bg-accent/20 read-only:text-secondary/70 read-only:focus:ring-0";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

function getStrength(password) {
  if (password.length < 8) return 0;

  let strength = 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return strength;
}

function validateProfile(values) {
  const errors = {};

  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";

  if (
    values.contactNumber.trim() &&
    !/^[0-9+\s()-]{7,20}$/.test(values.contactNumber.trim())
  ) {
    errors.contactNumber = "Enter a valid phone number.";
  }

  if (values.image.trim() && !/^(https?:\/\/|\/)\S+$/i.test(values.image.trim())) {
    errors.image = "Use a full link (https://...) or a path starting with /.";
  }

  return errors;
}

function Avatar({ src, initial, className = "h-16 w-16 text-2xl" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-display font-semibold text-background ${className}`}
    >
      {initial}
    </span>
  );
}

function Card({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)]">
      <div className="border-b border-accent/40 bg-accent/25 px-6 py-5">
        <h2 className="font-display text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-secondary/70">{description}</p>
        )}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function Field({ id, label, icon: Icon, optional, hint, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-2 text-sm font-medium"
      >
        {Icon && <Icon size={16} className="text-primary" aria-hidden="true" />}
        {label}
        {optional && (
          <span className="font-normal text-secondary/60">(optional)</span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-secondary/65">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#9B2C1F]">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, value, onChange, autoComplete, invalid, describedBy }) {
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

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 px-3 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();

  const saved = useMemo(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      contactNumber: user?.contactNumber ?? "",
      image: user?.image ?? "",
    }),
    [user]
  );

  const [profile, setProfile] = useState(saved);
  const [profileAttempted, setProfileAttempted] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwAttempted, setPwAttempted] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [currentError, setCurrentError] = useState("");

  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const signOutAndRedirect = () => {
    logout();
    navigate("/login", { replace: true, state: { from: "/admin/settings" } });
  };

  /* Profile */

  const profileErrors = validateProfile(profile);
  const showProfileError = (key) => profileAttempted && profileErrors[key];

  const dirty = Object.keys(saved).some(
    (key) => profile[key].trim() !== String(saved[key]).trim()
  );

  const setProfileField = (key) => (event) =>
    setProfile((previous) => ({ ...previous, [key]: event.target.value }));

  const resetProfile = () => {
    setProfile(saved);
    setProfileAttempted(false);
    setProfileError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileAttempted(true);
    setProfileError("");

    if (Object.keys(profileErrors).length > 0) return;

    const values = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      contactNumber: profile.contactNumber.trim(),
      image: profile.image.trim(),
    };

    try {
      setProfileSaving(true);

      const data = await apiRequest("/users/me", {
        method: "PUT",
        token,
        body: { ...values, image: values.image || null },
      });

      login(token, data.user);
      setProfile(values);
      setProfileAttempted(false);
      setToast("Profile updated");
    } catch (error) {
      if (error.status === 401) {
        signOutAndRedirect();
        return;
      }
      setProfileError(error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  /* Password */

  const pwErrors = {};

  if (!pw.current) pwErrors.current = "Enter your current password.";

  if (pw.next.length < 8) {
    pwErrors.next = "Use at least 8 characters.";
  } else if (pw.next === pw.current) {
    pwErrors.next = "Choose a password different from your current one.";
  }

  if (pw.confirm !== pw.next) pwErrors.confirm = "Passwords do not match.";

  const showPwError = (key) => {
    if (key === "current" && currentError) return currentError;
    return (pwAttempted || (key === "confirm" && pw.confirm)) && pwErrors[key];
  };

  const strength = getStrength(pw.next);

  const setPwField = (key) => (event) => {
    if (key === "current") setCurrentError("");
    setPw((previous) => ({ ...previous, [key]: event.target.value }));
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPwAttempted(true);
    setPwError("");
    setCurrentError("");

    if (Object.keys(pwErrors).length > 0) return;

    try {
      setPwSaving(true);

      await apiRequest("/users/me/password", {
        method: "PUT",
        token,
        body: { currentPassword: pw.current, newPassword: pw.next },
      });

      setPw({ current: "", next: "", confirm: "" });
      setPwAttempted(false);
      setToast("Password updated");
    } catch (error) {
      if (error.status === 401 && /current password/i.test(error.message)) {
        setCurrentError(error.message);
      } else if (error.status === 401) {
        signOutAndRedirect();
        return;
      } else {
        setPwError(error.message);
      }
    } finally {
      setPwSaving(false);
    }
  };

  const initial = (user?.firstName?.[0] || "A").toUpperCase();
  const displayName =
    [user?.firstName, user?.lastName]
      .filter((part) => part && part !== "-")
      .join(" ") || "Admin";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage your account details and sign-in security."
    >
      {toast && (
        <div
          role="status"
          className="fixed left-1/2 top-6 z-70 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#1F5C36] px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
            <Check size={16} aria-hidden="true" />
          </span>
          {toast}
        </div>
      )}

      <div className="max-w-4xl space-y-8">
        {/* Account summary */}
        <section
          aria-label="Account summary"
          className="flex flex-wrap items-center gap-5 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)]"
        >
          <Avatar src={user?.image} initial={initial} className="h-20 w-20 text-3xl" />

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl">{displayName}</p>
            <p className="truncate text-secondary/70">{user?.email}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>
                <ShieldCheck size={13} aria-hidden="true" />
                {user?.role === "admin" ? "Administrator" : user?.role}
              </Badge>
              <Badge>
                Sign-in: {user?.googleId ? "Google" : "Email and password"}
              </Badge>
              {user?.isEmailVerified && (
                <Badge>
                  <Check size={13} aria-hidden="true" />
                  Email verified
                </Badge>
              )}
            </div>
          </div>

          {memberSince && (
            <dl className="text-sm">
              <dt className="text-secondary/65">Member since</dt>
              <dd className="mt-0.5 font-medium">{memberSince}</dd>
            </dl>
          )}
        </section>

        {/* Profile */}
        <Card title="Profile" description="Your name and contact details.">
          <form onSubmit={saveProfile} noValidate className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First name"
                icon={User}
                error={showProfileError("firstName")}
              >
                <input
                  id="firstName"
                  value={profile.firstName}
                  onChange={setProfileField("firstName")}
                  autoComplete="given-name"
                  aria-invalid={!!showProfileError("firstName")}
                  aria-describedby={
                    showProfileError("firstName") ? "firstName-error" : undefined
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                id="lastName"
                label="Last name"
                icon={User}
                error={showProfileError("lastName")}
              >
                <input
                  id="lastName"
                  value={profile.lastName}
                  onChange={setProfileField("lastName")}
                  autoComplete="family-name"
                  aria-invalid={!!showProfileError("lastName")}
                  aria-describedby={
                    showProfileError("lastName") ? "lastName-error" : undefined
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="email"
                label="Email"
                icon={Mail}
                hint="Your email is your sign-in name, so it can’t be changed here."
              >
                <input
                  id="email"
                  value={user?.email ?? ""}
                  readOnly
                  aria-describedby="email-hint"
                  className={inputClass}
                />
              </Field>

              <Field
                id="contactNumber"
                label="Phone number"
                icon={Phone}
                optional
                error={showProfileError("contactNumber")}
              >
                <input
                  id="contactNumber"
                  type="tel"
                  value={profile.contactNumber}
                  onChange={setProfileField("contactNumber")}
                  placeholder="077 123 4567"
                  autoComplete="tel"
                  aria-invalid={!!showProfileError("contactNumber")}
                  aria-describedby={
                    showProfileError("contactNumber")
                      ? "contactNumber-error"
                      : undefined
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex items-start gap-4">
              <Avatar
                src={profile.image.trim()}
                initial={(profile.firstName[0] || initial).toUpperCase()}
                className="mt-6 h-16 w-16 text-2xl"
              />
              <div className="min-w-0 flex-1">
                <Field
                  id="image"
                  label="Profile photo link"
                  icon={Camera}
                  optional
                  hint="Paste a link to an image. Leave empty to show your initial."
                  error={showProfileError("image")}
                >
                  <input
                    id="image"
                    value={profile.image}
                    onChange={setProfileField("image")}
                    placeholder="https://..."
                    aria-invalid={!!showProfileError("image")}
                    aria-describedby={
                      showProfileError("image") ? "image-error" : "image-hint"
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {profileError && (
              <p
                role="alert"
                className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-3 text-sm text-[#9B2C1F]"
              >
                {profileError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!dirty || profileSaving}
                className={`inline-flex h-11 items-center rounded-full bg-primary px-7 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${focusRing}`}
              >
                {profileSaving ? "Saving..." : "Save changes"}
              </button>

              {dirty && !profileSaving && (
                <button
                  type="button"
                  onClick={resetProfile}
                  className={`inline-flex h-11 items-center rounded-full px-5 text-base font-medium text-primary transition hover:bg-accent/30 ${focusRing}`}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Password */}
        <Card
          title="Password"
          description="Use a strong password that you don’t use anywhere else."
        >
          <form onSubmit={savePassword} noValidate className="max-w-xl space-y-5">
            <Field
              id="currentPassword"
              label="Current password"
              icon={Lock}
              error={showPwError("current")}
            >
              <PasswordField
                id="currentPassword"
                value={pw.current}
                onChange={setPwField("current")}
                autoComplete="current-password"
                invalid={!!showPwError("current")}
                describedBy={
                  showPwError("current") ? "currentPassword-error" : undefined
                }
              />
            </Field>

            <Field
              id="newPassword"
              label="New password"
              icon={Lock}
              error={showPwError("next")}
            >
              <PasswordField
                id="newPassword"
                value={pw.next}
                onChange={setPwField("next")}
                autoComplete="new-password"
                invalid={!!showPwError("next")}
                describedBy={showPwError("next") ? "newPassword-error" : undefined}
              />

              {pw.next && (
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
                    className="w-16 text-right text-xs text-secondary/65"
                  >
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </Field>

            <Field
              id="confirmPassword"
              label="Confirm new password"
              icon={ShieldCheck}
              error={showPwError("confirm")}
            >
              <PasswordField
                id="confirmPassword"
                value={pw.confirm}
                onChange={setPwField("confirm")}
                autoComplete="new-password"
                invalid={!!showPwError("confirm")}
                describedBy={
                  showPwError("confirm") ? "confirmPassword-error" : undefined
                }
              />
            </Field>

            {pwError && (
              <p
                role="alert"
                className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-3 text-sm text-[#9B2C1F]"
              >
                {pwError}
              </p>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className={`inline-flex h-11 items-center rounded-full bg-primary px-7 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              {pwSaving ? "Updating..." : "Update password"}
            </button>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}