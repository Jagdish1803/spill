import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io("http://localhost:5001", {
      auth: { token },
      autoConnect: false,
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();