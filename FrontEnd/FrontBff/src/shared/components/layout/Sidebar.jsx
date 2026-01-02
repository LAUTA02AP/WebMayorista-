import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
} from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tooltip real
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    top: 0,
    left: 0,
  });

  // No mostrar en login
  if (location.pathname === "/") return null;
  if (loading || !user) return null;

  const items = MENU_BY_ROLE[role] ?? [];

  // Expandido si NO está colapsado o si está abierto en mobile
  const isExpanded = !isCollapsed || isMobileOpen;

  // Mostrar tooltip SOLO cuando está colapsado en desktop
  const shouldShowTooltips = isCollapsed && !isMobileOpen;

  useEffect(() => {
    const shouldCollapseLayout = isCollapsed && !isMobileOpen;
    document.body.classList.toggle("sidebar-collapsed", shouldCollapseLayout);
    return () => document.body.classList.remove("sidebar-collapsed");
  }, [isCollapsed, isMobileOpen]);

  // Ocultar tooltip al cambiar cosas importantes
  useEffect(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, [location.pathname, isMobileOpen, isCollapsed]);

  const closeAll = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    await logout();
    closeAll();
    navigate("/", { replace: true });
  };

  const handleToggleCollapsed = () => setIsCollapsed((v) => !v);

  const showTooltip = (e, text) => {
    if (!shouldShowTooltips) return;
    if (!text) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideTooltip = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <>
      {/* Botón mobile (hamburguesa) */}
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

      <nav
        className={[
          "modern-nav",
          isMobileOpen ? "mobile-open" : "",
          isCollapsed && !isMobileOpen ? "collapsed" : "expanded",
        ].join(" ")}
        aria-label="Menú lateral"
      >
        {/* Header */}
        <div className="nav-header">
          <div className="nav-logo-circle">logo</div>

          {isExpanded && <span className="nav-title">Empresa</span>}

          {/* Toggle colapsar/expandir (desktop) */}
          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={handleToggleCollapsed}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            onMouseEnter={(e) =>
              showTooltip(e, isCollapsed ? "Expandir" : "Colapsar")
            }
            onMouseLeave={hideTooltip}
            onFocus={(e) =>
              showTooltip(e, isCollapsed ? "Expandir" : "Colapsar")
            }
            onBlur={hideTooltip}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Scroll interno (esto evita que se recorte el botón afuera) */}
        <div className="nav-scroll">
          <ul className="nav-list">
            {/* Menú por rol */}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={closeAll}
                    onMouseEnter={(e) => showTooltip(e, item.label)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip(e, item.label)}
                    onBlur={hideTooltip}
                  >
                    {Icon && <Icon size={18} className="nav-icon" />}
                    {isExpanded && (
                      <span className="nav-label">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}

            {/* Próximamente (opcionales) */}
            {role === "1" && (
              <>
                {[
                  "Cta Cte (próximamente)",
                  "Historial (desarrollo)",
                  "Pagar (próximamente)",
                ].map((label) => (
                  <li className="nav-item" key={label}>
                    <button
                      className="nav-link"
                      onClick={(e) => e.preventDefault()}
                      type="button"
                      onMouseEnter={(e) => showTooltip(e, label)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltip(e, label)}
                      onBlur={hideTooltip}
                    >
                      <Clock size={18} className="nav-icon" />
                      {isExpanded && <span className="nav-label">{label}</span>}
                    </button>
                  </li>
                ))}
              </>
            )}

            {/* Toggle tema */}
            <li className="nav-item nav-theme-toggle">
              <button
                type="button"
                className="nav-link theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
                }
                onMouseEnter={(e) =>
                  showTooltip(e, theme === "dark" ? "Modo claro" : "Modo oscuro")
                }
                onMouseLeave={hideTooltip}
                onFocus={(e) =>
                  showTooltip(e, theme === "dark" ? "Modo claro" : "Modo oscuro")
                }
                onBlur={hideTooltip}
              >
                {theme === "dark" ? (
                  <Sun size={18} className="nav-icon" />
                ) : (
                  <Moon size={18} className="nav-icon" />
                )}
                {isExpanded && (
                  <span className="nav-label">
                    {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                  </span>
                )}
              </button>
            </li>

            {/* Logout */}
            <li className="nav-item nav-logout">
              <button
                onClick={handleLogout}
                className="nav-link logout-link"
                type="button"
                onMouseEnter={(e) => showTooltip(e, "Cerrar sesión")}
                onMouseLeave={hideTooltip}
                onFocus={(e) => showTooltip(e, "Cerrar sesión")}
                onBlur={hideTooltip}
              >
                <LogOut size={18} className="nav-icon" />
                {isExpanded && (
                  <span className="nav-label">Cerrar sesión</span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Overlay mobile */}
      {isMobileOpen && <div className="mobile-overlay" onClick={closeAll} />}

      {/* Tooltip real fuera del sidebar */}
      {tooltip.visible &&
        createPortal(
          <div
            className="sidebar-tooltip"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </>
  );
}

export default Sidebar;
