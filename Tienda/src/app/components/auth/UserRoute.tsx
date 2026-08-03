import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export function UserRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/perfil' }} />;
  }

  return <Outlet />;
}