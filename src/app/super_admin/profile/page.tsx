"use client";
import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
  FiCamera,
} from "react-icons/fi";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Bytes,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "", // base64 or url
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch logged-in user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const refDoc = doc(db, "normal_users", user.uid);
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const userData = snap.data();
          setFormData(userData);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Convert selected file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          profilePicturePreview: reader.result, // temporary preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile in Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setUploading(true);
    try {
      let profilePictureData = formData.profilePicture;

      // If new picture is selected, convert it to base64
      if (profileImageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          profilePictureData = reader.result as string;

          if (profilePictureData.length > Math.pow(2, 20)) {
            alert("File size exceeds 1MB");
            setUploading(false);
            return;
          }

          const updateData = {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            profilePicture: profilePictureData, // save base64 string
            updatedAt: serverTimestamp(),
          };

          const userRef = doc(db, "normal_users", uid);
          await updateDoc(userRef, updateData);

          setFormData((prev: any) => ({
            ...prev,
            ...updateData,
            profilePicturePreview: undefined,
          }));

          setProfileImageFile(null);
          setIsEditModalOpen(false);
          setUploading(false);
          alert("Profile updated successfully!");
        };
        reader.readAsDataURL(profileImageFile);
      } else {
        // If no new picture, just update other fields
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          profilePicture: profilePictureData,
          updatedAt: serverTimestamp(),
        };

        const userRef = doc(db, "normal_users", uid);
        await updateDoc(userRef, updateData);

        setFormData((prev: any) => ({
          ...prev,
          ...updateData,
        }));

        setIsEditModalOpen(false);
        setUploading(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-gray-200"
                disabled={uploading}
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Profile Picture Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Profile Picture
                </label>
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <img
                      src={
                        formData.profilePicturePreview ||
                        formData.profilePicture ||
                        "/profile_pic.webp"
                      }
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border border-gray-300"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer"
                    >
                      <FiCamera className="text-white" size={14} />
                    </label>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-sm text-gray-600">
                      {profileImageFile
                        ? profileImageFile.name
                        : "Click camera icon to change"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mr-3 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Page Content */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          </div>

          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={formData.profilePicture || "/profile_pic.webp"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Full Name
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData.name || "Not set"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData.email}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData.phone || "Not set"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData.address || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
