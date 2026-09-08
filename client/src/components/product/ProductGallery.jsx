import { useState } from 'react';
import { noSaveImageProps } from '../../utils/imageProtection';

export default function ProductGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const active = images[activeIndex];

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-charcoal flex items-center justify-center text-ivory/30 font-serif">
        No preview available
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setFullscreen(true)}
        className="block w-full aspect-[4/5] bg-charcoal overflow-hidden"
        aria-label="Open fullscreen preview"
      >
        <img
          src={active.url}
          alt={active.alt || title}
          {...noSaveImageProps}
          className={`h-full w-full object-cover ${noSaveImageProps.className}`}
        />
      </button>

      {images.length > 1 && (
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
