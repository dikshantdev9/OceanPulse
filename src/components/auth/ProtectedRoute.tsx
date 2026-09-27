import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoaderCircleIcon, ShieldAlertIcon } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-abyss-950 p-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-tide-500/30" />
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-tide-400" />
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-tide-300">
          Verifying Security Credentials…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested target location so user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
