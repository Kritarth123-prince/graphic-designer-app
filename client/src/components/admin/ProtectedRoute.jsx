import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checking } = useAdminAuth();
  const location = useLocation();

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
