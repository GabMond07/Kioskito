import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateRoute({ children, roleRequired }) {
  const { accessToken, user , isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user || !accessToken) {
    return <Navigate to={roleRequired === 2 ? '/' : '/admin'} replace />;
  }

  if (user.id_rol !== roleRequired) {
    return <Navigate to={user.id_rol === 1 ? '/home' : '/admin'} replace />;
  }

  return accessToken ? children : <Navigate to="/" />;
}

