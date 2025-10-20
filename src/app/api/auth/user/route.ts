export const dynamic = 'force-dynamic';

import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const session = await getIronSession(cookieStore, sessionOptions);

  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      session.destroy(); // Clean up session if user not found
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { hashedPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('Get User Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}