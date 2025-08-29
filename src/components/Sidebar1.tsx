// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  FiBook,
  FiUsers,
  FiMessageSquare,
  FiUpload,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({
  isSidebarOpen,
  onClose,
}: {
  isSidebarOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();

  // Helper function to check active state
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const router = useRouter();
  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/auth/login";
    } catch (error: any) {
      console.error("Sign out error" + error.message);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed sm:relative
        w-64 h-full
        bg-greyColor shadow-lg
        transform transition-transform duration-200 ease-in-out
        z-40
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }
      `}
      >
        <nav className="h-full flex flex-col border-r border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Nexus Admin</h1>
          </div>

          {/* Menu items */}
          <div className="flex-1 font-bold overflow-y-auto py-2">
            <Link
              href="/dashboard"
              className={`flex items-center p-4 transition-colors ${
                isActive("/dashboard")
                  ? "bg-greenColor text-black font-medium"
                  : "text-gray-700 hover:bg-greenColor/20"
              }`}
              onClick={onClose}
            >
              <FiBarChart2 className="mr-3" /> Dashboard
            </Link>

            <Link
              href="/dashboard/lessons"
              className={`flex items-center p-4 transition-colors ${
                isActive("/dashboard/lessons")
                  ? "bg-greenColor text-black font-medium"
                  : "text-gray-700 hover:bg-greenColor/20"
              }`}
              onClick={onClose}
            >
              <FiBook className="mr-3" /> Manage Lessons
            </Link>

            <Link
              href="/dashboard/feedback"
              className={`flex items-center p-4 transition-colors ${
                isActive("/dashboard/feedback")
                  ? "bg-greenColor text-black font-medium"
                  : "text-gray-700 hover:bg-greenColor/20"
              }`}
              onClick={onClose}
            >
              <FiMessageSquare className="mr-3" /> Users Feedback
            </Link>

            <Link
              href="/dashboard/notifications"
              className={`flex items-center p-4 transition-colors ${
                isActive("/dashboard/notifications")
                  ? "bg-greenColor text-black font-medium"
                  : "text-gray-700 hover:bg-greenColor/20"
              }`}
              onClick={onClose}
            >
              <FiUpload className="mr-3" /> Push Updates
            </Link>

            <Link
              href="/dashboard/user_performance"
              className={`flex items-center p-4 transition-colors ${
                isActive("/dashboard/user_performance")
                  ? "bg-greenColor text-black font-medium"
                  : "text-gray-700 hover:bg-greenColor/20"
              }`}
              onClick={onClose}
            >
              <FiBarChart2 className="mr-3" /> User Performance
            </Link>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              className="flex items-center p-4 text-gray-700 hover:bg-greenColor/20 transition-colors"
              onClick={logout}
            >
              <FiLogOut className="mr-3" /> Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
