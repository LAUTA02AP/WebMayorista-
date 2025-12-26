// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginPage from "./features/auth/LoginPage";
import HomePage from "./features/cliente/pages/HomePage";

import ProtectedRoute from "./app/router/ProtectedRoute";
import Sidebar from "./shared/components/layout/Sidebar";
import Header from "./shared/components/layout/Header";

function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === "/";

  const routes = (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (isLogin) return <div className="page-without-sidebar">{routes}</div>;

  return (
    <div className="app-with-sidebar">
      <Sidebar />
      <div className="main-content-with-sidebar">
        <Header />
        {routes}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
