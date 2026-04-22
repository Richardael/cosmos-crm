import { Link, useMatch } from "react-router";
import { useGetIdentity, useLogout, useTranslate } from "ra-core";
import {
  Building2,
  CircleDot,
  Kanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { TasksPage } from "../tasks/TasksPage";
import { ContactStatusesPage } from "../contactStatuses/ContactStatusesPage";

export const NeonSidebar = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const translate = useTranslate();
  const handleClick = () => {
    if (openMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 data-[slot=sidebar-menu-button]:!p-2"
            >
              <Link to="/" onClick={handleClick}>
                <Zap className="!size-5 text-primary shrink-0" />
                <span className="font-bold text-sm tracking-tight">
                  NEON CRM
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to="/"
                icon={LayoutDashboard}
                label={translate("ra.page.dashboard", { _: "Dashboard" })}
                end
                onClick={handleClick}
              />
              <NavItem
                to="/contacts"
                icon={Users}
                label={translate("resources.contacts.name", {
                  smart_count: 2,
                  _: "Contactos",
                })}
                onClick={handleClick}
              />
              <NavItem
                to="/deals"
                icon={Kanban}
                label={translate("resources.deals.name", {
                  smart_count: 2,
                  _: "Pipeline",
                })}
                onClick={handleClick}
              />
              <NavItem
                to="/companies"
                icon={Building2}
                label={translate("resources.companies.name", {
                  smart_count: 2,
                  _: "Empresas",
                })}
                onClick={handleClick}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Seguimiento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to={TasksPage.path}
                icon={ListTodo}
                label="Tareas"
                onClick={handleClick}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to="/whatsapp_messages"
                icon={MessageSquare}
                label="NeonBot"
                onClick={handleClick}
              />
              <NavItem
                to={ContactStatusesPage.path}
                icon={CircleDot}
                label="Estados"
                onClick={handleClick}
              />
              <NavItem
                to="/settings"
                icon={Settings}
                label={translate("crm.settings.title", { _: "Ajustes" })}
                onClick={handleClick}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NeonUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon: Icon, label, end, onClick }: NavItemProps) => {
  const match = useMatch({ path: to, end: end ?? false });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} tooltip={label}>
        <Link to={to} onClick={onClick} state={{ _scrollToTop: true }}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NeonUserFooter = () => {
  const { data: identity } = useGetIdentity();
  const logout = useLogout();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={identity?.avatar} role="presentation" />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
              {identity?.fullName?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
            <p className="text-xs font-medium truncate leading-none">
              {identity?.fullName ?? "Usuario"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 group-data-[collapsible=icon]:hidden shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
