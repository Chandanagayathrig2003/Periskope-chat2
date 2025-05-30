
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message, Profile, Chat, ChatMember } from '@/types/database';
import { 
  BsPhone, 
  BsCamera, 
  BsThreeDotsVertical,
  BsPaperclip,
  BsEmojiSmile,
  BsSend,
  BsImage,
  BsDownload,
  BsReply
} from 'react-icons/bs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ChatAreaProps {
  chatId: string;
}

interface MessageWithSender extends Message {
  sender: Profile;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMembers, setChatMembers] = useState<(ChatMember & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (chatId) {
      fetchChatDetails();
      fetchMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          (payload) => {
            fetchMessages(); // Refetch to get sender details
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatDetails = async () => {
    const { data: chatData } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatData) {
      setChat(chatData);
    }

    const { data: membersData } = await supabase
      .from('chat_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('chat_id', chatId);

    if (membersData) {
      setChatMembers(membersData);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: profile.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      
      // Update chat's last_message_at
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChatDisplayName = () => {
    if (chat?.name) return chat.name;
    
    // For direct chats, show the other person's name
    const otherMember = chatMembers.find(m => m.user_id !== profile?.id);
    return otherMember?.profile?.full_name || 'Unknown User';
  };

  const getChatAvatar = () => {
    if (chat?.avatar_url) return chat.avatar_url;
    
    // For direct chats, show the other person's avatar
    const otherMember = chatMembers.find(m => m.user_id !== profile?.id);
    return otherMember?.profile?.avatar_url;
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isConsecutiveMessage = (currentMsg: MessageWithSender, prevMsg: MessageWithSender | null) => {
    if (!prevMsg) return false;
    return currentMsg.sender_id === prevMsg.sender_id && 
           new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000; // 5 minutes
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getChatAvatar()} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {getChatDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getChatDisplayName()}</h2>
              <p className="text-sm text-gray-500">
                {chat.chat_type === 'group' ? `${chatMembers.length} members` : 'Direct message'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <BsPhone className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <BsCamera className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <BsThreeDotsVertical className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === profile?.id;
          const isConsecutive = isConsecutiveMessage(message, messages[index - 1] || null);
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                isConsecutive ? 'mt-1' : 'mt-4'
              }`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && !isConsecutive && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                      {message.sender?.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && isConsecutive && <div className="w-8" />}
                
                <div className="flex flex-col">
                  {!isConsecutive && (
                    <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {!isOwn && message.sender?.full_name} • {formatMessageTime(message.created_at)}
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } ${isConsecutive ? 'rounded-t-sm' : ''}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.attachment_url && (
                      <div className="mt-2">
                        {message.message_type === 'image' ? (
                          <img 
                            src={message.attachment_url} 
                            alt="Attachment" 
                            className="max-w-full h-auto rounded" 
                          />
                        ) : (
                          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                            <BsDownload className="w-4 h-4" />
                            <span className="text-sm">File attachment</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {isConsecutive && isOwn && (
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formatMessageTime(message.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="sm">
            <BsPaperclip className="w-5 h-5 text-gray-600" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-10"
              disabled={loading}
            />
            <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <BsEmojiSmile className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <BsSend className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
