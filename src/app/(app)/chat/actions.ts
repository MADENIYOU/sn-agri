'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { ChatUser, Conversation, Message } from '@/lib/types';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

const emailSchema = z.string().email();

export async function findUserByEmail(
  email: string
): Promise<{ user: ChatUser | null; error: string | null }> {
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return { user: null, error: 'Format d\'email invalide.' };
  }

  try {
    const user = await prisma.profile.findUnique({
      where: { email: email.trim() },
      select: { id: true, fullName: true, email: true },
    });

    if (!user) {
      return { user: null, error: 'Utilisateur non trouvé.' };
    }

    return {
      user: {
        id: user.id,
        name: user.fullName || 'Utilisateur Inconnu',
        email: user.email,
      },
      error: null,
    };
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'utilisateur:', error);
    return { user: null, error: 'Une erreur est survenue.' };
  }
}

export async function getConversations(): Promise<{ conversations: Conversation[] | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return { conversations: null, error: 'Utilisateur non authentifié' };
        }

        const userConversations = await prisma.conversationMember.findMany({
            where: { userId: session.user.id },
            include: {
                conversation: {
                    include: {
                        members: {
                            select: {
                                userId: true
                            }
                        },
                        messages: {
                            orderBy: {
                                timestamp: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        const conversations: Conversation[] = await Promise.all(userConversations.map(async (uc) => {
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: uc.conversationId,
                    timestamp: {
                        gt: uc.lastReadAt || new Date(0)
                    },
                    senderId: {
                        not: session.user.id
                    }
                }
            });

            return {
                id: uc.conversation.id,
                name: uc.conversation.name,
                created_at: uc.conversation.createdAt.toISOString(),
                created_by: uc.conversation.createdBy,
                members: uc.conversation.members.map(m => m.userId),
                unreadCount,
                lastMessageAt: uc.conversation.messages[0]?.timestamp.toISOString() || uc.conversation.createdAt.toISOString()
            };
        }));

        conversations.sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

        return { conversations, error: null };

    } catch (error) {
        console.error('Error getting conversations:', error);
        return { conversations: null, error: 'Impossible de charger les conversations.' };
    }
}

export async function getMessages(conversationId: string): Promise<{ messages: Message[] | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return { messages: null, error: 'Utilisateur non authentifié' };
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        fullName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        const formattedMessages: Message[] = messages.map(msg => ({
            id: msg.id,
            message: msg.message,
            audio_url: msg.audioUrl,
            timestamp: msg.timestamp.toISOString(),
            conversation_id: msg.conversationId,
            sender_id: msg.senderId,
            sender: {
                full_name: msg.sender.fullName || 'Utilisateur Inconnu',
                avatar_url: msg.sender.avatarUrl || ''
            }
        }));

        return { messages: formattedMessages, error: null };

    } catch (error) {
        console.error('Error getting messages:', error);
        return { messages: null, error: 'Impossible de charger les messages.' };
    }
}

export async function createConversation(name: string, memberIds: string[]): Promise<{ conversation: Conversation | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return { conversation: null, error: 'Utilisateur non authentifié' };
        }

        const newConversation = await prisma.conversation.create({
            data: {
                name,
                createdBy: session.user.id,
                members: {
                    create: memberIds.map(id => ({ userId: id }))
                }
            },
            include: {
                members: {
                    select: {
                        userId: true
                    }
                }
            }
        });

        const conversation: Conversation = {
            id: newConversation.id,
            name: newConversation.name,
            created_at: newConversation.createdAt.toISOString(),
            created_by: newConversation.createdBy,
            members: newConversation.members.map(m => m.userId),
            unreadCount: 0
        };

        return { conversation, error: null };

    } catch (error) {
        console.error('Error creating conversation:', error);
        return { conversation: null, error: 'Impossible de créer la conversation.' };
    }
}

export async function sendMessage(conversationId: string, message: string, audioUrl?: string): Promise<{ message: Message | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return { message: null, error: 'Utilisateur non authentifié' };
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                senderId: session.user.id,
                message,
                audioUrl
            },
            include: {
                sender: {
                    select: {
                        fullName: true,
                        avatarUrl: true
                    }
                }
            }
        });

        const formattedMessage: Message = {
            id: newMessage.id,
            message: newMessage.message,
            audio_url: newMessage.audioUrl,
            timestamp: newMessage.timestamp.toISOString(),
            conversation_id: newMessage.conversationId,
            sender_id: newMessage.senderId,
            sender: {
                full_name: newMessage.sender.fullName || 'Utilisateur Inconnu',
                avatar_url: newMessage.sender.avatarUrl || ''
            }
        };

        return { message: formattedMessage, error: null };

    } catch (error) {
        console.error('Error sending message:', error);
        return { message: null, error: 'Impossible d\'envoyer le message.' };
    }
}

export async function markConversationAsRead(conversationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        if (!session.user?.isLoggedIn) {
            return { success: false, error: 'Utilisateur non authentifié' };
        }

        await prisma.conversationMember.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: session.user.id
                }
            },
            data: {
                lastReadAt: new Date()
            }
        });

        return { success: true, error: null };

    } catch (error) {
        console.error('Error marking conversation as read:', error);
        return { success: false, error: 'Impossible de marquer la conversation comme lue.' };
    }
}