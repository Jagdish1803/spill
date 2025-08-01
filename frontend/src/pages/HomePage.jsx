import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-gray-50 pt-16">
      <div className="flex h-full max-w-7xl mx-auto bg-white shadow-sm">
        <Sidebar />
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;