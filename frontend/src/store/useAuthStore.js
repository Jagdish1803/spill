import { create } from "zustand";
import { axiosInstance } from "../lib/axios.jsx";
import toast from "react-hot-toast";
import { socketManager } from "../lib/socket.js";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isUpdatingPassword: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Failed to logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updatePassword: async (data) => {
    set({ isUpdatingPassword: true });
    try {
      await axiosInstance.put("/auth/update-password", data);
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error in updatePassword:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
      throw error;
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("jwt="))
      ?.split("=")[1];

    if (token) {
      const socket = socketManager.connect(token);
      set({ socket });

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    }
  },

  disconnectSocket: () => {
    socketManager.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));