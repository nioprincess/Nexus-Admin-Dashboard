// 📍 src/components/DashboardLayout.tsx

"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block fixed md:relative z-20 w-64 bg-gray-800 text-white min-h-screen`}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white shadow flex items-center justify-between p-4 md:px-6">
          {/* Hamburger menu */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Navbar />
        </header>

        {/* Main */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto p-4 text-sm text-center text-gray-500">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
