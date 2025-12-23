import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute.jsx";
import LayoutWrapper from "../../shared/components/layout/LayoutWrapper.jsx";

import LoginPage from "../../features/auth/LoginPage.jsx";
import HomePage from "../../features/cliente/pages/HomePage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
