import {
  useEffect,
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
  getTokenExpiration,
  hasSidebarPath,
  isAuthenticated,
} from "../utils/auth";


interface ProtectedRouteProps {
  children: ReactNode;
}


export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const authenticated =
    isAuthenticated();

  const user =
    getAuthUser();

  const pathSegments =
    location.pathname
      .split("/")
      .filter(Boolean);

  const isRootPath =
    pathSegments.length <= 1;


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
    !isRootPath &&
    !hasSidebarPath(
      location.pathname
    )
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