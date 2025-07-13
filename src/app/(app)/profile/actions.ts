'use server';

import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis.'),
  region: z.string().optional(),
});

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = UpdateProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid data provided.',
    };
  }

  const { fullName, region } = validatedFields.data;
  const supabase = createAdminClient();

  // Update user_metadata in auth.users
  const { data: { user }, error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        fullName: fullName,
        region: region,
      },
    }
  );

  if (authError) {
    console.error('Error updating user metadata:', authError.message);
    return { success: false, error: authError.message };
  }

  // Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      region: region,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    return { success: false, error: profileError.message };
  }

  return { success: true, error: null };
}

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; error: string | null }> {
  if (!userId || !avatarUrl) {
    return { success: false, error: 'User ID and avatar URL are required.' };
  }
  
  const supabase = createAdminClient();

  const { error: authError } = await supabase.auth.admin.updateUserById(
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

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating user avatar in profile:', profileError.message);
    return { success: false, error: profileError.message };
  }

  return { success: true, error: null };
}
