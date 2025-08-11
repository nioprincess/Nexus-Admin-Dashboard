// components/Navbar.tsx
import { FiMenu } from 'react-icons/fi';
import Link from 'next/link';

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="sm:hidden text-gray-500"
          >
            <FiMenu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Welcome Admin!!</h2><br></br>
          <p>Here's your dashboard overview</p>
        </div>

        {/* profile picture and name */}
        <Link href="/profile"><div className="flex items-center space-x-2">
          <img src="/profile_pic.webp" alt="Profile Picture" className="w-8 h-8 rounded-full" />
          <span className="text-gray-800">Admin Name</span>
        </div>
        </Link>
        
        {/* User profile and other nav items */}
      </div>
    </header>
  );
}