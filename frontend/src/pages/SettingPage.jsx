import React, { useState, useEffect } from "react";
import { Bell, Lock, MessageSquare, Loader2, Save, X, Shield, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const SettingPage = () => {
  const { authUser, updateProfile, isUpdatingProfile, updatePassword, isUpdatingPassword } = useAuthStore();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (authUser?.settings?.notifications !== undefined) {
      setNotificationsEnabled(authUser.settings.notifications);
    }
  }, [authUser]);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;
    if(currentPassword === newPassword){
      toast.error("New password must be different from current password");
      return false;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All password fields are required");
      return false;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return false;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return false;
    }
    return true;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error) {
      console.error("Password update failed:", error);
    }
  };

  const handleNotificationToggle = async () => {
    const newSetting = !notificationsEnabled;
    setNotificationsEnabled(newSetting);

    try {
      await updateProfile({ 
        settings: { 
          ...authUser?.settings,
          notifications: newSetting 
        } 
      });
    } catch (error) {
      setNotificationsEnabled(!newSetting);
      console.error("Failed to update notification settings:", error);
    }
  };
  
  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const isPasswordFormDirty = passwordData.currentPassword || passwordData.newPassword || passwordData.confirmNewPassword;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="size-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Manage your application settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-700">
              <Lock className="size-5 text-blue-600" />
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Current Password</span>
                </label>
                <div className="flex border border-gray-300 p-3 rounded-md items-center bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    className="outline-none bg-transparent w-full text-gray-800"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isUpdatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    disabled={isUpdatingPassword}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">New Password</span>
                </label>
                <div className="flex border border-gray-300 p-3 rounded-md items-center bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    className="outline-none bg-transparent w-full text-gray-800"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isUpdatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    disabled={isUpdatingPassword}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Confirm New Password</span>
                </label>
                <div className="flex border border-gray-300 p-3 rounded-md items-center bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmNewPassword"
                    className="outline-none bg-transparent w-full text-gray-800"
                    placeholder="Confirm new password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordInputChange}
                    disabled={isUpdatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    disabled={isUpdatingPassword}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {isPasswordFormDirty && (
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={resetPasswordForm}
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors min-w-[150px] justify-center"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-700">
              <Bell className="size-5 text-blue-600" />
              Notification Settings
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-700">Enable Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications for new messages and updates.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationsEnabled}
                    onChange={handleNotificationToggle}
                    disabled={isUpdatingProfile}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-700">
              <Shield className="size-5 text-blue-600" />
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Account Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-800">
                  {authUser?.createdAt 
                    ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Not available"
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">User ID</span>
                <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {authUser?._id ? `${authUser._id.slice(0, 8)}...` : "Not available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;