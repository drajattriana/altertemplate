import { Suspense, lazy, type ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";

const HomePage = lazy(() => import("../pages/public/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

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
    </Routes>
  );
};

export default AppRoutes;
