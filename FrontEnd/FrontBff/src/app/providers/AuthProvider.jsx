import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUserInfo, loginUser, logoutUser } from "../../services/Services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const data = await getUserInfo();
    setUser(data ?? null);
    return data ?? null;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getUserInfo();
        if (mounted) setUser(data ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const login = async (usuario, clave) => {
    await loginUser(usuario, clave);   // set-cookie HttpOnly
    const me = await refreshUser();    // trae user real
    return me;
  };

  const logout = async () => {
    try { await logoutUser(); } catch {}
    localStorage.clear();
    setUser(null);
  };

  const value = useMemo(() => {
    const role = String(user?.rolUsuario ?? "");
    return {
      user,
      role,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
