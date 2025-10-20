
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
    unreadCount?: number;
    lastMessageAt?: string;
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

export type Post = {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    author: {
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    user_has_liked?: boolean;
}

export type Comment = {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export type CommentWithAuthor = Comment & {
    author: {
        name: string;
        avatar: string;
    };
};

export type ProductionDetails = {
    id: string;
    user_id: string;
    crop_name: string;
    soil_type: string;
    surface_area: number;
    created_at: string;
    updated_at: string;
}

export type ProductionRecord = {
    id: string;
    user_id: string;
    cropName: string;
    year: number;
    month: number;
    quantityTonnes: number;
    created_at: string;
};

export type Forum = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    created_by: string;
    is_followed?: boolean;
};
