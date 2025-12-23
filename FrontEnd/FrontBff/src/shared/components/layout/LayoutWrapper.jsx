import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutWrapper() {
  return (
    <div className="app-with-sidebar">
      <Sidebar />

      <div className="main-content-with-sidebar">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
