const compact = (n) =>
  n >= 1000000
    ? `${(n / 1000000).toFixed(1).replace(".0", "")}M`
    : n >= 1000
    ? `${Math.round(n / 1000)}k`
    : String(n);

const money = (n) => `Rs. ${Number(n).toLocaleString("en-US")}`;

export default function RevenueChart({ points, caption, ready, height = "h-64" }) {
  const max = Math.max(0, ...points.map((p) => p.value));
  const niceMax = Math.max(Math.ceil(max / 100000) * 100000, 100000);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((t) => Math.round(niceMax * t));

  return (
    <div className="px-6 py-6">
      {/* Visual chart */}
      <div className="flex gap-3" aria-hidden="true">
        <div
          className={`flex ${height} shrink-0 flex-col justify-between text-right text-xs leading-none text-secondary/60`}
        >
          {ticks.map((t) => (
            <span key={t}>{compact(t)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className={`absolute inset-x-0 top-0 flex ${height} flex-col justify-between`}>
            {ticks.map((t) => (
              <span key={t} className="border-t border-accent/50" />
            ))}
          </div>

          <div className="relative flex gap-1.5 sm:gap-3">
            {points.map((p) => {
              const percent = (p.value / niceMax) * 100;

              return (
                <div key={p.label} className="group flex min-w-0 flex-1 flex-col">
                  <div className={`relative flex ${height} items-end`}>
                    <div
                      style={{ height: ready ? `${percent}%` : "0%" }}
                      className="w-full rounded-t-lg bg-highlight transition-[height,background-color] duration-700 ease-out group-hover:bg-primary motion-reduce:transition-none"
                    />
                    <span
                      style={{ bottom: `calc(${percent}% + 8px)` }}
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-2.5 py-1 text-xs text-background opacity-0 transition group-hover:opacity-100"
                    >
                      {money(p.value)}
                    </span>
                  </div>
                  <span className="mt-2 truncate text-center text-xs text-secondary/70">
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>{money(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}