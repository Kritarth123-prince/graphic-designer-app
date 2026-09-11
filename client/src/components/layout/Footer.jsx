import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  behance: 'Behance',
  dribbble: 'Dribbble',
  linkedin: 'LinkedIn',
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  const socialLinks = Object.entries(settings.social || {}).filter(
    ([key, url]) => SOCIAL_LABELS[key] && url
  );

  return (
    <footer className="border-t border-ink/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg">{settings.designerName || 'Studio'}</p>
          <p className="mt-3 text-sm text-ink/60 max-w-xs">
            {settings.footerText || 'Original graphic design, made with intention.'}
          </p>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="mt-3 block text-sm text-ink/60 hover:text-gold">
              {settings.email}
            </a>
          )}
        </div>

        <div className="text-sm">
          <p className="text-ink/40 mb-3">Explore</p>
          <ul className="space-y-2">
            <li><Link to="/shop" className="hover:text-gold">Shop</Link></li>
            <li><Link to="/portfolio" className="hover:text-gold">Portfolio</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/custom-design" className="hover:text-gold">Custom Design</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="text-ink/40 mb-3">Legal</p>
          <ul className="space-y-2">
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms</Link></li>
            <li><Link to="/refund-policy" className="hover:text-gold">Refund Policy</Link></li>
            <li><Link to="/order-information" className="hover:text-gold">Order Information</Link></li>
          </ul>
        </div>

        {socialLinks.length > 0 && (
          <div className="text-sm">
            <p className="text-ink/40 mb-3">Follow</p>
            <ul className="space-y-2">
              {socialLinks.map(([key, url]) => (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                    {SOCIAL_LABELS[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-ink/10 py-6 text-center text-xs text-ink/40">
        © {year} {settings.designerName || 'Studio'}. All rights reserved.
      </div>
    </footer>
  );
}
