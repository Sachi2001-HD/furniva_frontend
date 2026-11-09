import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
  AlertCircle,
  CalendarDays,
  LockKeyhole,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROFILE_ENDPOINT = `${API_BASE_URL}/users/me`;
const PROFILE_IMAGE_ENDPOINT = `${API_BASE_URL}/upload/profile-image`;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  contactNumber: "",
  image: "",
};

function ProfileAvatar({ image, name, size = "large" }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const sizes = {
    large: "h-28 w-28 text-4xl",
    medium: "h-20 w-20 text-3xl",
    small: "h-12 w-12 text-xl",
  };

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white/20 bg-[#8a5033] font-display text-[#fff4e7] shadow-lg ${sizes[size]}`}
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={`${name || "User"} profile`}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#966b50]">
            {eyebrow}
          </p>
        )}

        <h2 className="font-display text-2xl font-semibold text-secondary sm:text-[28px]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-[#806c5e]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  readOnly = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[13px] font-semibold text-[#493226]"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a58b78]"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full rounded-xl border border-[#e6d6c6] py-3.5 text-sm text-[#39251a] outline-none transition placeholder:text-[#b5a394] focus:border-[#8b5435] focus:ring-4 focus:ring-[#8b5435]/10 ${
            Icon ? "pl-11" : "px-4"
          } ${
            readOnly
              ? "cursor-not-allowed bg-[#f4eee7] text-[#8b796b]"
              : "bg-[#fffdfa]"
          }`}
        />
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-[#eadbcd] bg-white/60 p-4 transition hover:border-[#b88a68] hover:bg-white"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f2e5d7] text-[#79472d] transition group-hover:bg-primary group-hover:text-white">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#38251a]">
          {title}
        </p>
        <p className="mt-1 text-xs text-[#927d6c]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-[#a88b76] transition group-hover:translate-x-1 group-hover:text-primary"
      />
    </Link>
  );
}

function Notice({ type = "success", children, onClose }) {
  const success = type === "success";

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        success
          ? "border-[#c8dfcd] bg-[#f0f8f1] text-[#356344]"
          : "border-[#efceca] bg-[#fff3f1] text-[#a44339]"
      }`}
    >
      {success ? (
        <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={19} className="mt-0.5 shrink-0" />
      )}

      <p className="flex-1 leading-6">{children}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="opacity-60 transition hover:opacity-100"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}

