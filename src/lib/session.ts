import type { IronSessionOptions } from 'iron-session';

// This file defines the session options that will be used by all API routes.

export const sessionOptions: IronSessionOptions = {
  // The password must be at least 32 characters long and should be kept secret.
  // It's read from an environment variable to avoid hardcoding it in the source code.
  password: process.env.SESSION_SECRET as string,
  cookieName: 'sn-agri-session', // A unique name for the session cookie.
  cookieOptions: {
    // The 'secure' option should be true in production (over HTTPS),
    // but can be false in development (over HTTP).
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript.
  },
};

// This is where we specify the type of data we're storing in the session.
// It helps with TypeScript type safety.
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: string;
      isLoggedIn: boolean;
    };
  }
}
