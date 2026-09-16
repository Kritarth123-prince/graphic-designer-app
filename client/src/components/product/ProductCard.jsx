import { Link } from 'react-router-dom';
import { noSaveImageProps } from '../../utils/imageProtection';

export default function ProductCard({ product }) {
  return (
    <Link to={`/shop/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-charcoal aspect-[4/5]">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            {...noSaveImageProps}
            className={`h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 ${noSaveImageProps.className}`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ivory/30 font-serif text-sm">
            No preview yet
          </div>
        )}

        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-500 flex items-end p-6 opacity-0 group-hover:opacity-100">
          <span className="text-ivory text-sm border-b border-gold pb-0.5">View Artwork</span>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg leading-snug">{product.title}</h3>
          <p className="text-xs text-ink/50 mt-1">{product.category?.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm">
            {product.currency || 'INR'} {product.price}
          </p>
          <p className="font-mono text-[11px] text-ink/40 mt-1">{product.productId}</p>
        </div>
      </div>
    </Link>
  );
}
