"use client";
import {
  FiEdit,
  FiTrash2,
  FiUser,
  FiPlus,
  FiX,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { useState } from "react";

interface User {
  id: string;
  image: string;
  name: string;
  phone: string;
  email: string;
  role: "super-admin" | "admin" | "content-manager" | "user";
  lastLogin: string;
  password?: string; // Only for new user creation
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      image: "",
      name: "Super Admin",
      phone: "+250 788 000 001",
      email: "superadmin@example.com",
      role: "super-admin",
      lastLogin: "2025-08-25 09:30",
    },
    {
      id: "2",
      image: "",
      name: "Admin User",
      phone: "+250 788 123 456",
      email: "admin@example.com",
      role: "admin",
      lastLogin: "2025-08-20 10:30",
    },
    {
      id: "3",
      image: "",
      name: "Content Manager",
      phone: "+250 788 654 321",
      email: "content@example.com",
      role: "content-manager",
      lastLogin: "2025-08-19 14:15",
    },
    {
      id: "4",
      image: "",
      name: "Regular User",
      phone: "+250 788 111 222",
      email: "user@example.com",
      role: "user",
      lastLogin: "2025-08-18 09:45",
    },
  ]);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<
    Omit<User, "id" | "lastLogin"> & { password: string }
  >({
    name: "",
    email: "",
    phone: "",
    role: "user",
    image: "",
    password: "",
  });
  const [activeRoleFilter, setActiveRoleFilter] = useState<
    "all" | User["role"]
  >("all");

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUserWithId: User = {
      ...newUser,
      id: (users.length + 1).toString(),
      lastLogin:
        new Date().toISOString().split("T")[0] +
        " " +
        new Date().toTimeString().split(" ")[0].substring(0, 5),
    };
    setUsers([...users, newUserWithId]);
    setIsAddUserModalOpen(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "user",
      image: "",
      password: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const filteredUsers =
    activeRoleFilter === "all"
      ? users
      : users.filter((user) => user.role === activeRoleFilter);

  const currentUserRole = "super-admin"; // This would come from auth context in a real app

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add New User</h2>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-3 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currentUserRole === "super-admin" && (
                      <option value="admin">Admin</option>
                    )}
                    <option value="content-manager">Content Manager</option>
                    <option value="user">Regular User</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="password"
                  >
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="mr-3 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className=" px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">Manage Users</h1>
              {currentUserRole === "super-admin" && (
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-500"
                >
                  <FiPlus className="mr-2" />
                  Add New User
                </button>
              )}
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveRoleFilter("all")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeRoleFilter === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setActiveRoleFilter("admin")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeRoleFilter === "admin"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Admins
              </button>
              <button
                onClick={() => setActiveRoleFilter("user")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeRoleFilter === "user"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Regular Users
              </button>
            </nav>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.image}
                                alt=""
                              />
                            ) : (
                              <FiUser className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "super-admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "content-manager"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {currentUserRole === "super-admin" &&
                            user.role !== "super-admin" && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredUsers.length}</span> of{" "}
                  <span className="font-medium">{filteredUsers.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    Previous
                  </button>
                  <button
                    aria-current="page"
                    className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </button>
                  <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
