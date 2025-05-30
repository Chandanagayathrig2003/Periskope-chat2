
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Chat, ChatMember, Profile, ChatLabel } from '@/types/database';
import { 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  CheckCircle,
  Circle,
  Archive,
  Star,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreateGroupDialog } from './CreateGroupDialog';

interface ChatWithDetails extends Chat {
  members: (ChatMember & { profile: Profile })[];
  labels: ChatLabel[];
  lastMessage?: any;
  unreadCount: number;
}

interface ChatSidebarProps {
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

// Sample chat data matching the reference image
const sampleChats: ChatWithDetails[] = [
  {
    id: 'chat-1',
    name: 'Test Skope Final 5',
    description: 'Support2: This doesn\'t go on Tuesday...',
    chat_type: 'group',
    avatar_url: null,
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    members: [],
    labels: [
      { id: 'label-1', chat_id: 'chat-1', label: 'demo', created_at: new Date().toISOString() }
    ],
    unreadCount: 0
  },
  {
    id: 'chat-2', 
    name: 'Periskope Team Chat',
    description: 'Periskope: Test message',
    chat_type: 'group',
    avatar_url: null,
    created_by: 'user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    members: [],
    labels: [
      { id: 'label-2', chat_id: 'chat-2', label: 'demo', created_at: new Date().toISOString() },
      { id: 'label-3', chat_id: 'chat-2', label: 'internal', created_at: new Date().toISOString() }
    ],
    unreadCount: 1
  },
  {
    id: 'chat-3',
    name: '+91 99999 99999',
    description: 'Hi there, I\'m Swapnika, Co-Founder of...',
    chat_type: 'direct',
    avatar_url: null,
    created_by: 'user-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    members: [],
    labels: [
      { id: 'label-4', chat_id: 'chat-3', label: 'demo', created_at: new Date().toISOString() },
      { id: 'label-5', chat_id: 'chat-3', label: 'signup', created_at: new Date().toISOString() }
    ],
    unreadCount: 0
  },
  {
    id: 'chat-4',
    name: 'Test Demo17',
    description: 'Rohesanj: 123',
    chat_type: 'group',
    avatar_url: null,
    created_by: 'user-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    members: [],
    labels: [
      { id: 'label-6', chat_id: 'chat-4', label: 'content', created_at: new Date().toISOString() },
      { id: 'label-7', chat_id: 'chat-4', label: 'demo', created_at: new Date().toISOString() }
    ],
    unreadCount: 0
  },
  {
    id: 'chat-5',
    name: 'Test El Centro',
    description: 'Roeshag: Hello, Ahmadport!',
    chat_type: 'direct',
    avatar_url: null,
    created_by: 'user-5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    members: [],
    labels: [
      { id: 'label-8', chat_id: 'chat-5', label: 'demo', created_at: new Date().toISOString() }
    ],
    unreadCount: 0
  },
  {
    id: 'chat-6',
    name: 'Testing group',
    description: 'Testing 12345',
    chat_type: 'group',
    avatar_url: null,
    created_by: 'user-6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    members: [],
    labels: [
      { id: 'label-9', chat_id: 'chat-6', label: 'demo', created_at: new Date().toISOString() }
    ],
    unreadCount: 0
  }
];

export function ChatSidebar({ selectedChatId, onChatSelect }: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatWithDetails[]>(sampleChats);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { profile } = useAuth();

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    return matchesSearch && chat.labels.some(l => l.label === selectedFilter);
  });

  const getChatDisplayName = (chat: ChatWithDetails) => {
    return chat.name || 'Unknown Chat';
  };

  const getChatAvatar = (chat: ChatWithDetails) => {
    return chat.avatar_url;
  };

  const getLabelColor = (label: string) => {
    const colors = {
      demo: 'bg-blue-50 text-blue-600 border border-blue-200',
      internal: 'bg-green-50 text-green-600 border border-green-200',
      content: 'bg-purple-50 text-purple-600 border border-purple-200',
      signup: 'bg-orange-50 text-orange-600 border border-orange-200',
      dont_send: 'bg-red-50 text-red-600 border border-red-200',
    };
    return colors[label as keyof typeof colors] || 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffInDays}d`;
    }
  };

  const handleCreateGroup = (groupData: { name: string; description: string; members: string[] }) => {
    const newGroup: ChatWithDetails = {
      id: `chat-${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      chat_type: 'group',
      avatar_url: null,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      members: [],
      labels: [
        { id: `label-${Date.now()}`, chat_id: `chat-${Date.now()}`, label: 'demo', created_at: new Date().toISOString() }
      ],
      unreadCount: 0
    };

    setChats(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full mt-12">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          {/* Filter Buttons Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white text-xs h-7 px-3"
              >
                🔧 Custom filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-3 border-gray-300"
              >
                Save
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setShowCreateGroup(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-gray-50 border-gray-200"
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
            )}
          </div>
          
          {/* Filter Tags */}
          <div className="flex items-center space-x-1 flex-wrap">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className="text-xs h-6 px-2"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'demo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('demo')}
              className="text-xs h-6 px-2"
            >
              Demo
            </Button>
            <Button
              variant={selectedFilter === 'internal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('internal')}
              className="text-xs h-6 px-2"
            >
              Internal
            </Button>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Start a conversation to see it here
              </p>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Chat
              </Button>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getChatAvatar(chat)} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                        {getChatDisplayName(chat).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                    {chat.chat_type === 'group' && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        👥
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getChatDisplayName(chat)}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(chat.last_message_at)}
                        </span>
                        <Phone className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-1 flex-wrap">
                      {chat.labels.slice(0, 3).map((label) => (
                        <Badge
                          key={label.id}
                          variant="secondary"
                          className={`text-xs px-2 py-0 ${getLabelColor(label.label)} rounded-full`}
                        >
                          {label.label}
                        </Badge>
                      ))}
                      {chat.labels.length > 3 && (
                        <span className="text-xs text-gray-400">+{chat.labels.length - 3}</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {chat.description || 'No recent messages'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    <Star className="w-3 h-3 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                    <Archive className="w-3 h-3 text-gray-300 hover:text-blue-400 cursor-pointer" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateGroupDialog
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />
    </>
  );
}
