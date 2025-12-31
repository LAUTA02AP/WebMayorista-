// src/features/cart/pages/CartPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../hooks/useCart";
import "../../../styles/cart.css";

const formatARS = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
};

// Input editable: permite borrar y escribir, y confirma en blur/enter
function QtyInput({ id, qty, stock, setQty }) {
  const [draft, setDraft] = useState(String(qty ?? 1));

  // si cambia qty desde afuera (por + / - / sync), actualizamos el input
  useEffect(() => {
    setDraft(String(qty ?? 1));
  }, [id, qty]);

  const commit = useCallback(() => {
    const raw = String(draft).trim();

    // si lo deja vacío, volvemos a 1
    if (raw === "") {
      setQty(id, 1);
      setDraft("1");
      return;
    }

    const n = Number(raw);

    // si no es número válido, restaurar qty actual
    if (!Number.isFinite(n)) {
      setDraft(String(qty ?? 1));
      return;
    }

    // clamp acá para que no "salte" raro
    const clamped = Math.max(1, Math.min(Math.trunc(n), Number(stock) || 1));
    setQty(id, clamped);
    setDraft(String(clamped));
  }, [draft, id, qty, stock, setQty]);

  return (
    <input
      // mejor que type="number" para permitir vacío sin pelearse con el navegador
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className="cart-qty-input"
      value={draft}
      onChange={(e) => {
        const v = e.target.value;
        // permitir vacío y sólo dígitos
        if (v === "" || /^\d+$/.test(v)) setDraft(v);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setDraft(String(qty ?? 1));
          e.currentTarget.blur();
        }
      }}
      aria-label="Cantidad"
      title={`Cantidad (1 a ${stock})`}
    />
  );
}

export default function CartPage() {
  const { items, total, increase, decrease, setQty, remove, clear } = useCart();

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
         
          <div>
            <h2 className="table-page-title">Carrito</h2>
            <div className="table-page-subtitle">Cantidades limitadas por stock</div>
          </div>
        </div>

        <div className="cart-total-section">
          <strong className="cart-total-amount">Total: {formatARS(total)}</strong>
          <button
            type="button"
            className="cart-clear-btn"
            onClick={clear}
            disabled={items.length === 0}
          >
            Vaciar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="pedidos-vacio">Tu carrito está vacío.</p>
      ) : (
        <div className="cart-items-grid">
          {items.map((it) => {
            const maxed = it.qty >= it.stock;

            return (
              <div key={it.id} className="cart-item-card">
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{it.nombre}</h3>
                  <div className="cart-item-details">
                    Código: {it.id} · Precio: {formatARS(it.precio)} · Stock: {it.stock}
                  </div>
                  <div className="cart-item-subtotal">
                    Subtotal: {formatARS(it.precio * it.qty)}
                  </div>
                </div>

                <div className="cart-item-actions">
                  <button
                    type="button"
                    className="cart-btn"
                    onClick={() => decrease(it.id)}
                  >
                    -
                  </button>

                  <QtyInput id={it.id} qty={it.qty} stock={it.stock} setQty={setQty} />

                  <button
                    type="button"
                    className="cart-btn"
                    onClick={() => increase(it.id)}
                    disabled={maxed}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="cart-btn cart-btn-remove"
                    onClick={() => remove(it.id)}
                  >
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
