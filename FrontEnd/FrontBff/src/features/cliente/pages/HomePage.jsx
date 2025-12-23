import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";

import "../../../styles/Generales/pages.css";
import "../../../styles/Generales/Table.css";

function HomePage() {
  const { user, role, loading } = useAuth();

  if (loading) return <p className="loading-text">Cargando...</p>;
  if (!user) return <Navigate to="/" replace />;

  // solo rol 1
  if (role !== "1") return <Navigate to="/" replace />;

  const nombre = user?.cliente?.nombreUsuario ?? "Usuario";
  const saldoRaw = user?.cliente?.saldo ?? 0;
  const saldoNum = typeof saldoRaw === "number" ? saldoRaw : Number(saldoRaw) || 0;

  const saldoFormateado = saldoNum.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  return (
    <div>
      <section className="section1">
        <h2>
          Bienvenido, <span className="cliente-nombre">{nombre}</span>
          <br />
          Tu saldo es: <span className="saldo-monto">{saldoFormateado}</span>
        </h2>
      </section>

      <section className="section2">
        <h1>Sobre Nosotros</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      <section className="section3">
        <h2>DESTACADOS</h2>
        <p>Productos en oferta - Aprovechá nuestras mejores promociones</p>
      </section>

      <section className="Contacto">
        <h2>Contacto</h2>
        <p>📞 Teléfono: +54 9 351 123-4567</p>
        <p>✉️ Email: contacto@ejemplo.com</p>
      </section>
    </div>
  );
}

export default HomePage;
