import {
  Suspense,
  lazy,
  type ReactElement,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";

import ProtectedRoute from "../utils/ProtectedRoute";

import AppLayout from "../layouts/AppLayout";

import {
  AppWrapper,
} from "../components/app/common/PageMeta";

import NotFound from "../pages/app/OtherPage/NotFound";


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

const HomePage =
  lazy(
    () =>
      import(
        "../pages/public/HomePage"
      )
  );

const LoginPage =
  lazy(
    () =>
      import(
        "../pages/auth/LoginPage"
      )
  );

const LogoutPage =
  lazy(
    () =>
      import(
        "../pages/auth/LogoutPage"
      )
  );


/*
|--------------------------------------------------------------------------
| SUPERADMIN
|--------------------------------------------------------------------------
*/

const SuperadminDashboard =
  lazy(
    () =>
      import(
        "../pages/app/superadmin/Dashboard"
      )
  );

const Menus =
  lazy(
    () =>
      import(
        "../pages/app/superadmin/Menus"
      )
  );

const Roles =
  lazy(
    () =>
      import(
        "../pages/app/superadmin/Roles"
      )
  );

const Permissions =
  lazy(
    () =>
      import(
        "../pages/app/superadmin/Permissions"
      )
  );


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

const AdminDashboard =
  lazy(
    () =>
      import(
        "../pages/app/admin/Dashboard"
      )
  );


/*
|--------------------------------------------------------------------------
| SUSPENSE
|--------------------------------------------------------------------------
*/

const withSuspense = (
  element: ReactElement
) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Memuat halaman...
        </div>
      }
    >
      {element}
    </Suspense>
  );
};


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const AppRoutes =
  () => {
    return (
      <Routes>

        {/* PUBLIC */}

        <Route
          element={
            <PublicLayout />
          }
        >
          <Route
            path="/"
            element={
              withSuspense(
                <HomePage />
              )
            }
          />
        </Route>


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            withSuspense(
              <LoginPage />
            )
          }
        />


        {/* LOGOUT */}

        <Route
          path="/logout"
          element={
            withSuspense(
              <LogoutPage />
            )
          }
        />


        {/* SUPERADMIN */}

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute>
              <AppWrapper>
                <AppLayout />
              </AppWrapper>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="/superadmin/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={
              withSuspense(
                <SuperadminDashboard />
              )
            }
          />

          <Route
            path="menu"
            element={
              withSuspense(
                <Menus />
              )
            }
          />

          <Route
            path="roles"
            element={
              withSuspense(
                <Roles />
              )
            }
          />

          <Route
            path="permissions"
            element={
              withSuspense(
                <Permissions />
              )
            }
          />
        </Route>


        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppWrapper>
                <AppLayout />
              </AppWrapper>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={
              withSuspense(
                <AdminDashboard />
              )
            }
          />
        </Route>


        {/* FALLBACK */}

        <Route
          path="/404"
          element={
            <NotFound />
          }
        />

        <Route
          path="*"
          element={
            <NotFound />
          }
        />

      </Routes>
    );
  };

export default AppRoutes;