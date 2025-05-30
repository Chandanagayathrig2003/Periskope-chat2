
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Chat, ChatMember, Profile, ChatLabel } from '@/types/database';
import { 
  BsSearch, 
  BsPlus, 
  BsFilter,
  BsThreeDotsVertical,
  BsCheckCircle,
  BsCircle,
  BsArchive,
  BsTag
} from 'react-icons/bs';
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
          unreadCount: 0 // TODO: Calculate unread count
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
    
    // For direct chats, show the other person's name
    const otherMember = chat.members.find(m => m.user_id !== profile?.id);
    return otherMember?.profile?.full_name || 'Unknown User';
  };

  const getChatAvatar = (chat: ChatWithDetails) => {
    if (chat.avatar_url) return chat.avatar_url;
    
    // For direct chats, show the other person's avatar
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <BsPlus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <BsThreeDotsVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'demo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('demo')}
          >
            Demo
          </Button>
          <Button
            variant={selectedFilter === 'internal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('internal')}
          >
            Internal
          </Button>
          <Button variant="ghost" size="sm">
            <BsFilter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getChatAvatar(chat)} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {getChatDisplayName(chat).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {chat.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {getChatDisplayName(chat)}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.last_message_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 mt-1">
                  {chat.labels.slice(0, 2).map((label) => (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className={`text-xs ${getLabelColor(label.label)}`}
                    >
                      {label.label}
                    </Badge>
                  ))}
                  {chat.labels.length > 2 && (
                    <span className="text-xs text-gray-400">+{chat.labels.length - 2}</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 truncate mt-1">
                  Last message preview...
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <BsCircle className="w-4 h-4 text-gray-300" />
                <BsArchive className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
