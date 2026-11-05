import { statusInfo } from "../../utils/orderApi";

const TONES = {
  good: "border-[#BBD6B2] bg-[#DDEBD8] text-[#2F5D3A]",
  info: "border-accent/70 bg-accent/40 text-primary",
  warn: "border-[#E9C98F] bg-[#F7E3C3] text-[#7A4A12]",
  bad: "border-[#EBB8B0] bg-[#F8DCD7] text-[#8A1F14]",
};

export default function StatusPill({ status }) {
  const { label, tone } = statusInfo(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}