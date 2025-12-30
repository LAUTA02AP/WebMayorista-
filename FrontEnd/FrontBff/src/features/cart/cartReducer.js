// src/features/cart/cartReducer.js
//Este reducer clampa cantidades para no pasar stock y no bajar de 1.
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toMoney = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const initialCartState = {
  items: [], // [{ id, nombre, precio, stock, qty }]
};

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item, qty = 1 } = action.payload;

      const stock = toInt(item.stock);
      if (!item.id || stock <= 0) return state;

      const addQty = clamp(toInt(qty) || 1, 1, stock);

      const idx = state.items.findIndex((x) => x.id === item.id);

      // si existe -> sumar clamp
      if (idx >= 0) {
        const current = state.items[idx];

        // si el stock cambió, respetalo
        const effectiveStock = stock;

        const newQty = clamp(current.qty + addQty, 1, effectiveStock);

        const next = [...state.items];
        next[idx] = {
          ...current,
          stock: effectiveStock,
          precio: toMoney(item.precio ?? current.precio),
          qty: newQty,
        };

        return { ...state, items: next };
      }

      // si no existe -> agregar
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: item.id,
            nombre: item.nombre ?? "Producto",
            precio: toMoney(item.precio),
            stock,
            qty: addQty,
          },
        ],
      };
    }

    case "INCREASE": {
      const { id } = action.payload;
      const next = state.items.map((it) => {
        if (it.id !== id) return it;
        const stock = toInt(it.stock);
        return { ...it, qty: clamp(it.qty + 1, 1, stock) };
      });
      return { ...state, items: next };
    }

    case "DECREASE": {
      const { id } = action.payload;
      const next = state.items
        .map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0);
      return { ...state, items: next };
    }

    case "SET_QTY": {
      const { id, qty } = action.payload;
      const next = state.items.map((it) => {
        if (it.id !== id) return it;
        const stock = toInt(it.stock);
        const q = clamp(toInt(qty) || 1, 1, stock);
        return { ...it, qty: q };
      });
      return { ...state, items: next };
    }

    case "REMOVE": {
      const { id } = action.payload;
      return { ...state, items: state.items.filter((it) => it.id !== id) };
    }

    case "CLEAR":
      return initialCartState;

    // opcional: si refrescás productos y querés actualizar stock/precio en carrito
    case "SYNC_STOCKS": {
      // payload: [{ id, stock, precio? }]
      const map = new Map(action.payload.map((x) => [x.id, x]));
      const next = state.items
        .map((it) => {
          const upd = map.get(it.id);
          if (!upd) return it;

          const stock = toInt(upd.stock);
          const precio = upd.precio != null ? toMoney(upd.precio) : it.precio;
          const qty = stock > 0 ? clamp(it.qty, 1, stock) : 0;

          return { ...it, stock, precio, qty };
        })
        .filter((it) => it.qty > 0 && it.stock > 0);

      return { ...state, items: next };
    }

    default:
      return state;
  }
}

// Selectores
export const selectCartCount = (state) =>
  state.items.reduce((acc, it) => acc + it.qty, 0);

export const selectCartTotal = (state) =>
  state.items.reduce((acc, it) => acc + it.precio * it.qty, 0);
