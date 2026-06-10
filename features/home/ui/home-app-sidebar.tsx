"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Award,
  Building2,
  ChevronRight,
  ClipboardCheck,
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

import { navItemMatchesQuery } from "../lib/nav-search";
import { HomeSearchForm } from "./home-search-form";

type SidebarNavLink = {
  href: string;
  icon: typeof Home;
  label: string;
};

const orgItems: { href: string; icon: typeof Home }[] = [{ href: "/tenants", icon: Building2 }];

const productionSubItems: { href: string; icon: typeof Home; label: { en: string; vi: string } }[] = [
  { href: "/production-orders", icon: ClipboardList, label: messages.productionOrder.title },
  { href: "/batches", icon: Package, label: messages.batch.title },
  { href: "/product-instances", icon: Layers, label: messages.productInstance.title },
  { href: "/verification-sessions", icon: ClipboardCheck, label: messages.verificationSession.title },
];

export function HomeAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { locale } = useLocale();
  const nav = messages.nav;
  const [navQuery, setNavQuery] = useState("");
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
    pathname.startsWith("/product-instances") ||
    pathname.startsWith("/verification-sessions");

  const ecosystemSubItems: { href: string; icon: typeof Home; label: string }[] = [
    { href: "/parties", icon: Users, label: pickLocalized(messages.party.title, locale) },
    { href: "/locations", icon: MapPin, label: pickLocalized(messages.location.title, locale) },
    { href: "/products", icon: Tag, label: pickLocalized(messages.product.title, locale) },
    { href: "/certificates", icon: Award, label: pickLocalized(messages.certificate.title, locale) },
  ];

  const navLinks = useMemo((): SidebarNavLink[] => {
    const links: SidebarNavLink[] = [
      { href: "/", icon: Home, label: pickLocalized(nav.dashboard, locale) },
    ];

    if (showTenantNavigation) {
      for (const item of ecosystemSubItems) {
        links.push({ href: item.href, icon: item.icon, label: item.label });
      }
      for (const item of productionSubItems) {
        links.push({ href: item.href, icon: item.icon, label: pickLocalized(item.label, locale) });
      }
    }

    if (showTeamAccountsNav) {
      links.push({
        href: "/tenant-users",
        icon: UserCog,
        label: pickLocalized(nav.teamAccounts, locale),
      });
    }

    if (showTenants) {
      links.push({
        href: "/tenants",
        icon: Building2,
        label: pickLocalized(messages.tenant.title, locale),
      });
      links.push({
        href: "/admin",
        icon: LayoutDashboard,
        label: pickLocalized(nav.admin, locale),
      });
    }

    return links;
  }, [locale, showTenantNavigation, showTeamAccountsNav, showTenants, ecosystemSubItems]);

  const filteredNavLinks = useMemo(() => {
    const q = navQuery.trim();
    if (!q) return null;
    return navLinks.filter((link) => navItemMatchesQuery(link.label, link.href, q));
  }, [navLinks, navQuery]);

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

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
        <HomeSearchForm value={navQuery} onChange={setNavQuery} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavLinks ? (
          filteredNavLinks.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              {pickLocalized(nav.searchNoResults, locale)}
            </p>
          ) : (
            <SidebarGroup>
              <SidebarMenu>
                {filteredNavLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={isLinkActive(link.href)}>
                      <Link href={link.href} onClick={() => setNavQuery("")}>
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        ) : (
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
        )}
      </SidebarContent>
    </Sidebar>
  );
}
