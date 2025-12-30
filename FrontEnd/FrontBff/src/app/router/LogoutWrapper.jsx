// components/LogoutWrapper.jsx
import React, { useEffect, useState } from "react";
import { logoutUser } from "../api/Services"; // ajustá el path si tu archivo real está en src/services/Services.js

function LogoutWrapper({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function cerrar() {
      try {
        // aunque ya esté deslogueado, no pasa nada
        await logoutUser();
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      } finally {
        if (mounted) setReady(true);
      }
    }

    cerrar();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return <div>Cerrando sesión...</div>;

  return children;
}

export default LogoutWrapper;
