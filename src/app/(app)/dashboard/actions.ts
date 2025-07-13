'use server';

import { createAdminClient } from '@/lib/supabase/server';

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
