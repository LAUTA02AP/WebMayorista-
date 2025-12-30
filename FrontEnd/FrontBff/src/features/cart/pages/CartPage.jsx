// src/features/cart/pages/CartPage.jsx
import React from "react";
import BotonVolver from "../../../shared/components/ui/BotonVolver";
import { useCart } from "../hooks/useCart";
import "../../../styles/cart.css";



const formatARS = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
};

export default function CartPage() {
  const { items, total, increase, decrease, setQty, remove, clear } = useCart();

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />
          <div>
            <h2 className="table-page-title">Carrito</h2>
            <div className="table-page-subtitle">Cantidades limitadas por stock</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <strong>Total: {formatARS(total)}</strong>
          <button type="button" onClick={clear} disabled={items.length === 0}>
            Vaciar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="pedidos-vacio">Tu carrito está vacío.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((it) => {
            const maxed = it.qty >= it.stock;

            return (
              <div
                key={it.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{it.nombre}</div>
                  <div style={{ opacity: 0.8 }}>
                    Código: {it.id} · Precio: {formatARS(it.precio)} · Stock: {it.stock}
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    Subtotal: {formatARS(it.precio * it.qty)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button type="button" onClick={() => decrease(it.id)}>-</button>

                  <input
                    type="number"
                    min={1}
                    max={it.stock}
                    value={it.qty}
                    onChange={(e) => setQty(it.id, e.target.value)}
                    style={{ width: 70, textAlign: "center" }}
                  />

                  <button type="button" onClick={() => increase(it.id)} disabled={maxed}>
                    +
                  </button>

                  <button type="button" onClick={() => remove(it.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
