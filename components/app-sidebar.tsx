import * as React from "react";
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";

import { SearchForm } from "@/components/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Panel",
      url: "#",
      items: [{ title: "Dashboard", url: "/admin" }],
    },
    {
      title: "Catálogo",
      url: "#",
      items: [
        { title: "Productos", url: "/admin/productos", isActive: true },
        { title: "Crear producto", url: "/admin/productos/nuevo" },
      ],
    },
    {
      title: "Gestión",
      url: "#",
      items: [
        { title: "Categorías", url: "/admin/categorias" },
        { title: "Colecciones", url: "/admin/colecciones" },
        { title: "Color", url: "/admin/color" },
        { title: "Talla", url: "/admin/talla" },
      ],
    },
    {
      title: "Ventas",
      url: "#",
      items: [
        { title: "Leads de WhatsApp", url: "/admin/leads" },
        { title: "Carritos abandonados", url: "/admin/carritos" },
        { title: "Cupones", url: "/admin/cupones" },
      ],
    },
    {
      title: "Tienda",
      url: "#",
      items: [
        { title: "Configuración", url: "/admin/configuracion" },
        { title: "Notificaciones", url: "/admin/notificaciones" },
      ],
    },
    {
      title: "Sistema",
      url: "#",
      items: [
        { title: "Auditoría", url: "/admin/auditoria" },
        { title: "Mantenimiento", url: "/admin/mantenimiento" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">OZZY</span>
                  <span className="">Panel de administración</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
