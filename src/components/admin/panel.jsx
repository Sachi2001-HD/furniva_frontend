export default function Panel({ title, action, className = "", children }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-accent/40 bg-accent/25 px-6 py-5">
        <h2 className="font-display text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}