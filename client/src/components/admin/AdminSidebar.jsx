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

export default function AdminSidebar() {
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-neutral-200">
        <span className="font-semibold text-neutral-900 text-sm">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
  );
}
