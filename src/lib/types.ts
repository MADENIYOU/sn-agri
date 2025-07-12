
export type User = {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
};

export type ChatUser = {
  id: string;
  name: string;
  email: string;
};

export type Conversation = {
    id: string;
    name: string;
    members: string[]; // array of user UUIDs
    created_by: string;
    created_at: string; // ISO 8601 timestamp string
};

export type Message = {
    id: string;
    sender_id: string;
    conversation_id: string;
    message: string;
    audio_url?: string | null;
    timestamp: string; // ISO 8601 timestamp string
    sender?: { // This is joined from the 'profiles' table
        full_name: string;
        avatar_url: string;
    } | null;
};
