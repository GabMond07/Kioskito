// src/pages/Dashboard.jsx
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";

export default function Dashboard() {
  const { accessToken } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      } else {
        alert("Token inválido o expirado");
      }
    };

    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

  return (
    <div>
      {profile ? (
        <div>
          <h1>Bienvenido {profile.username}</h1>
        </div>
      ) : (
        <p>No autenticado</p>
      )}
    </div>
  );
}
