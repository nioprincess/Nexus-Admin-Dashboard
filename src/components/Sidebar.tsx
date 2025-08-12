// components/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBook, FiUsers, FiMessageSquare, FiUpload, FiBarChart2, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ isSidebarOpen, onClose }: { isSidebarOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();

  // Helper function to check active state
  const isActive = (href: string) => {
    if (href === '/super_admin') return pathname === href;
    return pathname.startsWith(href);
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
      <div className={`
        fixed sm:relative
        w-64 h-full
        bg-greyColor shadow-lg
        transform transition-transform duration-200 ease-in-out
        z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        <nav className="h-full flex flex-col border-r border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Nexus Admin</h1>
          </div>
          
          {/* Menu items */}
          <div className="flex-1 font-bold overflow-y-auto py-2">
            <Link 
              href="/super_admin" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiBarChart2 className="mr-3" /> Dashboard
            </Link>
            
            <Link 
              href="/super_admin/lessons" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin/lessons')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiBook className="mr-3" /> Manage Lessons
            </Link>
            
            <Link 
              href="/super_admin/feedback" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin/feedback')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiMessageSquare className="mr-3" /> Users Feedback
            </Link>
            
            <Link 
              href="/super_admin/notifications" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin/notifications')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiUpload className="mr-3" /> Push Updates
            </Link>
            
            <Link 
              href="/super_admin/user_performance" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin/user_performance')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiBarChart2 className="mr-3" /> User Performance
            </Link>
            
            <Link 
              href="/super_admin/manage_users" 
              className={`flex items-center p-4 transition-colors ${
                isActive('/super_admin/manage_users')
                  ? 'bg-greenColor text-black font-medium'
                  : 'text-gray-700 hover:bg-greenColor/20'
              }`}
              onClick={onClose}
            >
              <FiUsers className="mr-3" /> Manage Users
            </Link>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link 
              href="/logout" 
              className="flex items-center p-4 text-gray-700 hover:bg-greenColor/20 transition-colors"
              onClick={onClose}
            >
              <FiLogOut className="mr-3" /> Logout
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;