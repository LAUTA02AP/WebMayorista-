// src/app/App.jsx
import React from "react";
import AppRouter from "./router";
import { AuthProvider } from "./providers/AuthProvider";
import { CartProvider } from "./providers/CartProvider";

export default function App() {
  return (
   <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
