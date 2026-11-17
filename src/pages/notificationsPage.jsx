import Navbar from "../components/navbar";
import Footer from "../components/footer";
import NotificationList from "../components/notificationList";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <section className="px-4 pb-24 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Your account
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Notifications
          </h1>
          <p className="mt-3 text-lg text-secondary/70">
            Updates about your orders, payments and requests.
          </p>

          <div className="mt-10">
            <NotificationList />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}