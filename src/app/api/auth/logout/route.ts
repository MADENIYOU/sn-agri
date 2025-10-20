import { getIronSession } from 'iron-session';
import { NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.cookies.set(sessionOptions.cookieName, '', { maxAge: -1 });
  return response;
}
