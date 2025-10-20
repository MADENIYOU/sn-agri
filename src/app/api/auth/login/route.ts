import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Get the session and save user data
    const session = await getIronSession(cookies(), sessionOptions);
    session.user = {
      id: user.id,
      isLoggedIn: true,
    };
    await session.save();

    // Don't return the password hash
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
