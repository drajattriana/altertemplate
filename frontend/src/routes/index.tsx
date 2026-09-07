import { Suspense, lazy, type ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import RequireDemoAuth from "../components/auth/RequireDemoAuth";
import AppLayout from "../template-admin/layout/AppLayout";
import { ThemeProvider } from "../template-admin/context/ThemeContext";
import { AppWrapper } from "../template-admin/components/common/PageMeta";

const HomePage = lazy(() => import("../pages/public/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("../template-admin/pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("../template-admin/pages/UserProfiles"));
const Calendar = lazy(() => import("../template-admin/pages/Calendar"));
const Blank = lazy(() => import("../template-admin/pages/Blank"));
const FormElements = lazy(() => import("../template-admin/pages/Forms/FormElements"));
const BasicTables = lazy(() => import("../template-admin/pages/Tables/BasicTables"));
const Alerts = lazy(() => import("../template-admin/pages/UiElements/Alerts"));
const Avatars = lazy(() => import("../template-admin/pages/UiElements/Avatars"));
const Badges = lazy(() => import("../template-admin/pages/UiElements/Badges"));
const Buttons = lazy(() => import("../template-admin/pages/UiElements/Buttons"));
const Images = lazy(() => import("../template-admin/pages/UiElements/Images"));
const Videos = lazy(() => import("../template-admin/pages/UiElements/Videos"));
const LineChart = lazy(() => import("../template-admin/pages/Charts/LineChart"));
const BarChart = lazy(() => import("../template-admin/pages/Charts/BarChart"));

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
      <Route element={<PublicLayout />}>
        <Route path="/" element={withSuspense(<HomePage />)} />
      </Route>
      <Route path="/login" element={withSuspense(<LoginPage />)} />
      <Route path="/admin" element={<RequireDemoAuth><ThemeProvider><AppWrapper><AppLayout /></AppWrapper></ThemeProvider></RequireDemoAuth>}>
        <Route index element={withSuspense(<DashboardPage />)} />
        <Route path="profile" element={withSuspense(<UserProfiles />)} />
        <Route path="calendar" element={withSuspense(<Calendar />)} />
        <Route path="blank" element={withSuspense(<Blank />)} />
        <Route path="form-elements" element={withSuspense(<FormElements />)} />
        <Route path="basic-tables" element={withSuspense(<BasicTables />)} />
        <Route path="alerts" element={withSuspense(<Alerts />)} />
        <Route path="avatars" element={withSuspense(<Avatars />)} />
        <Route path="badge" element={withSuspense(<Badges />)} />
        <Route path="buttons" element={withSuspense(<Buttons />)} />
        <Route path="images" element={withSuspense(<Images />)} />
        <Route path="videos" element={withSuspense(<Videos />)} />
        <Route path="line-chart" element={withSuspense(<LineChart />)} />
        <Route path="bar-chart" element={withSuspense(<BarChart />)} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
