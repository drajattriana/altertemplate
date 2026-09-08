import { Suspense, lazy, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";

import ProtectedRoute from "../utils/ProtectedRoute";

import AppLayout from "../layouts/AppLayout";
import { AppWrapper } from "../components/app/common/PageMeta";

const HomePage = lazy(() => import("../pages/public/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

const DashboardPage = lazy(
  () => import("../pages/app/Dashboard/Home")
);

const UserProfiles = lazy(
  () => import("../pages/app/UserProfiles")
);

const Calendar = lazy(
  () => import("../pages/app/Calendar")
);

const Blank = lazy(
  () => import("../pages/app/Blank")
);

const FormElements = lazy(
  () => import("../pages/app/Forms/FormElements")
);

const BasicTables = lazy(
  () => import("../pages/app/Tables/BasicTables")
);

const Alerts = lazy(
  () => import("../pages/app/UiElements/Alerts")
);

const Avatars = lazy(
  () => import("../pages/app/UiElements/Avatars")
);

const Badges = lazy(
  () => import("../pages/app/UiElements/Badges")
);

const Buttons = lazy(
  () => import("../pages/app/UiElements/Buttons")
);

const Images = lazy(
  () => import("../pages/app/UiElements/Images")
);

const Videos = lazy(
  () => import("../pages/app/UiElements/Videos")
);

const LineChart = lazy(
  () => import("../pages/app/Charts/LineChart")
);

const BarChart = lazy(
  () => import("../pages/app/Charts/BarChart")
);

const withSuspense = (element: ReactElement) => {
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

const AppRoutes = () => {
  return (
    <Routes>

      {/* =========================================================
          PUBLIC
      ========================================================== */}

      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={withSuspense(<HomePage />)}
        />
      </Route>

      {/* =========================================================
          LOGIN
      ========================================================== */}

      <Route
        path="/login"
        element={withSuspense(<LoginPage />)}
      />

      {/* =========================================================
          SUPERADMIN
      ========================================================== */}

      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <AppWrapper>
              <AppLayout />
            </AppWrapper>
          </ProtectedRoute>
        }
      >
        {/* /superadmin otomatis ke /superadmin/dashboard */}
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
          element={withSuspense(<DashboardPage />)}
        />

        <Route
          path="profile"
          element={withSuspense(<UserProfiles />)}
        />

        <Route
          path="calendar"
          element={withSuspense(<Calendar />)}
        />

        <Route
          path="blank"
          element={withSuspense(<Blank />)}
        />

        <Route
          path="form-elements"
          element={withSuspense(<FormElements />)}
        />

        <Route
          path="basic-tables"
          element={withSuspense(<BasicTables />)}
        />

        <Route
          path="alerts"
          element={withSuspense(<Alerts />)}
        />

        <Route
          path="avatars"
          element={withSuspense(<Avatars />)}
        />

        <Route
          path="badge"
          element={withSuspense(<Badges />)}
        />

        <Route
          path="buttons"
          element={withSuspense(<Buttons />)}
        />

        <Route
          path="images"
          element={withSuspense(<Images />)}
        />

        <Route
          path="videos"
          element={withSuspense(<Videos />)}
        />

        <Route
          path="line-chart"
          element={withSuspense(<LineChart />)}
        />

        <Route
          path="bar-chart"
          element={withSuspense(<BarChart />)}
        />
      </Route>

      {/* =========================================================
          ADMIN
      ========================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppWrapper>
              <AppLayout />
            </AppWrapper>
          </ProtectedRoute>
        }
      >
        {/* /admin otomatis ke /admin/dashboard */}
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
          element={withSuspense(<DashboardPage />)}
        />

        <Route
          path="profile"
          element={withSuspense(<UserProfiles />)}
        />

        <Route
          path="calendar"
          element={withSuspense(<Calendar />)}
        />

        <Route
          path="blank"
          element={withSuspense(<Blank />)}
        />

        <Route
          path="form-elements"
          element={withSuspense(<FormElements />)}
        />

        <Route
          path="basic-tables"
          element={withSuspense(<BasicTables />)}
        />

        <Route
          path="alerts"
          element={withSuspense(<Alerts />)}
        />

        <Route
          path="avatars"
          element={withSuspense(<Avatars />)}
        />

        <Route
          path="badge"
          element={withSuspense(<Badges />)}
        />

        <Route
          path="buttons"
          element={withSuspense(<Buttons />)}
        />

        <Route
          path="images"
          element={withSuspense(<Images />)}
        />

        <Route
          path="videos"
          element={withSuspense(<Videos />)}
        />

        <Route
          path="line-chart"
          element={withSuspense(<LineChart />)}
        />

        <Route
          path="bar-chart"
          element={withSuspense(<BarChart />)}
        />
      </Route>

      {/* =========================================================
          FALLBACK
      ========================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;
