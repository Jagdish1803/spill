import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { User, Phone, Video, MoreHorizontal } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const isOnline = onlineUsers.includes(selectedUser?._id);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Separate effect for socket subscription
  useEffect(() => {
    if (selectedUser?._id && socket) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id, socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-full"></div>
            <div>
              <div className="skeleton h-4 w-32 mb-1"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
        </div>
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullname}
              className="w-10 h-10 object-cover rounded-full border-2 border-gray-200"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.fullname}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-8 h-8 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col max-w-xs ${
                message.senderId === authUser._id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p className="text-sm">{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;