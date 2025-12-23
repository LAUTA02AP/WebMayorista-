// src/components/common/BotonEditarPedidoTest.jsx
import React from "react";
import "../../styles/Componentes/botonEditarPedidoTest.css";

export default function BotonEditarPedidoTest({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="btn-pill btn-pill-danger"
      onClick={onClick}
      disabled={disabled}
      title="Test Update: suma $1 al total del primer pedido"
    >
      <span className="btn-pill-icon">✎</span>
      Test update
    </button>
  );
}
