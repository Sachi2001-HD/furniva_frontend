export default function AnnouncementBar() {
  return (
    <div className="pointer-events-auto bg-secondary text-[13px] text-background/90">
      <p className="mx-auto flex h-10 max-w-[1680px] items-center justify-center gap-3 px-4 text-center">
        <span>Natural materials. Thoughtful living.</span>
        <span aria-hidden="true" className="hidden text-highlight sm:inline">
          /
        </span>
        <span className="hidden text-accent sm:inline">The Furniva collection</span>
      </p>
    </div>
  );
}