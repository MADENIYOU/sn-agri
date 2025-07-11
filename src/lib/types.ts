import { CHAT_USERS, CHAT_MESSAGES } from '@/lib/constants';

export type User = typeof CHAT_USERS[0];
export type Message = (typeof CHAT_MESSAGES)[0] & { audioUrl?: string | null };
