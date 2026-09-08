import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function AboutPage() {
  const { settings } = useSiteSettings();

  useDocumentMeta({
    title: settings.designerName ? `About — ${settings.designerName}` : 'About',
    description: settings.aboutText,
    path: '/about',
  });

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10 py-16">
      <div className="grid md:grid-cols-5 gap-12 items-start">
        <div className="md:col-span-2">
          <div className="aspect-[4/5] bg-charcoal overflow-hidden">
            {settings.profileImageUrl ? (
              <img src={settings.profileImageUrl} alt={settings.designerName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-ivory/30 font-serif text-sm">
                Portrait not set
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <h1 className="font-serif text-4xl">{settings.designerName || 'About'}</h1>
          <p className="mt-6 text-ink/70 leading-relaxed whitespace-pre-line">
            {settings.aboutText || 'This designer has not added an about section yet.'}
          </p>
        </div>
      </div>
    </div>
  );
}
