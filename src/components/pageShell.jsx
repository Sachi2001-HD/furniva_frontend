import Navbar from "./navbar";
import Footer from "./footer";

export default function PageShell({ children, width = "max-w-[1680px]" }) {
  return (
    <div className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <main className="px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className={`mx-auto ${width}`}>{children}</div>
      </main>

      <Footer />
    </div>
  );
}