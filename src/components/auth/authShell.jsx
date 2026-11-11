import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authImage from "../../assets/images/signup_img.jpg";

export default function AuthShell({
  children,
  headline = "Timeless wood, crafted for the way you live.",
  sub = "Your Furniva account keeps your orders, addresses and saved pieces in one place.",
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)] px-4 py-6 sm:px-8">
      <div
        style={{ borderRadius: "32px", boxShadow: "0 30px 80px rgba(113, 62, 38, 0.28)" }}
        className={`w-full max-w-5xl overflow-hidden border border-accent/50 bg-[#FDF8F1] transition duration-700 ease-out motion-reduce:transition-none ${
          ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="grid items-stretch lg:grid-cols-2">
          <section className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-12 xl:px-14">
            <Link to="/" className="mb-10 inline-flex w-fit items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-background">
                F
              </span>
              <span className="font-display text-[22px] font-semibold text-primary">
                Furniva
              </span>
            </Link>

            {children}
          </section>

          <aside className="relative hidden min-h-140 overflow-hidden bg-[#E8D9C5] lg:block">
            <img src={authImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,21,14,0.88),rgba(40,21,14,0.15)_60%,transparent)]" />
            <div className="absolute inset-x-0 bottom-0 p-10">
              <p className="font-display text-3xl leading-tight text-background xl:text-4xl">
                {headline}
              </p>
              <p className="mt-3 max-w-sm text-base leading-7 text-background/80">{sub}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}