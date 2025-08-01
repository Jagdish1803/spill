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
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    userSocketMap.set(socket.userId, socket.id);
    
    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSocketMap.delete(socket.userId);
      io.emit("getOnlineUsers", getOnlineUsers());
    });
  });
};