import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.fullname} (${socket.userId})`);
    
    // Add user to online users map
    userSocketMap.set(socket.userId, socket.id);
    
    // Broadcast updated online users list to all clients
    io.emit("getOnlineUsers", getOnlineUsers());
    
    // Notify all users about this user coming online
    socket.broadcast.emit("userStatusChange", {
      userId: socket.userId,
      status: "online",
      user: {
        _id: socket.userId,
        fullname: socket.user.fullname,
        profilePic: socket.user.profilePic
      }
    });

    // Handle user explicitly setting online status
    socket.on("user_online", (userId) => {
      console.log(`👤 User ${userId} is explicitly online`);
      userSocketMap.set(userId, socket.id);
      io.emit("getOnlineUsers", getOnlineUsers());
    });

    // Handle user explicitly setting offline status
    socket.on("user_offline", (userId) => {
      console.log(`👤 User ${userId} is explicitly offline`);
      userSocketMap.delete(userId);
      io.emit("getOnlineUsers", getOnlineUsers());
      socket.broadcast.emit("userStatusChange", {
        userId: userId,
        status: "offline"
      });
    });

    // Handle typing indicators (optional - for future use)
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          senderId: socket.userId,
          isTyping: isTyping
        });
      }
    });

    // Handle message delivery confirmation
    socket.on("messageDelivered", ({ messageId, receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageStatus", {
          messageId: messageId,
          status: "delivered"
        });
      }
    });

    // Handle message read confirmation
    socket.on("messageRead", ({ messageId, senderId }) => {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatus", {
          messageId: messageId,
          status: "read"
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.user.fullname} (${socket.userId}) - Reason: ${reason}`);
      
      // Remove user from online users map
      userSocketMap.delete(socket.userId);
      
      // Broadcast updated online users list
      io.emit("getOnlineUsers", getOnlineUsers());
      
      // Notify all users about this user going offline
      socket.broadcast.emit("userStatusChange", {
        userId: socket.userId,
        status: "offline"
      });
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error(`🔴 Socket error for user ${socket.userId}:`, error);
    });

    // Send initial online users list to the newly connected user
    socket.emit("getOnlineUsers", getOnlineUsers());
  });

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down, disconnecting all sockets...');
    io.emit("serverShutdown", "Server is shutting down");
    io.close();
  });
};