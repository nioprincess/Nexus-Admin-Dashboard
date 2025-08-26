// components/Navbar.tsx
import { FiMenu, FiX, FiBell, FiHelpCircle } from "react-icons/fi";
import Link from "next/link";

export default function Navbar({
  toggleSidebar,
  isSidebarOpen,
}: {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Mobile menu button and title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>

            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-800">
                Welcome Admin!!
              </h2>
              <p className="text-xs text-gray-500">
                Here's your dashboard overview
              </p>
            </div>
          </div>

          {/* Right section - Navigation items */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Notification and help icons */}
            <button className="hidden sm:block p-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
              <FiBell size={20} />
              <span className="sr-only">Notifications</span>
            </button>

            <button className="hidden sm:block p-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
              <FiHelpCircle size={20} />
              <span className="sr-only">Help</span>
            </button>

            {/* Profile section */}
            <Link
              href="/super_admin/profile"
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <img
                  src="/profile_pic.webp"
                  alt="Profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                Admin Name
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile title - only shown on small screens */}
        <div className="lg:hidden mt-2 pl-11">
          <h2 className="text-sm font-semibold text-gray-800">
            Welcome Admin!!
          </h2>
          <p className="text-xs text-gray-500">
            Here's your dashboard overview
          </p>
        </div>
      </div>
    </header>
  );
}
