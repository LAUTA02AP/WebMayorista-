import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../../../Styles/Componentes/ui/BotonDescargar.css";

function BotonDescargar({
  data = [],
  nombreArchivo = "Datos",
  nombreHoja = "Hoja1",
  label = "Descargar Excel",
  variant = "default", // "default" | "primary" | "accent"
  size = "default", // "sm" | "default" | "lg"
}) {
  const [cargando, setCargando] = useState(false);

  const manejarDescarga = async () => {
    if (cargando) return;

    try {
      setCargando(true);
      await new Promise(requestAnimationFrame);

      const libro = XLSX.utils.book_new();
      const hoja = XLSX.utils.json_to_sheet(data);

      XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
      XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
    } catch (error) {
      console.error(error);
      alert("No se pudo generar el Excel.");
    } finally {
      setCargando(false);
    }
  };

  const sinDatos = !Array.isArray(data) || data.length === 0;

  // Clases dinámicas
  const clases = [
    "btn-table-export",
    cargando && "is-loading",
    variant !== "default" && `btn-table-export--${variant}`,
    size !== "default" && `btn-table-export--${size}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={clases}
      onClick={manejarDescarga}
      disabled={cargando || sinDatos}
      title={sinDatos ? "No hay datos para exportar" : "Descargar Excel"}
    >
      <span className="btn-table-export-icon" aria-hidden="true">
        {cargando ? (
          // Spinner (círculo girando)
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          // Ícono de descarga
          <svg viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </span>
      <span className="btn-table-export-text">
        {cargando ? "Generando..." : label}
      </span>
    </button>
  );
}

export default BotonDescargar;