import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Calendar, Shield, LogOut, Loader2, MessageSquare, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      setShowUpdateButton(true);
    };
  };

  const handleUpdateProfile = async () => {
    if (!selectedImg) {
      toast.error("No image selected");
      return;
    }

    try {
      await updateProfile({ profilePic: selectedImg });
      setShowUpdateButton(false);
      setSelectedImg(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancelUpdate = () => {
    setSelectedImg(null);
    setShowUpdateButton(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="size-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-gray-600">Your profile information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition-colors ${
                      isUpdatingProfile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Click the camera icon to update your photo
                </p>

                {showUpdateButton && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      {isUpdatingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isUpdatingProfile ? "Updating..." : "Save Photo"}
                    </button>
                    
                    <button
                      onClick={handleCancelUpdate}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="size-5 text-blue-600" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="flex border p-3 rounded-md items-center bg-gray-50">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      className="outline-none bg-transparent w-full"
                      value={authUser?.fullname || "Not provided"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <div className="flex border p-3 rounded-md items-center bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="email"
                      className="outline-none bg-transparent w-full"
                      value={authUser?.email || "Not provided"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="size-4 text-gray-400" />
                    {authUser?.createdAt 
                      ? new Date(authUser.createdAt).toLocaleDateString()
                      : "Not available"
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-mono text-sm text-gray-500">
                    {authUser?._id || "Not available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6">Actions</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="size-5" />
                  Logout from Account
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  You will be redirected to the login page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;