// src/app/App.jsx
import React from "react";
import AppRouter from "./router";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
// (futuro) import { CartProvider } from "./providers/CartProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* <CartProvider> */}
        <AppRouter />
        {/* </CartProvider> */}
      </AuthProvider>
    </ThemeProvider>
  );
}
