// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./index.css";

// ===============================
// PWA (DESACTIVADO POR AHORA)
// ===============================

// Registro del Service Worker (PWA)
// import { registerSW } from "virtual:pwa-register";

// Esto registra y auto-actualiza el service worker
// registerSW({
//   immediate: true,       // activa inmediatamente
//   onNeedRefresh() {
//     console.log("Nueva versión disponible");
//   },
//   onOfflineReady() {
//     console.log("La app está lista para funcionar offline");
//   },
// });

// Render principal
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
