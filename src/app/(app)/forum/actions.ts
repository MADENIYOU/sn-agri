'use server';

import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { Forum, Post, CommentWithAuthor } from '@/lib/types';
import { z } from 'zod';

// Helper to get the current session and user profile from the database
async function getSessionAndUser(): Promise<{ session: any; user: any } | { session: null; user: null }> {
  const session = await getIronSession(cookies(), sessionOptions);
  if (!session.user?.isLoggedIn) {
    return { session: null, user: null };
  }
  const user = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    // This case should ideally not happen if session.user.isLoggedIn is true
    // but as a safeguard, destroy session and return null
    session.destroy();
    return { session: null, user: null };
  }
  return { session, user };
}

export async function getForums(): Promise<{ forums: Forum[] | null; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        const forums = await prisma.forum.findMany({
            include: {
                members: {
                    where: { userId: user?.id || '' }, // Filter by userId if available
                    select: { userId: true }
                }
            }
        });

        const formattedForums: Forum[] = forums.map(forum => ({
            id: forum.id,
            name: forum.name,
            description: forum.description,
            created_at: forum.createdAt.toISOString(),
            created_by: forum.createdBy,
            is_followed: user ? forum.members.length > 0 : false
        }));

        return { forums: formattedForums, error: null };

    } catch (error: any) {
        console.error('Error getting forums:', error);
        return { forums: null, error: 'Impossible de charger les forums.' };
    }
}

export async function getFollowedForums(): Promise<{ forums: Forum[] | null; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        if (!user) {
            return { forums: [], error: 'Utilisateur non authentifié' };
        }

        const followedForums = await prisma.forumMember.findMany({
            where: { userId: user.id },
            include: {
                forum: true
            }
        }
        );

        const formattedForums: Forum[] = followedForums.map(fm => ({
            id: fm.forum.id,
            name: fm.forum.name,
            description: fm.forum.description,
            created_at: fm.forum.createdAt.toISOString(),
            created_by: fm.forum.createdBy,
            is_followed: true
        }));

        return { forums: formattedForums, error: null };

    } catch (error: any) {
        console.error('Error getting followed forums:', error);
        return { forums: null, error: 'Impossible de charger les forums suivis.' };
    }
}

export async function createForum(name: string, description: string): Promise<{ forum: Forum | null; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        const newForum = await prisma.forum.create({
            data: {
                name,
                description,
                createdBy: user.id,
                members: {
                    create: { userId: user.id } // Creator automatically follows
                }
            },
            include: {
                members: {
                    where: { userId: user.id },
                    select: { userId: true }
                }
            }
        });

        const formattedForum: Forum = {
            id: newForum.id,
            name: newForum.name,
            description: newForum.description,
            created_at: newForum.createdAt.toISOString(),
            created_by: newForum.createdBy,
            is_followed: newForum.members.length > 0
        };

        return { forum: formattedForum, error: null };

    } catch (error: any) {
        if (error.message === 'User not authenticated') {
            return { forum: null, error: 'User not authenticated' };
        }
        console.error('Error creating forum:', error);
        return { forum: null, error: 'Impossible de créer le forum.' };
    }
}

export async function toggleFollowForum(forumId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        const existingFollow = await prisma.forumMember.findUnique({
            where: {
                forumId_userId: {
                    forumId,
                    userId: user.id
                }
            }
        });

        if (existingFollow) {
            await prisma.forumMember.delete({
                where: {
                    forumId_userId: {
                        forumId,
                        userId: user.id
                    }
                }
            });
        } else {
            await prisma.forumMember.create({
                data: {
                    forumId,
                    userId: user.id
                }
            });
        }

        return { success: true, error: null };

    } catch (error: any) {
        if (error.message === 'User not authenticated') {
            return { success: false, error: 'User not authenticated' };
        }
        console.error('Error toggling forum follow:', error);
        return { success: false, error: 'Impossible de suivre/ne plus suivre le forum.' };
    }
}

