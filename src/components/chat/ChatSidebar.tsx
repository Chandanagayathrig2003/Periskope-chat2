
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
  MessageCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

export function ChatSidebar({ selectedChatId, onChatSelect }: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchChats();
    }
  }, [profile]);

  const fetchChats = async () => {
    if (!profile) return;

    const { data: chatMembers } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        chats!inner(
          id,
          name,
          description,
          chat_type,
          avatar_url,
          created_by,
          created_at,
          updated_at,
          last_message_at
        )
      `)
      .eq('user_id', profile.id);

    if (chatMembers) {
      const chatIds = chatMembers.map((cm: any) => cm.chat_id);
      
      // Fetch all members for these chats
      const { data: allMembers } = await supabase
        .from('chat_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .in('chat_id', chatIds);

      // Fetch labels for these chats
      const { data: labels } = await supabase
        .from('chat_labels')
        .select('*')
        .in('chat_id', chatIds);

      const chatsWithDetails: ChatWithDetails[] = chatMembers.map((cm: any) => {
        const chat = cm.chats;
        const chatMembersWithProfiles = allMembers?.filter((m: any) => m.chat_id === chat.id) || [];
        const chatLabels = labels?.filter((l: any) => l.chat_id === chat.id) || [];
        
        return {
          ...chat,
          members: chatMembersWithProfiles,
          labels: chatLabels,
          unreadCount: Math.floor(Math.random() * 5) // Demo unread count
        };
      });

      setChats(chatsWithDetails);
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.members.some(m => m.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    
    return matchesSearch && chat.labels.some(l => l.label === selectedFilter);
  });

  const getChatDisplayName = (chat: ChatWithDetails) => {
    if (chat.name) return chat.name;
    
    const otherMember = chat.members.find(m => m.user_id !== profile?.id);
    return otherMember?.profile?.full_name || 'Unknown User';
  };

  const getChatAvatar = (chat: ChatWithDetails) => {
    if (chat.avatar_url) return chat.avatar_url;
    
    const otherMember = chat.members.find(m => m.user_id !== profile?.id);
    return otherMember?.profile?.avatar_url;
  };

  const getLabelColor = (label: string) => {
    const colors = {
      demo: 'bg-blue-100 text-blue-800',
      internal: 'bg-gray-100 text-gray-800',
      content: 'bg-green-100 text-green-800',
      signup: 'bg-yellow-100 text-yellow-800',
      dont_send: 'bg-red-100 text-red-800',
    };
    return colors[label as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <h1 className="text-lg font-medium text-gray-900">chats</h1>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-red-500 font-medium">7 days left in your trial</span>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto">
              ⚡ Upgrade Plan
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
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
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mb-3">
          <Button size="sm" variant="outline" className="text-xs h-7 px-3">
            🔄 Refresh
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-3">
            ❓ Help
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-3">
            🔴 0 / 1 phones
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-1">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
            className="text-xs h-7 px-3"
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'demo' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedFilter('demo')}
            className="text-xs h-7 px-3"
          >
            Demo
          </Button>
          <Button
            variant={selectedFilter === 'internal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedFilter('internal')}
            className="text-xs h-7 px-3"
          >
            Internal
          </Button>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Start a conversation to see it here
            </p>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              New Chat
            </Button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
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
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getChatDisplayName(chat)}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {new Date(chat.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <Phone className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-1">
                    {chat.labels.slice(0, 2).map((label) => (
                      <Badge
                        key={label.id}
                        variant="secondary"
                        className={`text-xs px-2 py-0 ${getLabelColor(label.label)}`}
                      >
                        {label.label}
                      </Badge>
                    ))}
                    {chat.labels.length > 2 && (
                      <span className="text-xs text-gray-400">+{chat.labels.length - 2}</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate">
                    Last message preview...
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <Star className="w-3 h-3 text-gray-300" />
                  <Archive className="w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
