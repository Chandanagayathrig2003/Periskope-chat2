
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BsHouse,
  BsChatDots,
  BsDiamond,
  BsBarChart,
  BsList,
  BsMegaphone,
  BsPeople,
  BsGear,
  BsBoxArrowRight
} from 'react-icons/bs';

export function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { profile, signOut } = useAuth();

  return (
    <div className="h-screen flex bg-white">
      {/* Left Navigation Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        {/* Logo */}
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-3 flex-1">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsHouse className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-green-600 bg-green-50 hover:bg-green-100">
            <BsChatDots className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsDiamond className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsBarChart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsList className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsMegaphone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsPeople className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Bottom Icons */}
        <div className="flex flex-col space-y-3">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100">
            <BsGear className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 text-gray-600 hover:bg-gray-100"
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

      {/* Main Chat Area */}
      {selectedChatId ? (
        <ChatArea chatId={selectedChatId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BsChatDots className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Getting Started</h3>
            <p className="text-gray-600 mb-8">
              Follow the steps to connect your phone to Periskope
            </p>
            
            <div className="flex space-x-4 justify-center mb-8">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                📖 Book a demo
              </Button>
              <Button variant="outline" className="border-gray-300">
                📺 Watch Tutorial
              </Button>
            </div>
            
            <div className="text-center text-gray-600 mb-4">
              Your phone server is switched off. Please restart
            </div>
            
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              📱 Restart phone
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
