
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BsBell, 
  BsGear, 
  BsBoxArrowRight,
  BsPeople,
  BsQuestionCircle
} from 'react-icons/bs';

export function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { profile, signOut } = useAuth();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - User Profile & Navigation */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-4 space-y-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-gray-700 text-white">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex flex-col space-y-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <BsPeople className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <BsBell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <BsQuestionCircle className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <BsGear className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white"
            onClick={signOut}
          >
            <BsBoxArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar 
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
      />

      {/* Chat Area */}
      {selectedChatId ? (
        <ChatArea chatId={selectedChatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsPeople className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Chat</h3>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
