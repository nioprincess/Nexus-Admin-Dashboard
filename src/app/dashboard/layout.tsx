// app/dashboard/layout.tsx
"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar1";
import Navbar from "@/components/Navbar";
import RouteGuard from "@/components/RouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <RouteGuard requiredRole="admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar with mobile menu button */}
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
