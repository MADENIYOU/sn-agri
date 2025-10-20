'use server';

import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// This is a new, simplified action to update profile data.
// Avatar URL update is removed as we no longer have a file storage service.
export async function updateProfile(data: { fullName?: string; region?: string; username?: string; }) {
  try {
    const session = await getIronSession(cookies(), sessionOptions);
    if (!session.user?.isLoggedIn) {
      throw new Error('User not authenticated');
    }

    const updatedUser = await prisma.profile.update({
      where: { id: session.user.id },
      data: {
        fullName: data.fullName,
        region: data.region,
        username: data.username,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard'); // Also revalidate dashboard as it uses profile info

    const { hashedPassword, ...userWithoutPassword } = updatedUser;
    return { data: userWithoutPassword, error: null };

  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { data: null, error: "Impossible de mettre à jour le profil." };
  }
}