import { useEffect, useRef, useState } from "react";
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
    typingUsers,
  } = useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers[selectedUser?._id];

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    if (selectedUser?._id && socket) {
      console.log("🔄 Setting up socket listeners for user:", selectedUser.fullname);
      subscribeToMessages();
    }

    return () => {
      console.log("🧹 Cleaning up socket listeners");
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
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
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
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullname}
              className="w-10 h-10 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedUser.fullname}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-start gap-3 ${
                message.senderId === authUser._id ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <img
                src={
                  message.senderId === authUser._id
                    ? authUser.profilePic || "/avatar.png"
                    : selectedUser.profilePic || "/avatar.png"
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
              
              {/* Message content */}
              <div className={`flex flex-col max-w-xs lg:max-w-md ${
                message.senderId === authUser._id ? "items-end" : "items-start"
              }`}>
                {/* Sender name and time */}
                <div className={`flex items-center gap-2 mb-1 ${
                  message.senderId === authUser._id ? "flex-row-reverse" : ""
                }`}>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {message.senderId === authUser._id ? "You" : selectedUser.fullname}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                
                {/* Message bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-full ${
                    message.senderId === authUser._id
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border dark:border-gray-600 rounded-bl-md"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.image, '_blank')}
                    />
                  )}
                  {message.text && (
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  )}
                </div>
                
                {/* Message status (for sent messages) */}
                {message.senderId === authUser._id && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">
                      ✓ Sent
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;