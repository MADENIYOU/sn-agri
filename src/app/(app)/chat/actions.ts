'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ChatUser } from '@/lib/types';

const emailSchema = z.string().email();

export async function findUserByEmail(
  email: string
): Promise<{ user: ChatUser | null; error: string | null }> {
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return { user: null, error: 'Invalid email format.' };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email.trim())
    .maybeSingle();

  if (error || !data) {
    // Note: Don't log the error message to the console in production for security reasons.
    // This is just for debugging.
    console.error('Error finding user:', error?.message);
    return { user: null, error: 'User not found.' };
  }

  return {
    user: {
      id: data.id,
      name: data.full_name || 'Unknown User',
      email: data.email,
    },
    error: null,
  };
}
