import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-ink/10 bg-ivory/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-20 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 font-serif text-xl tracking-tight text-ink min-w-0 shrink truncate">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.designerName || 'Studio'} className="h-8 w-auto object-contain shrink-0" />
          ) : (
            <span className="truncate">{settings.designerName || 'Studio'}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm shrink-0">
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

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="md:hidden shrink-0 text-ink text-xl leading-none px-1"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-ink/10 px-6 py-4 flex flex-col gap-4 text-sm bg-ivory">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `transition-colors hover:text-gold ${isActive ? 'text-ink' : 'text-ink/70'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
