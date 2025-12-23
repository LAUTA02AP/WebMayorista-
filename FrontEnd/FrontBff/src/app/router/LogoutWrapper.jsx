// components/LogoutWrapper.jsx
import React, { useEffect, useState } from "react";
import { logoutUser } from "../api/Services";

function LogoutWrapper({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function cerrar() {
      await logoutUser(); // aunque ya esté deslogeado, no pasa nada
      setReady(true);
    }
    cerrar();
  }, []);

  if (!ready) return <div>Cerrando sesión...</div>;

  return children;
}

export default LogoutWrapper;
