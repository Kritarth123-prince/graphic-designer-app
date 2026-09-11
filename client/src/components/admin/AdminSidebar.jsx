import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/portfolio', label: 'Portfolio' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inquiries', label: 'Inquiries' },
  { to: '/admin/custom-requests', label: 'Custom Requests' },
  { to: '/admin/settings', label: 'Settings' },
];

// Off-canvas on mobile (fixed + slide-in, shown behind a backdrop when
// `open`), a normal in-flow column from md up. `onNavigate` closes the
// drawer after picking a link so it doesn't stay open over the page.
export default function AdminSidebar({ open, onClose, onNavigate }) {
  const { admin, logout } = useAdminAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-neutral-200 bg-white flex flex-col transition-transform md:static md:z-auto md:w-56 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200">
          <span className="font-semibold text-neutral-900 text-sm">Admin</span>
          <button onClick={onClose} aria-label="Close menu" className="text-neutral-400 md:hidden">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${
                  isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-200 text-sm">
          <p className="px-3 text-neutral-500 truncate">{admin?.email}</p>
          <button
            onClick={logout}
            className="mt-2 w-full text-left px-3 py-2 rounded text-neutral-600 hover:bg-neutral-100"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
