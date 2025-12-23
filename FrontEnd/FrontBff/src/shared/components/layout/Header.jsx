import React from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import "../../../styles/Componentes/Header.css";

function Header() {
  const { user, role, loading } = useAuth();

  const userName =
    role === "1" ? String(user?.cliente?.nombreUsuario ?? "").trim() : "";

  const saldoRaw = role === "1" ? user?.cliente?.saldo : null;
  const saldoNum =
    typeof saldoRaw === "number" ? saldoRaw : saldoRaw != null ? Number(saldoRaw) : null;

  const saldoFormateado =
    Number.isFinite(saldoNum)
      ? saldoNum.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
      : "";

  const showUser = !loading && role === "1" && !!userName;

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-header-brand">Empresa</span>
      </div>

      <div className="app-header-right">
        {showUser && (
          <>
            <span className="header-pill" title={userName}>
              <span className="header-pill-label">Usuario:</span>
              <span className="header-pill-value">{userName}</span>
            </span>

            {saldoFormateado && (
              <span className="header-pill header-pill--saldo" title={saldoFormateado}>
                <span className="header-pill-label">Saldo:</span>
                <span className="header-pill-value">{saldoFormateado}</span>
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
