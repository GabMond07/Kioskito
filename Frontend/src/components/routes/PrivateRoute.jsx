import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../ui/LoaderPage";

export default function PrivateRoute({ children, roleRequired }) {
  const { accessToken, user, isLoading, hasActiveSubscription } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader className="w-16 h-16"/></div>;
  }

  if (!user || !accessToken) {
    return <Navigate to={roleRequired === 2 ? '/' : '/admin'} replace />;
  }

  if (user.id_rol !== roleRequired) {
    return <Navigate to={user.id_rol === 1 ? '/home' : '/admin'} replace />;
  }

  if (roleRequired === 1 && !hasActiveSubscription && location.pathname !== '/subscription') {
    return <Navigate to="/subscription" replace state={{ from: location }} />;
  }

  return accessToken ? children : <Navigate to="/" />;
}