import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="p-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
