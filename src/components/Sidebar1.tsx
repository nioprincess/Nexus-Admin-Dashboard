// components/Sidebar.tsx
import Link from 'next/link';
import { FiBook, FiUsers, FiMessageSquare, FiUpload, FiBarChart2, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed sm:relative
        w-64 h-full
        bg-greyColor shadow-md
        transform transition-transform duration-200 ease-in-out
        z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        <nav className="text-black text-base font-semibold h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Nexus Admin</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            <Link href="/dashboard" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiBarChart2 className="mr-3" /> Dashboard
            </Link>
            <Link href="/dashboard/lessons" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiBook className="mr-3" /> Manage Lessons
            </Link>
            <Link href="/dashboard/feedback" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiMessageSquare className="mr-3" /> Users Feedback
            </Link>
            <Link href="/dashboard/notifications" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiUpload className="mr-3" /> Push Updates
            </Link>
            <Link href="/dashboard/user_performance" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiBarChart2 className="mr-3" /> User Performance
            </Link>
            {/* <Link href="/dashboard/manage-users" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiUsers className="mr-3" /> Manage Users
            </Link> */}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Link href="/logout" className="flex items-center p-4 hover:bg-greenColor" onClick={onClose}>
              <FiLogOut className="mr-3" /> Logout
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;