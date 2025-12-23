import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { MENU_BY_ROLE } from "../../../app/config/menuByRole";
import "../../../styles/Componentes/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Si tu login es "/", como el Layout NO se renderiza en "/", esto casi no hace falta,
  // pero lo dejo por seguridad:
  if (location.pathname === "/") return null;
  if (loading || !user) return null;

  const items = MENU_BY_ROLE[role] ?? [];

  const closeAll = () => {
    setIsMobileOpen(false);
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeAll();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Botón mobile */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setIsMobileOpen((v) => !v)}
        aria-label="Abrir menú"
        aria-expanded={isMobileOpen}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
          />
        </svg>
      </button>

      <nav className={`modern-nav ${isMobileOpen ? "mobile-open" : ""}`} aria-label="Menú lateral">
        <ul className="nav-list">
          {/* Header del sidebar */}
          <li className="nav-header">
            <div className="nav-logo-circle">logo</div>
            <span className="nav-title">Empresa</span>
          </li>

          {/* Menú por rol */}
          {items.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeAll}
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          {/* Botones “próximamente” (opcionales) */}
          {role === "1" && (
            <>
              <li className="nav-item">
                <button className="nav-link" onClick={(e) => e.preventDefault()} type="button">
                  Cta Cte (próximamente)
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={(e) => e.preventDefault()} type="button">
                  Historial (desarrollo)
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={(e) => e.preventDefault()} type="button">
                  Pagar (próximamente)
                </button>
              </li>
            </>
          )}

          {/* Configuración + modo oscuro */}
          <li className="nav-item nav-settings">
            <button
              type="button"
              className="nav-link"
              onClick={() => setIsSettingsOpen((v) => !v)}
              aria-expanded={isSettingsOpen}
            >
              <span className="gear-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.64.22l2.39-.96c.5.4 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.24.1.51.01.64-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
                  />
                </svg>
              </span>
              Configuración
            </button>

            {isSettingsOpen && (
              <div className="settings-popover">
                <div className="settings-row">
                  <span className="settings-label">Modo oscuro</span>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />
                    <span className="switch-ui" />
                  </label>
                </div>
              </div>
            )}
          </li>

          {/* Logout */}
          <li className="nav-item nav-logout">
            <button onClick={handleLogout} className="logout-btn" type="button">
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Overlay mobile */}
      {isMobileOpen && <div className="mobile-overlay" onClick={closeAll} />}
    </>
  );
}

export default Sidebar;
