
'use server';

import { createSupabaseServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Post, CommentWithAuthor } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createPost(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Vous devez être connecté pour publier.' };
  }

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${user.id}/${Date.now()}_${sanitizedFileName}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, imageFile);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { error: 'Erreur lors du téléversement de l\'image.' };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);
    imageUrl = publicUrl;
  }

  const { error: insertError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
    });
  
  if (insertError) {
    console.error('Error inserting post:', insertError);
    return { error: 'Erreur lors de la création de la publication.' };
  }
  
  revalidatePath('/feed');
  revalidatePath('/dashboard');

  return { error: null };
}

export async function getPosts(): Promise<{ posts: Post[], error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { posts: [], error: "Utilisateur non authentifié" };

  const { data, error } = await supabase
    .rpc('get_posts_with_details', { current_user_id: user.id });

  if (error) {
    console.error('Error fetching posts with details:', error);
    return { posts: [], error: 'Impossible de charger les publications.' };
  }

  // Manually shaping the data to match the Post type
  const posts: Post[] = data.map((post: any) => ({
    id: post.id,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    user_id: post.user_id,
    author: {
        name: post.author?.name || 'Utilisateur inconnu',
        avatar: post.author?.avatar || '',
    },
    likes: post.likes_count,
    comments: post.comments_count,
    user_has_liked: post.user_has_liked
  }));
  
  return { posts, error: null };
}

export async function toggleLike(postId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Vous devez être connecté pour aimer.' };

    // Check if the user has already liked the post
    const { data: existingLike, error: likeError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (likeError) {
        console.error('Error checking for like:', likeError);
        return { error: "Erreur lors de la vérification du j'aime." };
    }

    if (existingLike) {
        // User has liked, so unlike
        const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .match({ post_id: postId, user_id: user.id });
        if (deleteError) {
            console.error('Error unliking post:', deleteError);
            return { error: "Impossible de retirer le j'aime." };
        }
    } else {
        // User has not liked, so like
        const { error: insertError } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });
        if (insertError) {
            console.error('Error liking post:', insertError);
            return { error: "Impossible d'ajouter le j'aime." };
        }
    }

    revalidatePath('/feed');
    revalidatePath('/dashboard');
    return { success: true };
}


const CommentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide.'),
  postId: z.string().uuid(),
});

export async function addComment(values: z.infer<typeof CommentSchema>) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Vous devez être connecté pour commenter.' };

    const validation = CommentSchema.safeParse(values);
    if (!validation.success) {
        return { error: 'Données de commentaire non valides.' };
    }

    const { error } = await supabase.from('comments').insert({
        post_id: validation.data.postId,
        user_id: user.id,
        content: validation.data.content
    });

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'Impossible d\'ajouter le commentaire.' };
    }
    
    revalidatePath('/feed');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function getComments(postId: string): Promise<{ comments: CommentWithAuthor[] | null, error: string | null}> {
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
        .from('comments')
        .select(`
            *,
            author:profiles(
                full_name,
                avatar_url
            )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return { comments: null, error: "Impossible de charger les commentaires."};
    }

    const comments: CommentWithAuthor[] = data.map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        post_id: c.post_id,
        author: {
            name: c.author?.full_name || 'Utilisateur inconnu',
            avatar: c.author?.avatar_url || ''
        }
    }));
    
    return { comments, error: null };
}
