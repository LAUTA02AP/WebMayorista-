// src/app/App.jsx
import React from "react";
import AppRouter from "./router";
import { AuthProvider } from "./providers/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