export async function getForumPosts(forumId: string): Promise<{ posts: Post[] | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        const userId = session.user?.id;

        const postsWithDetails = await prisma.post.findMany({
            where: { forumId },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                likes: {
                    select: {
                        authorId: true,
                    },
                },
                comments: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const postIds = postsWithDetails.map(p => p.id);
        const userLikes = userId ? await prisma.like.findMany({
            where: { authorId: userId, postId: { in: postIds } },
            select: { postId: true },
        }) : [];
        const likedPostIds = new Set(userLikes.map(l => l.postId));

        const posts: Post[] = postsWithDetails.map((post) => ({
            id: post.id,
            content: post.content,
            image_url: post.imageUrl,
            created_at: post.createdAt.toISOString(),
            user_id: post.authorId,
            author: {
                name: post.author?.fullName || 'Utilisateur inconnu',
                avatar: post.author?.avatarUrl || '',
            },
            likes: post.likes.length,
            comments: post.comments.length,
            user_has_liked: userId ? post.likes.some((like) => like.authorId === userId) : false,
        }));

        return { posts, error: null };

    } catch (error: any) {
        console.error('Error getting forum posts:', error);
        return { posts: null, error: 'Impossible de charger les publications du forum.' };
    }
}

export async function createForumPost(forumId: string, content: string, imageUrl?: string): Promise<{ post?: Post; error?: string }> {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user?.isLoggedIn) {
      return { error: 'Vous devez être connecté pour publier.' };
    }
  
    const user = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });
  
    if (!user) {
      session.destroy();
      return { error: 'Utilisateur non trouvé.' };
    }

    try {
      const newPost = await prisma.post.create({
        data: {
          authorId: user.id,
          content,
          imageUrl,
          forumId,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          likes: {
            select: {
              authorId: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
        },
      });
  
      const post: Post = {
        id: newPost.id,
        content: newPost.content,
        image_url: newPost.imageUrl,
        created_at: newPost.createdAt.toISOString(),
        user_id: newPost.authorId,
        author: {
          name: newPost.author?.fullName || 'Utilisateur inconnu',
          avatar: newPost.author?.avatarUrl || '',
        },
        likes: newPost.likes.length,
        comments: newPost.comments.length,
        user_has_liked: newPost.likes.some((like) => like.authorId === user.id),
      };
  
      return { post };
    } catch (e) {
      console.error('Error creating forum post:', e);
      return { error: 'Erreur lors de la création de la publication du forum.' };
    }
  }

export async function toggleForumPostLike(postId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        const existingLike = await prisma.like.findUnique({
            where: {
                authorId_postId: {
                    authorId: user.id,
                    postId: postId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    authorId_postId: {
                        authorId: user.id,
                        postId: postId,
                    },
                },
            });
        } else {
            await prisma.like.create({
                data: {
                    authorId: user.id,
                    postId: postId,
                },
            });
        }

        return { success: true, error: null };

    } catch (error: any) {
        if (error.message === 'User not authenticated') {
            return { success: false, error: 'User not authenticated' };
        }
        console.error('Error toggling forum post like:', error);
        return { success: false, error: 'Impossible d\'aimer/ne plus aimer la publication du forum.' };
    }
}

const CommentSchema = z.object({
    content: z.string().min(1, 'Le commentaire ne peut pas être vide.'),
    postId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
  });

export async function addForumPostComment(values: z.infer<typeof CommentSchema>): Promise<{ comment?: CommentWithAuthor; error?: string; }> {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user?.isLoggedIn) return { error: 'Vous devez être connecté pour commenter.' };

    const user = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      session.destroy();
      return { error: 'Utilisateur non trouvé.' };
    }

    const validation = CommentSchema.safeParse(values);
    if (!validation.success) {
        return { error: 'Données de commentaire non valides.' };
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                postId: validation.data.postId,
                authorId: user.id,
                content: validation.data.content,
                parentId: validation.data.parentId,
            },
            include: {
                author: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                likes: {
                    select: {
                        authorId: true,
                    },
                },
            },
        });

        const comment: CommentWithAuthor = {
            id: newComment.id,
            content: newComment.content,
            created_at: newComment.createdAt.toISOString(),
            user_id: newComment.authorId,
            post_id: newComment.postId,
            author: {
                name: newComment.author?.fullName || 'Utilisateur inconnu',
                avatar: newComment.author?.avatarUrl || ''
            },
            likes: newComment.likes.length,
            user_has_liked: newComment.likes.some((like) => like.authorId === user.id),
            replies: [],
        };

        return { comment };
    } catch (e) {
        console.error('Error adding forum post comment:', e);
        return { error: 'Erreur lors de l\'ajout du commentaire du forum.' };
    }
}

