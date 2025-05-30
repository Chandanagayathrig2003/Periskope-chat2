
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
