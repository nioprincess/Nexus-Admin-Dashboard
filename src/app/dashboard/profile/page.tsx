import React from 'react';
import { FiEdit, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blueColor px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          </div>
          
          {/* Profile Content */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <img 
                  src="/profile_pic.webp" 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Change Photo</span>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start">
                  <FiUser className="mt-1 mr-3 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-lg font-semibold text-gray-800">Ishimwe Alice</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMail className="mt-1 mr-3 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-lg font-semibold text-gray-800">ishimwe.alice@example.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiPhone className="mt-1 mr-3 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="text-lg font-semibold text-gray-800">+250 788 123 456</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMapPin className="mt-1 mr-3 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-lg font-semibold text-gray-800">Kigali, Rwanda</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
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