
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  // Create a server-side client with the service_role key to bypass RLS
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Note: The set and remove methods are not used in this read-only admin context,
        // but they are required by the type definition.
        set(name: string, value: string, options) {
            try {
                cookieStore.set({ name, value, ...options })
            } catch(error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
            }
        },
        remove(name: string, options) {
            try {
                cookieStore.set({ name, value: '', ...options })
            } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
            }
        }
      },
    }
  );
}
