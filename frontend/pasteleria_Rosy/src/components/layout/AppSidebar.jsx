import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { NAV_SECTIONS } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useAlertsCount } from "@/hooks/useAlertsCount";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const { data: alertsCount } = useAlertsCount();

  const [openSections, setOpenSections] = useState(() => NAV_SECTIONS.map((section) => section.key));

  function toggleSection(key) {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  const visibleSections = NAV_SECTIONS.filter((section) => !section.adminOnly || isAdmin);
  const initials = `${user?.name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src="/logo-badge.png" alt="Rosy Pasteles" className="size-10 shrink-0 rounded-xl object-cover" />
          <div>
            <p className="text-sm font-semibold text-foreground">Rosy Pasteles</p>
            <p className="text-xs text-muted-foreground">SaaS v2.4 PEPS Cloud</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSections.includes(section.key);
            const items = section.items.filter((item) => !item.adminOnly || isAdmin);
            const sectionIsActive = items.some((item) => item.to === location.pathname);

            return (
              <SidebarMenuItem key={section.key}>
                <SidebarMenuButton isActive={sectionIsActive} onClick={() => toggleSection(section.key)}>
                  <Icon />
                  <span className="flex-1 truncate">{section.title}</span>
                  {section.badgeKey === "alerts" && alertsCount > 0 ? (
                    <Badge variant="destructive" className="h-5 min-w-5 justify-center px-1">
                      {alertsCount}
                    </Badge>
                  ) : null}
                  <ChevronDown className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
                </SidebarMenuButton>

                {isOpen ? (
                  <SidebarMenuSub>
                    {items.map((item) => {
                      const isItemActive = location.pathname === item.to;
                      return (
                        <SidebarMenuSubItem key={item.to}>
                          <SidebarMenuSubButton
                            render={<Link to={item.to} />}
                            isActive={isItemActive}
                            className={cn(
                              isItemActive &&
                                "data-active:bg-brand-tertiary/35! data-active:text-brand-primary! data-active:font-medium!"
                            )}
                          >
                            <span className="truncate">{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-3 py-1.5 text-xs font-medium text-brand-accent">
          <ShieldCheck className="size-3.5" />
          Rol: {isAdmin ? "Administrador" : "Operador"}
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border p-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-xs font-semibold text-brand-primary">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link
            to="/configuracion"
            title="Configuración"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-4" />
          </Link>
          <button
            type="button"
            title="Cerrar sesión"
            onClick={logout}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
