import { Check, X } from "lucide-react";

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`fixed left-1/2 top-6 z-90 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] ${
        toast.type === "error" ? "bg-[#9B2C1F]" : "bg-[#1F5C36]"
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
        {toast.type === "error" ? (
          <X size={16} aria-hidden="true" />
        ) : (
          <Check size={16} aria-hidden="true" />
        )}
      </span>
      {toast.text}
    </div>
  );
}