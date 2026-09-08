import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function HomePage() {
  const { settings } = useSiteSettings();

  useDocumentMeta({
    title: settings.designerName ? `${settings.designerName} — Graphic Design Studio` : undefined,
    description: settings.heroSubtitle,
    image: settings.heroImageUrl,
    path: '/',
  });

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
      <h1 className="font-serif text-5xl md:text-7xl max-w-3xl leading-[1.05]">
        {settings.heroTitle || 'Design that demands attention.'}
      </h1>
      <p className="mt-6 max-w-md text-ink/60">
        {settings.heroSubtitle ||
          'Curated visual experiences crafted with intention, character and a distinct creative point of view.'}
      </p>
      <div className="mt-10 flex gap-6 text-sm">
        <Link to="/shop" className="bg-ink text-ivory px-6 py-3 hover:bg-charcoal transition-colors">
          Explore Collection
        </Link>
        <Link to="/custom-design" className="border border-ink/20 px-6 py-3 hover:border-gold transition-colors">
          Work With Me
        </Link>
      </div>
    </div>
  );
}
