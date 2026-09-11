import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans md:flex">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        <div className="h-16 flex items-center px-4 border-b border-neutral-200 bg-white md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-neutral-600 text-xl leading-none px-1"
          >
            ☰
          </button>
          <span className="ml-3 font-semibold text-sm">Admin</span>
        </div>

        <main className="p-4 md:p-8 max-w-6xl overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
