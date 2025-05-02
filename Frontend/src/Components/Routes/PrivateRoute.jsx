import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);

  return accessToken ? children : <Navigate to="/" />;
}
