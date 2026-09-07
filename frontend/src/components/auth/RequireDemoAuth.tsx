import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isDemoAuthenticated } from "../../utils/demoAuth";

type RequireDemoAuthProps = {
  children: ReactElement;
};

const RequireDemoAuth = ({ children }: RequireDemoAuthProps) => {
  const location = useLocation();

  if (!isDemoAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireDemoAuth;

