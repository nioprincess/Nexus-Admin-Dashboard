// components/Navbar.tsx
import { FiMenu, FiX, FiBell, FiHelpCircle } from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({
  toggleSidebar,
  isSidebarOpen,
}: {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "normal_users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Fallback to auth data if Firestore doc doesn't exist
            setUserData({
              name: user.displayName || "User",
              profilePicture: user.photoURL || "/profile_pic.webp",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to auth data
          setUserData({
            name: user.displayName || "User",
            profilePicture: user.photoURL || "/profile_pic.webp",
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                Welcome {userData?.name || "User"}!
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
            {!loading && (
              <Link
                href="/dashboard/profile"
                className="flex items-center space-x-2 group"
              >
                <div className="relative">
                  <img
                    src={userData?.profilePicture || "/profile_pic.webp"}
                    alt="Profile"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/profile_pic.webp";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {userData?.name || "User"}
                </span>
              </Link>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="hidden sm:block">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile title - only shown on small screens */}
        <div className="lg:hidden mt-2 pl-11">
          <h2 className="text-sm font-semibold text-gray-800">
            Welcome {userData?.name || "User"}!
          </h2>
          <p className="text-xs text-gray-500">
            Here's your dashboard overview
          </p>
        </div>
      </div>
    </header>
  );
}
