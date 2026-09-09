import { useEffect, useRef, useState } from 'react';
import { noSaveImageProps } from '../../utils/imageProtection';

const AUTO_SLIDE_MS = 3000;

export default function ProductGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = images?.length || 0;

  function goPrev() {
    setActiveIndex((i) => (i - 1 + count) % count);
  }
  function goNext() {
    setActiveIndex((i) => (i + 1) % count);
  }

  // Auto-advance every 3s — pauses on hover, while the fullscreen viewer
  // is open, and entirely for anyone with prefers-reduced-motion set
  // (matches the reduced-motion handling already used site-wide).
  useEffect(() => {
    if (count <= 1 || paused || fullscreen) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [count, paused, fullscreen]);

  if (!images || count === 0) {
    return (
      <div className="aspect-[4/5] bg-charcoal flex items-center justify-center text-ivory/30 font-serif">
        No preview available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div
        className="relative w-full aspect-[4/5] bg-charcoal overflow-hidden group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          onClick={() => setFullscreen(true)}
          className="block w-full h-full cursor-zoom-in"
          aria-label="Open fullscreen preview"
        >
          <img
            src={active.url}
            alt={active.alt || title}
            {...noSaveImageProps}
            className={`h-full w-full object-cover ${noSaveImageProps.className}`}
          />
        </button>

        {count > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-ink/40 text-ivory opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/60"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-ink/40 text-ivory opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/60"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img._id || i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === activeIndex ? 'bg-gold' : 'bg-ivory/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img._id || i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-20 aspect-[4/5] overflow-hidden border ${
                i === activeIndex ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                {...noSaveImageProps}
                className={`h-full w-full object-cover ${noSaveImageProps.className}`}
              />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-6"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={active.url}
            alt={active.alt || title}
            {...noSaveImageProps}
            className={`max-h-full max-w-full object-contain ${noSaveImageProps.className}`}
          />

          {count > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-ivory text-2xl hover:text-gold"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-ivory text-2xl hover:text-gold"
              >
                ›
              </button>
            </>
          )}

          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 text-ivory text-sm border-b border-gold pb-0.5"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
