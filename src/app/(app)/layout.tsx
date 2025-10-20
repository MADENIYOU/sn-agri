"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

import { Header } from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/forum', /^\/forum\/[^/]+$/];

  useEffect(() => {
    const isPublicRoute = publicRoutes.some(route => {
      if (typeof route === 'string') {
        return pathname === route;
      }
      return route.test(pathname);
    });

    if (!loading && !user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && !publicRoutes.some(route => (typeof route === 'string' ? pathname === route : route.test(pathname))))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}