import { Link, NavLink } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/about', label: 'About' },
  { to: '/custom-design', label: 'Custom Design' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { settings } = useSiteSettings();

  return (
    <header className="border-b border-ink/10 bg-ivory/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight text-ink">
          {settings.designerName || 'Studio'}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-gold ${isActive ? 'text-ink' : 'text-ink/60'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile nav: intentionally simple for this phase — full mobile
            menu treatment can be revisited once every public page exists. */}
        <nav className="flex md:hidden items-center gap-5 text-xs">
          <Link to="/shop" className="text-ink/70 hover:text-gold">
            Shop
          </Link>
          <Link to="/contact" className="text-ink/70 hover:text-gold">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
