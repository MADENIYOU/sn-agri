
import type { Timestamp } from 'firebase/firestore';

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
    members: string[]; // array of user UIDs
    createdBy: string;
    createdAt: Timestamp;
};

export type Message = {
    id: string;
    senderId: string;
    message: string;
    audioUrl?: string | null;
    timestamp: Timestamp;
};
