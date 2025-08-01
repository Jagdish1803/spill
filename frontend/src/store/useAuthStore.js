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
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("jwt="))
      ?.split("=")[1];

    if (token) {
      try {
        const newSocket = socketManager.connect(token);
        set({ socket: newSocket });

        newSocket.on("connect", () => {
          console.log("✅ Socket connected successfully");
          // Emit user online status
          newSocket.emit("user_online", authUser._id);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
          console.log("👥 Online users updated:", userIds);
          set({ onlineUsers: userIds });
        });

        // Listen for user status changes
        newSocket.on("userStatusChange", ({ userId, status }) => {
          const { onlineUsers } = get();
          if (status === "online" && !onlineUsers.includes(userId)) {
            set({ onlineUsers: [...onlineUsers, userId] });
          } else if (status === "offline") {
            set({ onlineUsers: onlineUsers.filter(id => id !== userId) });
          }
        });

        newSocket.on("disconnect", (reason) => {
          console.log("❌ Socket disconnected:", reason);
        });

        newSocket.on("connect_error", (error) => {
          console.error("🔴 Socket connection error:", error);
        });

        // Handle reconnection
        newSocket.on("reconnect", () => {
          console.log("🔄 Socket reconnected");
          newSocket.emit("user_online", authUser._id);
        });

        // Handle connection issues
        newSocket.on("reconnect_error", (error) => {
          console.error("🔴 Socket reconnection error:", error);
        });

        newSocket.on("reconnect_failed", () => {
          console.error("💀 Socket reconnection failed");
          toast.error("Connection lost. Please refresh the page.");
        });

      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    }
  },

  disconnectSocket: () => {
    const { socket, authUser } = get();
    if (socket) {
      // Emit user offline status before disconnecting
      if (authUser) {
        socket.emit("user_offline", authUser._id);
      }
      
      // Remove all listeners
      socket.off("connect");
      socket.off("getOnlineUsers");
      socket.off("userStatusChange");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
      socket.off("newMessage");
    }
    socketManager.disconnect();
    set({ socket: null, onlineUsers: [] });
  },

  // Force reconnect socket (useful for troubleshooting)
  reconnectSocket: () => {
    get().disconnectSocket();
    setTimeout(() => {
      get().connectSocket();
    }, 1000);
  },
}));