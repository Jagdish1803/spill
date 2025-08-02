import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth_routes.js";
import messageRoutes from "./routes/message_route.js";
import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST"]
  },
});

// Store io instance in app for access in controllers
app.set("io", io);

const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});