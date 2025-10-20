
'use server';


import type { Post, CommentWithAuthor } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function createPost(formData: FormData): Promise<{ post?: Post; error?: string }> {
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null;
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

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const imageFormData = new FormData();
    imageFormData.append('file', imageFile);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
      method: 'POST',
      body: imageFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Error uploading image:', errorData.message);
      return { error: 'Erreur lors du téléversement de l\'image.' };
    }

    const { fileUrl } = await uploadResponse.json();
    imageUrl = fileUrl;
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        authorId: user.id,
        content,
        imageUrl,
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
    console.error('Error creating post:', e);
    return { error: 'Erreur lors de la création de la publication.' };
  }
}

export async function getPosts(): Promise<{ posts: Post[], error: string | null }> {
  const session = await getIronSession(cookies(), sessionOptions);
  if (!session.user?.isLoggedIn) return { posts: [], error: "Utilisateur non authentifié" };

  const user = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    session.destroy();
    return { posts: [], error: 'Utilisateur non trouvé.' };
  }

  const postsWithDetails = await prisma.post.findMany({
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
    user_has_liked: post.likes.some((like) => like.authorId === user.id),
  }));
  
  return { posts, error: null };
}

export async function toggleLike(postId: string) {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user?.isLoggedIn) return { error: 'Vous devez être connecté pour aimer.' };

    const user = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      session.destroy();
      return { error: 'Utilisateur non trouvé.' };
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findUnique({
        where: {
            authorId_postId: {
                authorId: user.id,
                postId: postId,
            },
        },
    });

    try {
        if (existingLike) {
            // User has liked, so unlike
            await prisma.like.delete({
                where: {
                    authorId_postId: {
                        authorId: user.id,
                        postId: postId,
                    },
                },
            });
        } else {
            // User has not liked, so like
            await prisma.like.create({
                data: {
                    authorId: user.id,
                    postId: postId,
                },
            });
        }
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: 'Une erreur est survenue.' };
    }
}

export async function toggleCommentLike(commentId: string) {
  const cookieStore = cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user?.isLoggedIn) return { error: 'Vous devez être connecté pour aimer un commentaire.' };

  const user = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    session.destroy();
    return { error: 'Utilisateur non trouvé.' };
  }

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
   // Revalidate the post detail page
  return { success: true };
}

export async function getPostById(postId: string): Promise<{ post: Post | null, error: string | null }> {
  const cookieStore = cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user?.isLoggedIn) return { post: null, error: "Utilisateur non authentifié" };

  const user = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    session.destroy();
    return { post: null, error: 'Utilisateur non trouvé.' };
  }

  const postWithDetails = await prisma.post.findUnique({
    where: { id: postId },
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

  if (!postWithDetails) {
    return { post: null, error: 'Publication non trouvée.' };
  }

  const post: Post = {
    id: postWithDetails.id,
    content: postWithDetails.content,
    image_url: postWithDetails.imageUrl,
    created_at: postWithDetails.createdAt.toISOString(),
    user_id: postWithDetails.authorId,
    author: {
      name: postWithDetails.author?.fullName || 'Utilisateur inconnu',
      avatar: postWithDetails.author?.avatarUrl || '',
    },
    likes: postWithDetails.likes.length,
    comments: postWithDetails.comments.length,
    user_has_liked: postWithDetails.likes.some((like) => like.authorId === user.id),
  };

  return { post, error: null };
}

const CommentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide.'),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});

export async function addComment(values: z.infer<typeof CommentSchema>): Promise<{ comment?: CommentWithAuthor; error?: string; }> {
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
        console.error('Error adding comment:', e);
        return { error: 'Erreur lors de l\'ajout du commentaire.' };
    }
}

export async function getComments(postId: string): Promise<{ comments: CommentWithAuthor[] | null, error: string | null}> {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user?.isLoggedIn) return { comments: null, error: "Utilisateur non authentifié" };

    const currentUser = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      session.destroy();
      return { comments: null, error: 'Utilisateur non trouvé.' };
    }

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
        user_has_liked: c.likes.some((like) => like.authorId === currentUser.id),
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
            user_has_liked: reply.likes.some((like) => like.authorId === currentUser.id),
            replies: [], // Nested replies are not fetched for simplicity
        })),
    }));
    
    return { comments, error: null };
}
