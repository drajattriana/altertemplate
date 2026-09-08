import { useEffect, type ReactNode } from "react";

import { Navigate, useNavigate } from "react-router-dom";

import {
  clearAuth,
  getAuthUser,
  getTokenExpiration,
  isAuthenticated,
} from "../utils/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const user = getAuthUser();

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const expiresAt = getTokenExpiration();

    if (!expiresAt) {
      return;
    }

    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      clearAuth();

      navigate("/login", {
        replace: true,
      });

      return;
    }

    const timer = window.setTimeout(() => {
      clearAuth();

      navigate("/login", {
        replace: true,
      });
    }, remaining);

    return () => {
      window.clearTimeout(timer);
    };
  }, [authenticated, navigate]);

  if (!authenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.slug)) {
    return <Navigate to={user.redirect_path} replace />;
  }

  return children;
}
