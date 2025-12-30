// src/app/router/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute.jsx";
import LayoutWrapper from "../../shared/components/layout/LayoutWrapper.jsx";

import LoginPage from "../../features/auth/LoginPage.jsx";
import HomePage from "../../features/cliente/pages/HomePage.jsx";
import PedidosPageCliente from "../../features/cliente/pages/PedidosPage.jsx";
import ProductosPage from "../../features/productos/pages/ProductosPage.jsx";

// ✅ NUEVO: página de carrito
import CartPage from "../../features/cart/pages/CartPage.jsx";

import { ThemeProvider } from "../providers/ThemeProvider";

export default function AppRouter() {
  return (
    <Routes>
      {/* Login SIEMPRE fuera del ThemeProvider */}
      <Route path="/" element={<LoginPage />} />

      {/* Todo lo protegido queda dentro del ThemeProvider */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <ThemeProvider>
              <LayoutWrapper />
            </ThemeProvider>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/pedidos" element={<PedidosPageCliente />} />
          <Route path="/productos" element={<ProductosPage />} />

          {/* ✅ NUEVA RUTA CARRITO */}
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
