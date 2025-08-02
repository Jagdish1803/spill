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
  unreadMessages: {},
  lastMessages: {},
  typingUsers: {},

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
      
      // Immediately add to current conversation for instant feedback
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
    if (!socket) {
      console.log("❌ No socket available for subscribing to messages");
      return;
    }

    console.log("🔊 Subscribing to socket messages...");

    // Remove existing listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("userTyping");

    socket.on("newMessage", (newMessage) => {
      console.log("📨 New message received via socket:", newMessage);
      
      const { selectedUser, messages, users } = get();
      const authUser = useAuthStore.getState().authUser;
      
      // Don't add our own messages (already added in sendMessage)
      if (newMessage.senderId === authUser?._id) {
        console.log("⏭️ Skipping own message");
        return;
      }
      
      // Update last message for sidebar
      get().updateLastMessage(newMessage.senderId, newMessage);
      
      // If this message is for the currently selected conversation
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        console.log("💬 Adding message to current conversation");
        set({ messages: [...messages, newMessage] });
      } else {
        console.log("📱 Message for different conversation, showing notification");
        // Message is for a different conversation - increment unread count
        const { unreadMessages } = get();
        const senderId = newMessage.senderId;
        set({
          unreadMessages: {
            ...unreadMessages,
            [senderId]: (unreadMessages[senderId] || 0) + 1
          }
        });
        
        // Show notification
        const sender = users.find(user => user._id === newMessage.senderId);
        const senderName = sender?.fullname || "Someone";
        toast.success(`${senderName}: ${newMessage.text || "📷 Image"}`, {
          duration: 3000,
          icon: '💬',
          style: {
            background: '#3b82f6',
            color: 'white',
          },
        });
      }
    });

    socket.on("userTyping", ({ senderId, isTyping }) => {
      console.log(`⌨️ User typing event: ${senderId} is ${isTyping ? 'typing' : 'stopped typing'}`);
      const { typingUsers } = get();
      set({
        typingUsers: {
          ...typingUsers,
          [senderId]: isTyping
        }
      });
      
      if (isTyping) {
        setTimeout(() => {
          const currentTyping = get().typingUsers;
          if (currentTyping[senderId]) {
            set({
              typingUsers: {
                ...currentTyping,
                [senderId]: false
              }
            });
          }
        }, 3000);
      }
    });

    console.log("✅ Socket message listeners setup complete");
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("userTyping");
    }
  },

  setSelectedUser: (selectedUser) => {
    const { unreadMessages } = get();
    
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

  getUnreadCount: (userId) => {
    const { unreadMessages } = get();
    return unreadMessages[userId] || 0;
  },

  getLastMessage: (userId) => {
    const { lastMessages } = get();
    return lastMessages[userId] || null;
  },

  sendTypingIndicator: (receiverId, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("typing", { receiverId, isTyping });
    }
  },

  initializeSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    console.log("🚀 Initializing socket listeners, socket available:", !!socket);
    if (socket) {
      get().subscribeToMessages();
    }
  },
}));