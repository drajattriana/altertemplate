import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  clearAuth,
  getAuthUser,
  getToken,
  getTokenExpiration,
  hasSidebarPath,
  isAuthenticated,
} from "../utils/auth";


interface ProtectedRouteProps {
  children: ReactNode;
  requireMenuAccess?: boolean;
}


const API_URL =
  import.meta.env.VITE_API_URL;


export default function ProtectedRoute({
  children,
  requireMenuAccess = true,
}: ProtectedRouteProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const authenticated =
    isAuthenticated();

  const user =
    getAuthUser();

  const sidebarAllowed =
    hasSidebarPath(
      location.pathname
    );

  const [
    hiddenRouteAllowed,
    setHiddenRouteAllowed,
  ] =
    useState<
      boolean | null
    >(
      requireMenuAccess
        ? null
        : true
    );


  /*
  |--------------------------------------------------------------------------
  | TOKEN EXPIRATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const expiresAt =
      getTokenExpiration();

    if (!expiresAt) {
      return;
    }

    const remaining =
      expiresAt -
      Date.now();

    if (
      remaining <= 0
    ) {
      clearAuth();

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    const timer =
      window.setTimeout(
        () => {
          clearAuth();

          navigate(
            "/login",
            {
              replace: true,
            }
          );
        },
        remaining
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    authenticated,
    navigate,
  ]);


  /*
  |--------------------------------------------------------------------------
  | HIDDEN MENU ACCESS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !authenticated ||
      !requireMenuAccess
    ) {
      return;
    }

    if (sidebarAllowed) {
      setHiddenRouteAllowed(
        true
      );

      return;
    }

    let cancelled =
      false;

    const checkAccess =
      async () => {
        try {
          setHiddenRouteAllowed(
            null
          );

          const token =
            getToken();

          if (!token) {
            if (!cancelled) {
              setHiddenRouteAllowed(
                false
              );
            }

            return;
          }

          const response =
            await fetch(
              `${API_URL}/auth/access?path=${encodeURIComponent(
                location.pathname
              )}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (cancelled) {
            return;
          }

          if (
            response.status ===
            401
          ) {
            clearAuth();

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          setHiddenRouteAllowed(
            response.ok
          );
        } catch {
          if (!cancelled) {
            setHiddenRouteAllowed(
              false
            );
          }
        }
      };

    void checkAccess();

    return () => {
      cancelled =
        true;
    };
  }, [
    authenticated,
    requireMenuAccess,
    sidebarAllowed,
    location.pathname,
    navigate,
  ]);


  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  if (
    !authenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | MENU ACCESS
  |--------------------------------------------------------------------------
  */

  if (
    requireMenuAccess &&
    !sidebarAllowed &&
    hiddenRouteAllowed ===
      null
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat halaman...
      </div>
    );
  }


  if (
    requireMenuAccess &&
    !sidebarAllowed &&
    hiddenRouteAllowed ===
      false
  ) {
    return (
      <Navigate
        to="/404"
        replace
      />
    );
  }


  return children;
}