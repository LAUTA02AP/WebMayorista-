// src/components/BotonDescargar.jsx
import React from "react";

function BotonDescargar({ label = "Descargar" }) {
  return (
    <button
      type="button"
      className="btn-table-export"
      onClick={() => {}}
    >
      {/* Podés cambiar el emoji o quitarlo */}
      <span className="btn-table-export-icon">⬇️</span>
      <span>{label}</span>
    </button>
  );
}

export default BotonDescargar;
