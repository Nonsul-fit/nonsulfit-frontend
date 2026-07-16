import { Navigate, Outlet, useLocation } from "react-router-dom";
import { createLoginRedirectPath } from "../utils/authRedirect";

const ProtectedRoute = () => {
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    const destination = `${location.pathname}${location.search}`;
    return <Navigate to={createLoginRedirectPath(destination)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
