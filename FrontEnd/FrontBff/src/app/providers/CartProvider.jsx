// src/app/providers/CartProvider.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  cartReducer,
  initialCartState,
  selectCartCount,
  selectCartTotal,
} from "../../features/cart/cartReducer";

const CartContext = createContext(null);

const STORAGE_KEY = "suprasoft_cart_v1";

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const persisted = safeLoad();
  const [state, dispatch] = useReducer(cartReducer, persisted ?? initialCartState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // no rompemos si no hay storage
    }
  }, [state]);

  // acciones (estables)
  const addToCart = useCallback((item, qty = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { item, qty } });
  }, []);

  const increase = useCallback((id) => {
    dispatch({ type: "INCREASE", payload: { id } });
  }, []);

  const decrease = useCallback((id) => {
    dispatch({ type: "DECREASE", payload: { id } });
  }, []);

  const setQty = useCallback((id, qty) => {
    dispatch({ type: "SET_QTY", payload: { id, qty } });
  }, []);

  const remove = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: { id } });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const syncStocks = useCallback((arr) => {
    dispatch({ type: "SYNC_STOCKS", payload: arr });
  }, []);

  const value = useMemo(() => {
    return {
      items: state.items,
      count: selectCartCount(state),
      total: selectCartTotal(state),

      addToCart,
      increase,
      decrease,
      setQty,
      remove,
      clear,
      syncStocks,
    };
  }, [state, addToCart, increase, decrease, setQty, remove, clear, syncStocks]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext debe usarse dentro de <CartProvider />");
  return ctx;
}
