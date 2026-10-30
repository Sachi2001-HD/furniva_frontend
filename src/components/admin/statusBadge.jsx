const amber = "border-[#E9C98F] bg-[#F7E3C3] text-[#7A4A12]";
const blue = "border-[#B9D2E3] bg-[#DCE9F2] text-[#1F4E6B]";
const green = "border-[#BBD6B2] bg-[#DDEBD8] text-[#2F5D3A]";
const red = "border-[#EBB8B0] bg-[#F8DCD7] text-[#8A1F14]";

const styles = {
  Pending: amber,
  Processing: amber,
  Shipped: blue,
  "In Progress": blue,
  Delivered: green,
  Completed: green,
  Canceled: red,
  Cancelled: red,
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${
        styles[status] ?? "border-accent bg-accent/30 text-secondary"
      }`}
    >
      {status}
    </span>
  );
}