
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message, Profile, Chat, ChatMember } from '@/types/database';
import { 
  Phone, 
  Camera, 
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Image,
  Download,
  Reply,
  File,
  Sticker
} from 'lucide-react';
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

// Current user profile for demo
const currentUser: Profile = {
  id: 'current-user',
  email: 'me@example.com',
  full_name: 'Me',
  avatar_url: null,
  phone: '+1234567899',
  status: 'online',
  last_seen: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Sample messages for demonstration
const initialMessages: { [key: string]: MessageWithSender[] } = {
  'chat-1': [
    {
      id: 'msg-1',
      chat_id: 'chat-1',
      sender_id: 'user-1',
      content: 'Hey! How are you doing?',
      message_type: 'text',
      attachment_url: null,
      reply_to: null,
      created_at: new Date(Date.now() - 600000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString(),
      read_by: [],
      edited: false,
      sender: {
        id: 'user-1',
        email: 'john@example.com',
        full_name: 'John Doe',
        avatar_url: null,
        phone: '+1234567890',
        status: 'online',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      id: 'msg-2',
      chat_id: 'chat-1',
      sender_id: 'current-user',
      content: 'I\'m doing great! Thanks for asking 😊',
      message_type: 'text',
      attachment_url: null,
      reply_to: null,
      created_at: new Date(Date.now() - 300000).toISOString(),
      updated_at: new Date(Date.now() - 300000).toISOString(),
      read_by: [],
      edited: false,
      sender: currentUser
    }
  ],
  'chat-2': [
    {
      id: 'msg-3',
      chat_id: 'chat-2',
      sender_id: 'user-2',
      content: 'Can we schedule a meeting for tomorrow?',
      message_type: 'text',
      attachment_url: null,
      reply_to: null,
      created_at: new Date(Date.now() - 120000).toISOString(),
      updated_at: new Date(Date.now() - 120000).toISOString(),
      read_by: [],
      edited: false,
      sender: {
        id: 'user-2',
        email: 'sarah@example.com',
        full_name: 'Sarah Wilson',
        avatar_url: null,
        phone: '+1234567891',
        status: 'online',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  ],
  'chat-3': [
    {
      id: 'msg-4',
      chat_id: 'chat-3',
      sender_id: 'user-3',
      content: 'Let\'s discuss the new campaign ideas',
      message_type: 'text',
      attachment_url: null,
      reply_to: null,
      created_at: new Date(Date.now() - 900000).toISOString(),
      updated_at: new Date(Date.now() - 900000).toISOString(),
      read_by: [],
      edited: false,
      sender: {
        id: 'user-3',
        email: 'mike@example.com',
        full_name: 'Mike Johnson',
        avatar_url: null,
        phone: '+1234567892',
        status: 'away',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  ]
};

// Sample stickers
const stickers = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😴', '🤯',
  '👍', '👎', '👏', '🙌', '💪', '🙏', '✌️', '🤞',
  '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡',
  '🎉', '🎊', '🔥', '⭐', '✨', '💫', '🌟', '🎈'
];

export function ChatArea({ chatId }: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatId) {
      loadSampleData();
      scrollToBottom();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSampleData = () => {
    // Load sample chat data
    const sampleChat: Chat = {
      id: chatId,
      name: chatId === 'chat-1' ? 'John Doe' : chatId === 'chat-2' ? 'Sarah Wilson' : 'Marketing Team',
      description: null,
      chat_type: chatId === 'chat-3' ? 'group' : 'direct',
      avatar_url: null,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    setChat(sampleChat);
    setMessages(initialMessages[chatId] || []);
  };

  const sendMessage = async (content: string, type: 'text' | 'sticker' = 'text') => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const newMsg: MessageWithSender = {
        id: `msg-${Date.now()}`,
        chat_id: chatId,
        sender_id: 'current-user',
        content: content.trim(),
        message_type: 'text',
        attachment_url: null,
        reply_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        read_by: [],
        edited: false,
        sender: currentUser
      };

      setMessages(prev => [...prev, newMsg]);
      
      // Update the initial messages store for persistence
      if (!initialMessages[chatId]) {
        initialMessages[chatId] = [];
      }
      initialMessages[chatId].push(newMsg);
      
      setNewMessage('');
      setShowStickers(false);

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleStickerClick = (sticker: string) => {
    sendMessage(sticker, 'sticker');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Create a message with file info
      const fileMessage = `📎 Shared a file: ${file.name}`;
      sendMessage(fileMessage);
      
      toast({
        title: "File shared",
        description: `File "${file.name}" has been shared`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getChatDisplayName = () => {
    if (chat?.name) return chat.name;
    return 'Unknown Chat';
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
           new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000;
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
              <AvatarImage src={chat.avatar_url} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {getChatDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getChatDisplayName()}</h2>
              <p className="text-sm text-gray-500">
                {chat.chat_type === 'group' ? 'Group chat' : 'Direct message'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <Camera className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === 'current-user';
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

      {/* Sticker Panel */}
      {showStickers && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
            {stickers.map((sticker, index) => (
              <button
                key={index}
                onClick={() => handleStickerClick(sticker)}
                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <File className="w-5 h-5 text-gray-600" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-10"
              disabled={loading}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowStickers(!showStickers)}
            >
              <Smile className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
