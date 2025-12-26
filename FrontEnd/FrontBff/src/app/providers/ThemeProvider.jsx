// src/app/providers/ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider"; 
// ↑ IMPORTANTE: ajustá la ruta si tu AuthProvider está en otro lado.
// Según tu arquitectura era src/app/providers/AuthProvider.jsx,
// así que probablemente sea:  import { useAuth } from "./AuthProvider.jsx";

const ThemeContext = createContext(null);

/**
 * =========================================================
 * ✅ CLAVE POR USUARIO
 * - Si hay usuario -> theme_user_<id>
 * - Si NO hay usuario (login) -> theme_guest
 * =========================================================
 */
function getThemeKey(user) {
  const id =
    user?.id ??
    user?.Id ??
    user?.userId ??
    user?.UserId ??
    user?.dni ??
    user?.Dni ??
    user?.username ??
    user?.userName ??
    "guest";

  return `theme_user_${String(id)}`;
}

/**
 * =========================================================
 * ✅ LECTURA INICIAL
 * - Lee theme guardado para esa key
 * - Si no hay nada, vuelve a "light"
 * =========================================================
 */
function getInitialThemeByKey(themeKey) {
  const saved = localStorage.getItem(themeKey);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
}

export function ThemeProvider({ children }) {
  const { user } = useAuth(); // ✅ agarramos el usuario real desde tu AuthProvider
  const themeKey = useMemo(() => getThemeKey(user), [user]);

  // ✅ estado inicial usando la key del usuario
  const [theme, setTheme] = useState(() => getInitialThemeByKey(themeKey));

  /**
   * =========================================================
   * ✅ CUANDO CAMBIA EL USUARIO (login/logout/cambio cuenta)
   * - Releemos el theme guardado para ese usuario
   * =========================================================
   */
  useEffect(() => {
    setTheme(getInitialThemeByKey(themeKey));
  }, [themeKey]);

  /**
   * =========================================================
   * ✅ APLICAR Y PERSISTIR
   * - Aplica data-theme al <html>
   * - Guarda en localStorage con key por usuario
   *
   * ✅ IMPORTANTE:
   * - En cleanup ponemos LIGHT para que el LOGIN siempre sea light
   * - PERO NO BORRAMOS localStorage: así queda guardado para ese usuario
   * =========================================================
   */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(themeKey, theme);

    return () => {
      // login siempre claro
      document.documentElement.setAttribute("data-theme", "light");
    };
  }, [theme, themeKey]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
