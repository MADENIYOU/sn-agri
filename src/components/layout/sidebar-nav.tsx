"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

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
        <div className="flex items-center justify-between p-2">
          <Link href="/profile" className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Moussa Faye" />
              <AvatarFallback>MF</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-sm">Moussa Faye</p>
              <p className="text-xs text-muted-foreground">Agriculteur</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" asChild>
            <Link href="/">
              <LogOut className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </SidebarGroup>
    </>
  );
}
