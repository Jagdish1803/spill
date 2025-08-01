import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gray-50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900">Welcome to Spill</h3>
          <p className="text-gray-500">
            Select a conversation from the sidebar to start chatting with your friends and colleagues.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;