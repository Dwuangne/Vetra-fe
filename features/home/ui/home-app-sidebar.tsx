"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Building2,
  ChevronRight,
  ClipboardList,
  Factory,
  Home,
  LayoutDashboard,
  Layers,
  MapPin,
  Network,
  Package,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { VetraLogo } from "@/components/vetra-logo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth";
import { canManageConfig, hasTenantRole, isAdminRole } from "@/lib/auth/roles";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";

import { HomeSearchForm } from "./home-search-form";

const orgItems: { href: string; icon: typeof Home }[] = [{ href: "/tenants", icon: Building2 }];

const productionSubItems: { href: string; icon: typeof Home; label: { en: string; vi: string } }[] = [
  { href: "/production-orders", icon: ClipboardList, label: messages.productionOrder.title },
  { href: "/batches", icon: Package, label: messages.batch.title },
  { href: "/product-instances", icon: Layers, label: messages.productInstance.title },
];

export function HomeAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { locale } = useLocale();
  const nav = messages.nav;
  const roles = user?.roles ?? [];
  const showTenants = isAdminRole(roles);
  const showTenantNavigation = hasTenantRole(roles);
  const showTeamAccountsNav = showTenantNavigation && canManageConfig(roles);

  const isEcosystemActive =
    pathname.startsWith("/parties") ||
    pathname.startsWith("/locations") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/certificates");
  const isProductionActive =
    pathname.startsWith("/production-orders") ||
    pathname.startsWith("/batches") ||
    pathname.startsWith("/product-instances");

  const ecosystemSubItems: { href: string; icon: typeof Home; label: string }[] = [
    { href: "/parties", icon: Users, label: pickLocalized(messages.party.title, locale) },
    { href: "/locations", icon: MapPin, label: pickLocalized(messages.location.title, locale) },
    { href: "/products", icon: Tag, label: pickLocalized(messages.product.title, locale) },
    { href: "/certificates", icon: Award, label: pickLocalized(messages.certificate.title, locale) },
  ];

  return (
    <Sidebar
      style={
        {
          "--sidebar-primary": "240 100% 27%",
          "--sidebar-primary-foreground": "0 0% 100%",
          "--sidebar-accent": "240 100% 96%",
          "--sidebar-accent-foreground": "240 100% 27%",
          "--sidebar-ring": "240 100% 27%",
        } as React.CSSProperties
      }
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <VetraLogo alt="Vetra logo" className="size-[35px] rounded-sm" />
          <div className="ml-2 text-2xl font-bold">{pickLocalized(messages.common.appName, locale)}</div>
        </div>
        <HomeSearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>{pickLocalized(nav.dashboard, locale)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {showTenantNavigation ? (
              <SidebarMenuItem>
                <Collapsible
                  className="group/collapsible w-full"
                  defaultOpen={isEcosystemActive}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isEcosystemActive}>
                      <Network className="h-4 w-4" />
                      <span>{pickLocalized(nav.ecosystem, locale)}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {ecosystemSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                        return (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.href}>
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ) : null}
            {showTenantNavigation ? (
              <SidebarMenuItem>
                <Collapsible
                  className="group/collapsible w-full"
                  defaultOpen={isProductionActive}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isProductionActive}>
                      <Factory className="h-4 w-4" />
                      <span>{pickLocalized(nav.production, locale)}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {productionSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                        return (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.href}>
                                <subItem.icon className="h-4 w-4" />
                                <span>{pickLocalized(subItem.label, locale)}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ) : null}
            {showTeamAccountsNav ? (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/tenant-users")}>
                  <Link href="/tenant-users">
                    <UserCog className="h-4 w-4" />
                    <span>{pickLocalized(nav.teamAccounts, locale)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            {showTenants
              ? orgItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{pickLocalized(messages.tenant.title, locale)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              : null}
            {showTenants ? (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")}>
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{pickLocalized(nav.admin, locale)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
