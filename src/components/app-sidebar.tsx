"use client";

import {
  BadgeDollarSign,
  Heart,
  Home,
  Layers,
  LogOut,
  MessageSquare,
  Palette,
  Printer3d,
  Rocket,
  Settings,
  Spool,
  Tags,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "./ui/separator";

const generalNavItems = [
  { icon: Home, title: "Home", url: "/home" },
  { icon: Spool, title: "Filamentos", url: "/filamentos" },
  { icon: Printer3d, title: "Impressoras", url: "/impressoras" },
  { icon: Rocket, title: "Planos", url: "/assinatura" },
];

const adminNavItems = [
  { icon: Ticket, title: "Convites", url: "/convites" },
  { icon: Palette, title: "Marcas de Filamento", url: "/marcas-filamento" },
  { icon: Layers, title: "Tipos de Filamento", url: "/tipos-filamento" },
  { icon: Tags, title: "Marcas de Impressora", url: "/marcas-impressora" },
  {
    icon: Printer3d,
    title: "Modelos de Impressora",
    url: "/modelos-impressora",
  },
  { icon: MessageSquare, title: "Feedbacks", url: "/feedbacks" },
  { icon: BadgeDollarSign, title: "Gerenciar planos", url: "/planos" },
  { icon: Users, title: "Usuários", url: "/usuarios" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = useCallback(() => {
    logout()
      .then(() => router.push("/auth"))
      .catch(() => null);
  }, [logout, router]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center overflow-hidden rounded-md p-2 group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!">
          <div className="group-data-[collapsible=icon]:hidden">
            <Image
              alt="Printly"
              className="h-8 w-auto dark:hidden"
              height={256}
              priority
              src="/printly-logo-horizontal.svg"
              width={916}
            />
            <Image
              alt="Printly"
              className="hidden h-8 w-auto dark:block"
              height={256}
              priority
              src="/printly-logo-horizontal-negativo.svg"
              width={916}
            />
          </div>
          <Image
            alt="Printly"
            className="hidden size-8 group-data-[collapsible=icon]:block"
            height={256}
            priority
            src="/printly-simbolo.svg"
            width={256}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
              render={<Link href="/doar" />}
              tooltip="Apoie"
            >
              <Heart />
              <span>Apoie</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/configuracoes"}
              render={<Link href="/configuracoes" />}
              tooltip="Configurações"
            >
              <Settings />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator className="my-3" />
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer transition-colors hover:bg-rose-500 hover:text-white"
              onClick={handleLogout}
              tooltip="Sair"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
