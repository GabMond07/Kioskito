// src/pages/Dashboard.jsx
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  
  return (

    <div>
      <h1>Dashboard</h1>
      <h1>Bienvenido {user.name} </h1>
    </div>
  );
}