export async function toggleForumCommentLike(commentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { user } = await getSessionAndUser();

        const existingLike = await prisma.commentLike.findUnique({
            where: {
                authorId_commentId: {
                    authorId: user.id,
                    commentId: commentId,
                },
            },
        });

        if (existingLike) {
            await prisma.commentLike.delete({
                where: {
                    authorId_commentId: {
                        authorId: user.id,
                        commentId: commentId,
                    },
                },
            });
        } else {
            await prisma.commentLike.create({
                data: {
                    authorId: user.id,
                    commentId: commentId,
                },
            });
        }

        return { success: true, error: null };

    } catch (error: any) {
        if (error.message === 'User not authenticated') {
            return { success: false, error: 'User not authenticated' };
        }
        console.error('Error toggling forum comment like:', error);
        return { success: false, error: 'Impossible d\'aimer/ne plus aimer le commentaire du forum.' };
    }
}

export async function getForumComments(postId: string): Promise<{ comments: CommentWithAuthor[] | null, error: string | null}> {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    const userId = session.user?.id;

    if (!userId) return { comments: null, error: "Utilisateur non authentifié" };

    try {
        const commentsWithAuthor = await prisma.comment.findMany({
            where: { postId: postId, parentId: null }, // Only fetch top-level comments initially
            include: {
                author: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                likes: {
                    select: {
                        authorId: true,
                    },
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                        likes: {
                            select: {
                                authorId: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    
        const comments: CommentWithAuthor[] = commentsWithAuthor.map((c) => ({
            id: c.id,
            content: c.content,
            created_at: c.createdAt.toISOString(),
            user_id: c.authorId,
            post_id: c.postId,
            author: {
                name: c.author?.fullName || 'Utilisateur inconnu',
                avatar: c.author?.avatarUrl || ''
            },
            likes: c.likes.length,
            user_has_liked: userId ? c.likes.some((like) => like.authorId === userId) : false,
            replies: c.replies.map(reply => ({
                id: reply.id,
                content: reply.content,
                created_at: reply.createdAt.toISOString(),
                user_id: reply.authorId,
                post_id: reply.postId,
                author: {
                    name: reply.author?.fullName || 'Utilisateur inconnu',
                    avatar: reply.author?.avatarUrl || ''
                },
                likes: reply.likes.length,
                user_has_liked: userId ? reply.likes.some((like) => like.authorId === userId) : false,
                replies: [], // Nested replies are not fetched for simplicity
            })),
        }));
        
        return { comments, error: null };
    } catch (error: any) {
        console.error('Error getting forum comments:', error);
        return { comments: null, error: 'Impossible de charger les commentaires du forum.' };
    }
}

export async function getForumDetails(forumId: string): Promise<{ forum: Forum | null; error: string | null }> {
    try {
        const session = await getIronSession(cookies(), sessionOptions);
        const userId = session.user?.id;

        const forum = await prisma.forum.findUnique({
            where: { id: forumId },
            include: {
                members: {
                    where: { userId: userId || '' }, // Filter by userId if available
                    select: { userId: true }
                }
            }
        });

        if (!forum) {
            return { forum: null, error: 'Forum non trouvé.' };
        }

        const formattedForum: Forum = {
            id: forum.id,
            name: forum.name,
            description: forum.description,
            created_at: forum.createdAt.toISOString(),
            created_by: forum.createdBy,
            is_followed: userId ? forum.members.length > 0 : false // Only show as followed if user is logged in
        };

        return { forum: formattedForum, error: null };

    } catch (error: any) {
        console.error('Error getting forum details:', error);
        return { forum: null, error: 'Impossible de charger les détails du forum.' };
    }
}