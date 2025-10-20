
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth(); // 1. Get loading state
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  // 2. Handle the loading state by showing a skeleton UI
  if (loading) {
    return (
      <>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <AppLogo className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-headline">SenAgriConnect</span>
          </Link>
        </SidebarHeader>
        <div className="flex-1"></div>
        <SidebarSeparator />
        <SidebarGroup>
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="group-data-[collapsible=icon]:hidden w-32 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </SidebarGroup>
      </>
    );
  }

  // 3. Update data access to the new user object structure
  const getInitials = () => {
    if (!user) return "??";
    const name = user.fullName;
    if (name) return name.split(' ').map((n:string) => n[0]).join('');
    return user.email?.substring(0, 2).toUpperCase() || '??';
  };
  
  const displayName = user?.fullName || user?.email;

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <AppLogo className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold font-headline">SenAgriConnect</span>
        </Link>
      </SidebarHeader>
      
      <div className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarMenu>
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href} className="w-full">
                    <SidebarMenuButton
                      isActive={isActive}
                      className="w-full"
                      tooltip={link.label}
                    >
                      <link.icon className={cn(isActive ? "text-primary" : "")} />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </div>

      <SidebarSeparator />
      
      <SidebarGroup>
        {user ? (
          <div className="flex items-center justify-between p-2">
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl || undefined} alt={displayName || "User"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-semibold text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">Agriculteur</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="p-2">
             <Button asChild className="w-full group-data-[collapsible=icon]:hidden">
                <Link href="/login">Se connecter</Link>
              </Button>
          </div>
        )}
      </SidebarGroup>
    </>
  );
}
