import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.jsx";
import { useAuthStore } from "./useAuthStore.js";


export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  unreadMessages: {}, // Track unread messages per user
  lastMessages: {}, // Track last message per user for sidebar preview

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
      
      // Mark messages as read for this user
      const { unreadMessages } = get();
      if (unreadMessages[userId]) {
        set({
          unreadMessages: {
            ...unreadMessages,
            [userId]: 0
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      const newMessage = res.data;
      
      // Add message to current conversation
      set({ messages: [...messages, newMessage] });
      
      // Update last message for sidebar
      get().updateLastMessage(selectedUser._id, newMessage);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove existing listeners
    socket.off("newMessage");
    socket.off("messageReceived");
    
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, authUser } = get();
      const currentAuthUser = useAuthStore.getState().authUser;
      
      // Don't add our own messages twice
      if (newMessage.senderId === currentAuthUser?._id) {
        return;
      }
      
      // Update last message for all conversations
      get().updateLastMessage(newMessage.senderId, newMessage);
      
      // If this message is for the currently selected conversation
      if (selectedUser && 
          (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
        set({ messages: [...messages, newMessage] });
      } else {
        // Message is for a different conversation - increment unread count
        const { unreadMessages } = get();
        const senderId = newMessage.senderId;
        set({
          unreadMessages: {
            ...unreadMessages,
            [senderId]: (unreadMessages[senderId] || 0) + 1
          }
        });
        
        // Show notification with sender info
        get().showMessageNotification(newMessage);
      }
      
      // Play notification sound
      try {
        const audio = new Audio(notificationSound);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Could not play notification sound:", e));
      } catch (error) {
        console.log("Notification sound error:", error);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageReceived");
    }
  },

  setSelectedUser: (selectedUser) => {
    const { unreadMessages } = get();
    
    // Mark messages as read when selecting a user
    if (selectedUser && unreadMessages[selectedUser._id]) {
      set({
        unreadMessages: {
          ...unreadMessages,
          [selectedUser._id]: 0
        }
      });
    }
    
    set({ selectedUser });
  },

  updateLastMessage: (userId, message) => {
    const { lastMessages } = get();
    set({
      lastMessages: {
        ...lastMessages,
        [userId]: message
      }
    });
  },

  showMessageNotification: (message) => {
    const { users } = get();
    const sender = users.find(user => user._id === message.senderId);
    const senderName = sender?.fullname || "Someone";
    
    // Show toast notification
    toast.success(`${senderName}: ${message.text || "📷 Image"}`, {
      duration: 4000,
      icon: '💬',
      style: {
        background: '#3b82f6',
        color: 'white',
      },
    });
  },

  getUnreadCount: (userId) => {
    const { unreadMessages } = get();
    return unreadMessages[userId] || 0;
  },

  getLastMessage: (userId) => {
    const { lastMessages } = get();
    return lastMessages[userId] || null;
  },

  // Initialize socket listeners when store is created
  initializeSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      get().subscribeToMessages();
    }
  },
}));