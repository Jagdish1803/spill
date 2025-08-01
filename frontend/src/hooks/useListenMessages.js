import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useAuthStore();
  const { messages, setMessages } = useChatStore();

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        const sound = new Audio(notificationSound);
        sound.play();
        setMessages([...messages, newMessage]);
      });

      return () => socket.off("newMessage");
    }
  }, [socket, setMessages, messages]);
};

export default useListenMessages;