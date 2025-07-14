
'use server';

import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/server';
import type { Post } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Vous devez être connecté pour publier.' };
  }

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
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
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], error: 'Impossible de charger les publications.' };
  }

  // Manually shaping the data to match the Post type
  const posts: Post[] = data.map(post => ({
    id: post.id,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    user_id: post.user_id,
    author: {
        // @ts-ignore
        name: post.author?.full_name || 'Utilisateur inconnu',
        // @ts-ignore
        avatar: post.author?.avatar_url || '',
    },
    likes: 0, // Placeholder
    comments: 0 // Placeholder
  }));
  
  return { posts, error: null };
}
