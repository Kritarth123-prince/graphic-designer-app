import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import defaultHeroImage from '../../assets/hero-still-life.jpg';

export default function HomePage() {
  const { settings } = useSiteSettings();
  const heroImage = settings.heroImageUrl || defaultHeroImage;

  useDocumentMeta({
    title: settings.designerName ? `${settings.designerName} — Graphic Design Studio` : undefined,
    description: settings.heroSubtitle,
    image: heroImage,
    path: '/',
    structuredData: settings.designerName
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings.designerName,
          url: window.location.origin,
          logo: settings.logoUrl || undefined,
          description: settings.aboutText || settings.heroSubtitle || undefined,
          sameAs: Object.values(settings.social || {}).filter((v) => typeof v === 'string' && v),
        }
      : undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 sm:py-24 md:py-32">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05]">
            {settings.heroTitle || 'Design that demands attention.'}
          </h1>
          <p className="mt-5 sm:mt-6 max-w-md text-ink/60">
            {settings.heroSubtitle ||
              'Curated visual experiences crafted with intention, character and a distinct creative point of view.'}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 text-sm">
            <Link
              to="/shop"
              className="bg-ink text-ivory px-6 py-3 hover:bg-charcoal transition-colors text-center"
            >
              Explore Collection
            </Link>
            <Link
              to="/custom-design"
              className="border border-ink/20 px-6 py-3 hover:border-gold transition-colors text-center"
            >
              Work With Me
            </Link>
          </div>
        </div>

        <div className="aspect-[4/3] bg-charcoal overflow-hidden rounded-sm">
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover object-[60%_center]"
          />
        </div>
      </div>
    </div>
  );
}
