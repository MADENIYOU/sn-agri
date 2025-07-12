
import type { Timestamp } from 'firebase/firestore';

export type User = {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
};

export type Message = {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    audioUrl?: string | null;
    timestamp: Timestamp;
};
