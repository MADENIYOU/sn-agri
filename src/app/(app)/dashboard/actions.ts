
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { Post } from '@/lib/types';

export async function getProfilesCount(): Promise<{ count: number | null; error: string | null }> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching profiles count:', error.message);
    return { count: null, error: 'Impossible de récupérer le nombre de profils.' };
  }

  return { count, error: null };
}

export async function getRecentPosts(): Promise<{ posts: Post[], error: string | null }> {
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
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching recent posts:', error);
    return { posts: [], error: 'Impossible de charger les publications récentes.' };
  }

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
    likes: 0,
    comments: 0
  }));
  
  return { posts, error: null };
}
