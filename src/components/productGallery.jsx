import { useEffect, useRef, useState } from "react";
import { Armchair, Box, ChevronLeft, ChevronRight } from "lucide-react";

const optimize = (url, width) =>
  url && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`)
    : url;

function Photo({ src, alt = "", width, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid place-items-center bg-accent/40 text-primary/60 ${className}`}
      >
        <Armchair size={28} />
      </span>
    );
  }

  return (
    <img
      src={optimize(src, width)}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

function ModelStage({ src, poster, name }) {
  const viewerRef = useRef(null);
  const [libReady, setLibReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    import("@google/model-viewer")
      .then(() => active && setLibReady(true))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = viewerRef.current;
    if (!libReady || !element) return;

    const onError = () => setFailed(true);
    element.addEventListener("error", onError);
    return () => element.removeEventListener("error", onError);
  }, [libReady]);

  if (failed) {
    return (
      <div role="alert" className="grid h-full place-items-center px-6 text-center text-secondary/70">
        The 3D view couldn’t be loaded. Please check the photos instead.
      </div>
    );
  }

  if (!libReady) {
    return (
      <div role="status" className="grid h-full place-items-center text-secondary/70">
        Loading 3D view...
      </div>
    );
  }

  return (
    <>
      <model-viewer
        ref={viewerRef}
        src={src}
        poster={poster ? optimize(poster, 1000) : undefined}
        alt={`3D model of ${name}`}
        camera-controls
        auto-rotate
        touch-action="pan-y"
        shadow-intensity="1"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{ width: "100%", height: "100%" }}
      >
  
        <button
          slot="ar-button"
          type="button"
          className="absolute bottom-4 right-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background shadow-lg"
        >
          View in your room
        </button>
      </model-viewer>

      <p className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-secondary/70 px-3 py-1.5 text-xs text-background">
        Drag to rotate · Pinch or scroll to zoom
      </p>
    </>
  );
}

export default function ProductGallery({ images = [], model, name }) {
  const items = [
    ...images.map((src) => ({ type: "image", src })),
    ...(model ? [{ type: "model", src: model }] : []),
  ];

  const [index, setIndex] = useState(0);
  const active = items[Math.min(index, Math.max(items.length - 1, 0))];

  if (items.length === 0) {
    return (
      <div className="grid aspect-4/3 place-items-center rounded-3xl bg-accent/30 text-primary/60">
        <Armchair size={48} aria-hidden="true" />
      </div>
    );
  }

  const go = (delta) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-accent/50 bg-[#F3E9DB]">
        {active.type === "model" ? (
          <ModelStage key={active.src} src={active.src} poster={images[0]} name={name} />
        ) : (
          <Photo
            key={active.src}
            src={active.src}
            alt={`${name} photo ${index + 1}`}
            width={1000}
            className="h-full w-full"
          />
        )}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[#FDF8F1]/90 text-primary shadow transition hover:bg-[#FDF8F1] focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[#FDF8F1]/90 text-primary shadow transition hover:bg-[#FDF8F1] focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {items.map((item, i) => {
            const selected = items.indexOf(active) === i;

            return (
              <li key={`${item.type}-${item.src}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={selected}
                  aria-label={
                    item.type === "model" ? "View in 3D" : `Show photo ${i + 1}`
                  }
                  className={`relative block h-20 w-20 overflow-hidden rounded-2xl border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selected ? "border-primary" : "border-transparent hover:border-primary/40"
                  }`}
                >
                  {item.type === "model" ? (
                    <span className="grid h-full w-full place-items-center bg-accent/40 text-primary">
                      <span className="flex flex-col items-center gap-1 text-xs font-medium">
                        <Box size={22} aria-hidden="true" />
                        3D view
                      </span>
                    </span>
                  ) : (
                    <Photo src={item.src} width={200} className="h-full w-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}