import { Navigate, Outlet, useLocation } from "react-router-dom";
import { createLoginRedirectPath } from "../utils/authRedirect";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    const destination = `${location.pathname}${location.search}`;
    return <Navigate to={createLoginRedirectPath(destination)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
