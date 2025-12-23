import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // o spinner
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
