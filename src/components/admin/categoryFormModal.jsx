import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { uploadImages } from "../../utils/uploadImages";

const base =
  "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";

export default function CategoryFormModal({
  category,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const { token } = useAuth();
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const nameRef = useRef(null);
  const fileRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const nameError = attempted && !name.trim() ? "Enter a category name." : "";

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; 
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const [url] = await uploadImages([file], token);
      if (url) setImage(url);
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);

    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      image,
    });
  };

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-accent/50 px-6 py-5">
          <h2 id="category-form-title" className="font-display text-2xl">
            {isEdit ? "Edit category" : "New category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full text-secondary/70 transition hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="cf-name"
              ref={nameRef}
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Dining Tables"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "cf-name-error" : undefined}
              className={`${base} h-11`}
            />
            {nameError && (
              <p id="cf-name-error" className="mt-1.5 text-sm text-[#9B2C1F]">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="cf-description"
              className="mb-1.5 block text-sm font-medium"
            >
              Description
              <span className="ml-1.5 font-normal text-secondary/60">(optional)</span>
            </label>
            <textarea
              id="cf-description"
              value={description}
              maxLength={300}
              onChange={(event) => setDescription(event.target.value)}
              className={`${base} min-h-24 resize-y py-3 leading-6`}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium">
              Image
              <span className="ml-1.5 font-normal text-secondary/60">(optional)</span>
            </span>

            {image && (
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={image}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="text-sm font-medium text-[#9B2C1F] hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handleFile}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/60 bg-background px-4 py-5 text-[15px] font-medium text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} aria-hidden="true" />
              {uploading ? "Uploading..." : image ? "Replace image" : "Upload image"}
            </button>
            <p className="mt-1.5 text-sm text-secondary/60">
              JPG, PNG or WebP, up to 5 MB.
            </p>

            {uploadError && (
              <p role="alert" className="mt-1.5 text-sm text-[#9B2C1F]">
                {uploadError}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-[#9B2C1F]/10 px-4 py-2.5 text-sm text-[#9B2C1F]"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex h-12 flex-2 items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}