export default function MyProfilePage() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [showImageMenu, setShowImageMenu] = useState(false);

  const fullName =
    `${form.firstName} ${form.lastName}`.trim() ||
    "Furniva Member";

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(PROFILE_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your profile."
          );
        }

        const profile = data.user || data;

        if (!active) return;

        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          contactNumber: profile.contactNumber || "",
          image: profile.image || "",
        });

        if (profile.createdAt) {
          setMemberSince(
            new Date(profile.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [token]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  const updateProfile = async (updatedFields, successMessage) => {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update your profile."
      );
    }

    const updatedUser = data.user || data;

    login(token, updatedUser);

    setForm((previous) => ({
      ...previous,
      firstName:
        updatedUser.firstName ?? previous.firstName,
      lastName:
        updatedUser.lastName ?? previous.lastName,
      contactNumber:
        updatedUser.contactNumber ?? previous.contactNumber,
      image: updatedUser.image ?? "",
    }));

    setSuccess(successMessage);

    return updatedUser;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    clearMessages();

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please select an image smaller than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload image to the backend.
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await fetch(
        PROFILE_IMAGE_ENDPOINT,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.message || "Profile image upload failed."
        );
      }

      if (!uploadData.url) {
        throw new Error(
          "The server did not return an image URL."
        );
      }

      await updateProfile(
        { image: uploadData.url },
        "Your profile picture has been updated successfully."
      );

      setShowImageMenu(false);
    } catch (err) {
      setError(
        err.message || "Unable to upload your profile picture."
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove the existing profile image.
  const handleRemoveImage = async () => {
    if (!form.image) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) return;

    setRemovingImage(true);
    clearMessages();

    try {
      await updateProfile(
        { image: "" },
        "Your profile picture has been removed."
      );

      setShowImageMenu(false);
    } catch (err) {
      setError(
        err.message || "Unable to remove your profile picture."
      );
    } finally {
      setRemovingImage(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(
        "Please enter your first name and last name."
      );
      return;
    }

    if (
      form.contactNumber.trim() &&
      !/^[0-9+\-\s()]{7,20}$/.test(
        form.contactNumber.trim()
      )
    ) {
      setError("Please enter a valid contact number.");
      return;
    }

    setSaving(true);

    try {
      await updateProfile(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          contactNumber: form.contactNumber.trim(),
        },
        "Your personal information has been saved successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to save your changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      contactNumber: user?.contactNumber || "",
      image: user?.image || "",
    });

    clearMessages();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#faf7f2]">
        <div className="flex flex-col items-center gap-4 text-primary">
          <LoaderCircle size={34} className="animate-spin" />
          <p className="text-sm font-medium">
            Preparing your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 pb-16 pt-5 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-360">

        {/* Top navigation */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary font-display text-2xl text-white">
              F
            </span>

            <span className="font-display text-2xl font-semibold tracking-tight text-primary">
              Furniva
            </span>
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[#493226] transition hover:bg-[#efe4d8]"
          >
            <ArrowLeft size={17} />
            Back to shop
          </Link>
        </header>

        {error && (
          <Notice
            type="error"
            onClose={() => setError("")}
          >
            {error}
          </Notice>
        )}

        {success && (
          <Notice onClose={() => setSuccess("")}>
            {success}
          </Notice>
        )}

        {/* Profile hero */}
        <section className="relative isolate overflow-hidden rounded-[30px] bg-secondary px-6 py-8 text-[#f8eee3] shadow-[0_20px_55px_rgba(40,21,14,0.12)] sm:px-10 sm:py-11 lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.13]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(102deg, transparent 0px, transparent 18px, #a77a58 19px, transparent 21px)",
              }}
            />
          </div>

          <div className="pointer-events-none absolute -right-24 -top-40 -z-10 h-96 w-96 rounded-full border-45 border-white/[0.035]" />

          <div className="pointer-events-none absolute -bottom-56 left-1/3 -z-10 h-96 w-96 rounded-full border-45 border-white/[0.035]" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">

                {/* Profile picture */}
                <div className="relative">
                  <ProfileAvatar
                    image={form.image}
                    name={fullName}
                    size="large"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowImageMenu((value) => !value)
                    }
                    disabled={uploading || removingImage}
                    aria-label="Change profile picture"
                    className="absolute bottom-0 right-0 grid h-10 w-10 place-items-center rounded-full border-4 border-secondary bg-[#ead3b9] text-[#492a1a] transition hover:bg-white disabled:opacity-60"
                  >
                    {uploading || removingImage ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera size={18} />
                    )}
                  </button>

                  {showImageMenu && (
                    <div className="absolute left-1/2 top-full z-30 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-[#e6d6c6] bg-white p-2 text-left shadow-xl sm:left-0 sm:translate-x-0">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#493226] transition hover:bg-[#f6eee5]"
                      >
                        <ImagePlus size={18} />
                        Upload new picture
                      </button>

                      {form.image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                          Remove picture
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#c6a991]">
                    Your Furniva Account
                  </p>

                  <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[58px]">
                    Hello, {form.firstName || "there"}.
                  </h1>

                  <p className="mt-3 flex items-center justify-center gap-2 text-sm text-[#d3c2b3] sm:justify-start">
                    <Mail size={16} />
                    <span className="break-all">
                      {user?.email}
                    </span>
                  </p>

                  <p className="mt-3 text-xs text-[#b99d86]">
                    Click the camera icon to update your profile picture.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#ead3b9] px-5 py-3 text-sm font-semibold text-[#39251a] transition hover:bg-white lg:self-start"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>

            {/* Account overview */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/6 bg-white/9 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ead3b9]/10 text-[#d9c1a9]">
                  <ShoppingBag size={21} />
                </div>

                <p className="font-display text-3xl font-semibold">
                  {isAdmin ? "Admin" : "Customer"}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#c5b1a0]">
                  Account type
                </p>
              </div>

              <div className="rounded-[22px] border border-white/6 bg-white/9 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ead3b9]/10 text-[#d9c1a9]">
                  <ShieldCheck size={21} />
                </div>

                <p className="font-display text-3xl font-semibold">
                  {user?.isEmailVerified ? "Verified" : "Active"}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#c5b1a0]">
                  Account status
                </p>
              </div>

              <div className="rounded-[22px] border border-white/6 bg-white/9 p-5 backdrop-blur-sm">
                <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ead3b9]/10 text-[#d9c1a9]">
                  <CalendarDays size={21} />
                </div>

                <p className="font-display text-2xl font-semibold">
                  {memberSince || "Furniva"}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#c5b1a0]">
                  Member since
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">

          {/* Personal information */}
          <section className="rounded-[26px] border border-[#e9d9c9] bg-[#fffdfa] p-6 shadow-[0_8px_30px_rgba(74,47,29,0.035)] sm:p-8">
            <SectionHeading
              eyebrow="Your information"
              title="Personal details"
              description="Manage the information connected to your Furniva account."
            />

            <form onSubmit={handleSave} className="space-y-6">

              <div className="flex flex-col gap-4 rounded-2xl bg-[#f8f1e9] p-4 sm:flex-row sm:items-center">
                <ProfileAvatar
                  image={form.image}
                  name={fullName}
                  size="medium"
                />

                <div className="flex-1">
                  <p className="font-semibold text-[#39251a]">
                    {fullName}
                  </p>

                  <p className="mt-1 text-xs text-[#927d6c]">
                    JPG, PNG or WebP · Maximum 5 MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8c3b0] bg-white px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-[#f5e9dc] disabled:opacity-50"
                >
                  <Pencil size={14} />
                  Change photo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="First name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />

                <FormField
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>

              <FormField
                label="Email address"
                name="email"
                value={user?.email}
                icon={Mail}
                readOnly
              />

              <FormField
                label="Contact number"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                icon={Phone}
                type="tel"
              />

              <div className="flex flex-col-reverse gap-3 border-t border-[#eee3d8] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-[#806c5e] transition hover:bg-[#f5eee7]"
                >
                  Reset changes
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/15 transition hover:bg-[#512b1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Right column */}
          <div className="space-y-7">

            {/* Saved pieces */}
            <section className="rounded-[26px] border border-[#e9d9c9] bg-[#f4e8d9] p-6 shadow-[0_8px_30px_rgba(74,47,29,0.035)] sm:p-8">
              <SectionHeading
                eyebrow="Your collection"
                title="Saved pieces"
                description="Keep the furniture you love close at hand."
                action={
                  <Link
                    to="/wishlist"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
                  >
                    Browse
                    <ArrowRight size={15} />
                  </Link>
                }
              />

              <div className="flex items-center gap-4 rounded-2xl border border-[#e4d2bf] bg-white/50 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#ead8c5] text-[#79472d]">
                  <Heart size={23} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#39251a]">
                    Your wishlist awaits
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#927d6c]">
                    Tap the heart on any furniture piece to save it here.
                  </p>
                </div>
              </div>
            </section>

            {/* Orders */}
            <section className="rounded-[26px] border border-[#e9d9c9] bg-[#fffdfa] p-6 shadow-[0_8px_30px_rgba(74,47,29,0.035)] sm:p-8">
              <SectionHeading
                eyebrow="Your purchases"
                title="Your orders"
                description="Follow your furniture journey from order to delivery."
                action={
                  <Link
                    to="/orders"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
                  >
                    View all
                    <ArrowRight size={15} />
                  </Link>
                }
              />

              <QuickLink
                to="/orders"
                icon={Package}
                title="Order history"
                description="View your orders and their delivery status."
              />
            </section>

            {/* Account shortcuts */}
            <section className="rounded-[26px] border border-[#e9d9c9] bg-[#fffdfa] p-6 shadow-[0_8px_30px_rgba(74,47,29,0.035)] sm:p-8">
              <SectionHeading
                eyebrow="Account shortcuts"
                title="Manage your account"
                description="Everything you need, in one place."
              />

              <div className="space-y-3">
                <QuickLink
                  to="/account/addresses"
                  icon={MapPin}
                  title="My addresses"
                  description="Manage your delivery addresses."
                />

                {!isAdmin && (
                  <>
                    <QuickLink
                      to="/my-consultations"
                      icon={CalendarDays}
                      title="My consultations"
                      description="View your consultation bookings."
                    />

                    <QuickLink
                      to="/my-custom-requests"
                      icon={Pencil}
                      title="Custom furniture requests"
                      description="Track your furniture design requests."
                    />
                  </>
                )}
              </div>
            </section>

            {/* Security card */}
            <section className="relative overflow-hidden rounded-[26px] bg-secondary p-7 text-white">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-20 border-white/4" />

              <div className="relative">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#e8cdb2]">
                  <LockKeyhole size={22} />
                </div>

                <h3 className="font-display text-2xl font-semibold">
                  Your account, your space.
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#d0bca9]">
                  Your Furniva account keeps your personal details,
                  saved furniture and purchases together, making
                  every visit easier.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ead3b9] px-5 py-3 text-sm font-semibold text-[#39251a] transition hover:bg-white"
                >
                  <LogOut size={16} />
                  Sign out of your account
                </button>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#e9d9c9] py-6 text-xs text-[#9b8878] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Furniva. Furniture for Every Space.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            Discover your next favourite piece
            <ArrowRight size={14} />
          </Link>
        </footer>
      </div>
    </main>
  );
}