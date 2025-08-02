import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Search, Users } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";

const Sidebar = () => {
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    getUnreadCount,
    getLastMessage,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatMessageTime(timestamp);
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const truncateMessage = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (isUsersLoading) {
    return (
      <aside className="h-full w-80 lg:w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="skeleton h-8 w-full"></div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-full mb-1"></div>
                <div className="skeleton h-3 w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-80 lg:w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Contacts</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No contacts match your search." : "Start a conversation with someone new."}
            </p>
          </div>
        )}

        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const unreadCount = getUnreadCount(user._id);
          const lastMessage = getLastMessage(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative ${
                isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullname}
                  className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-medium truncate ${
                    unreadCount > 0 ? "text-gray-900" : "text-gray-800"
                  }`}>
                    {user.fullname}
                  </p>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatLastMessageTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}>
                    {lastMessage ? (
                      <>
                        {lastMessage.image && !lastMessage.text && "📷 Photo"}
                        {lastMessage.text && truncateMessage(lastMessage.text)}
                        {!lastMessage.text && !lastMessage.image && "No messages yet"}
                      </>
                    ) : (
                      isOnline ? "Online" : "Offline"
                    )}
                  </p>
                  
                  {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center ml-2">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;