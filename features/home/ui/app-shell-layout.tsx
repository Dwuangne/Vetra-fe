"use client";

import { LogOut, UserRound } from "lucide-react";
import type * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth";
import { defaultLocale, messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

import { HomeAppSidebar } from "./home-app-sidebar";

type AppShellLayoutProps = {
  title: React.ReactNode;
  children: React.ReactNode;
};

export function AppShellLayout({ title, children }: AppShellLayoutProps) {
  const { logout, user } = useAuth();
  const tenantLabel = user?.tenantName?.trim();
  const locale: Locale = defaultLocale;
  const nav = messages.nav;

  return (
    <SidebarProvider>
      <HomeAppSidebar />
      <SidebarInset className="min-w-0 transition-[margin-left,width] duration-200 ease-linear md:peer-data-[state=expanded]:ml-[var(--sidebar-width)] md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))] md:peer-data-[state=collapsed]:ml-0 md:peer-data-[state=collapsed]:w-full">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="relative z-20" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-full outline-none ring-offset-background hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={pickLocalized(nav.accountMenu, locale)}
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback aria-hidden>
                      <UserRound className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.75} />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="center" sideOffset={8} className="w-44">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {pickLocalized(nav.logout, locale)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {tenantLabel ? (
              <span
                className="min-w-0 max-w-[min(52vw,16rem)] truncate text-left text-sm text-muted-foreground sm:max-w-xs"
                title={tenantLabel}
              >
                {tenantLabel}
              </span>
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-4 ml-[10px]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
