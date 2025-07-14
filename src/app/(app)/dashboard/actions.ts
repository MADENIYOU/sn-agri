
'use server';

import { createAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
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
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { posts: [], error: 'Utilisateur non authentifié' };
  }
  
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .rpc('get_posts_with_details', { current_user_id: user.id })
    .limit(3);

  if (error) {
    console.error('Error fetching recent posts:', error);
    return { posts: [], error: 'Impossible de charger les publications récentes.' };
  }

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
