
'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; error: string | null }> {
  if (!userId || !avatarUrl) {
    return { success: false, error: 'User ID and avatar URL are required.' };
  }
  
  const supabase = createAdminClient();

  // Update user_metadata in auth.users first
  const { data: { user }, error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        avatar_url: avatarUrl,
      },
    }
  );

  if (authError) {
    console.error('Error updating user avatar in auth:', authError.message);
    return { success: false, error: authError.message };
  }

  // Then update the 'profiles' table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating user avatar in profile:', profileError.message);
    // Note: You might want to decide if you want to revert the auth update here.
    // For now, we'll report the error.
    return { success: false, error: profileError.message };
  }

  return { success: true, error: null };
}
