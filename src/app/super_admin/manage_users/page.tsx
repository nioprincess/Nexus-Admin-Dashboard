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
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { FormEvent, useEffect } from "react";

import { useState } from "react";
import { create } from "domain";
import * as admin from "firebase-admin";
import deleteUser from "@/lib/firebase/deleteUser";

interface User {
  uid: string;
  name: string;
  phone: string;
  email: string;
  role: "super-admin" | "admin" | "content-manager" | "user";
  lastLogin: string;
  password?: string; // Only for new user creation
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<
    Omit<User, "uid" | "lastLogin"> & { password: string }
  >({
    name: "",
    email: "",
    phone: "",
    role: "admin",
    profilePicture: "",
    password: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [activeRoleFilter, setActiveRoleFilter] = useState<
    "all" | User["role"]
  >("all");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      const userId = userCredential.user.uid;

      await setDoc(doc(db, "normal_users", userId), {
        uid: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role || "admin",
        lastLogin: new Date().toISOString(),
        profilePicture: newUser.profilePicture || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setUsers([
        ...users,
        {
          uid: userCredential.user.uid,
          ...newUser,
          lastLogin: new Date().toISOString(),
        },
      ]);

      // Reset form data and close modal
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "admin",
        profilePicture: "",
        password: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsAddUserModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  //fetching users from firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(db, "normal_users");
      const userSnapShot = await getDocs(userCollection);
      const userList = userSnapShot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  // const handleDelete = async (userId: string) => {
  //   try {

  //     await deleteDoc(doc(db, "normal_users", userId));

  //     setUsers(users.filter((user) => user.uid !== userId));
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //   }
  // };

  const handleDelete = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingUserId(uid);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "normal_users", uid));

      // Delete from Firebase Auth via API route
      await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid }),
      });

      // Update local state so UI refreshes immediately
      setUsers(users.filter((user) => user.uid !== uid));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeletingUserId(null);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form when modal opens/closes
  const handleModalToggle = (open: boolean) => {
    setIsAddUserModalOpen(open);
    if (!open) {
      // Reset form when closing modal
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "admin",
        profilePicture: "",
        password: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
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
                  onClick={() => handleModalToggle(false)}
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
                    onClick={() => handleModalToggle(false)}
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
                  onClick={() => handleModalToggle(true)}
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
          {/* displaying user data from firestore */}

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
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th> */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.profilePicture}
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
                            ? user.role
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")
                            : "User"}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {currentUserRole === "super-admin" &&
                            user.role !== "super-admin" && (
                              <button
                                onClick={() => handleDelete(user.uid)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                {deletingUserId === user.uid ? (
                                  <span className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full inline-block"></span>
                                ) : (
                                  <FiTrash2 className="h-5 w-5" />
                                )}
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
