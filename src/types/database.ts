
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      chats: {
        Row: Chat;
        Insert: Omit<Chat, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Chat, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_members: {
        Row: ChatMember;
        Insert: Omit<ChatMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<ChatMember, 'id' | 'joined_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'read_by' | 'edited'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>;
      };
      chat_labels: {
        Row: ChatLabel;
        Insert: Omit<ChatLabel, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatLabel, 'id' | 'created_at'>>;
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: Omit<MessageReaction, 'id' | 'created_at'>;
        Update: Partial<Omit<MessageReaction, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      message_type: 'text' | 'image' | 'video' | 'document' | 'audio';
      chat_type: 'direct' | 'group';
      member_role: 'admin' | 'member';
      chat_label: 'demo' | 'internal' | 'content' | 'signup' | 'dont_send';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  status: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  name: string | null;
  description: string | null;
  chat_type: 'direct' | 'group';
  avatar_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio';
  attachment_url: string | null;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
  read_by: string[];
  edited: boolean;
  sender?: Profile;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface ChatLabel {
  id: string;
  chat_id: string;
  label: 'demo' | 'internal' | 'content' | 'signup' | 'dont_send';
  created_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}
