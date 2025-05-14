
import React from "react";
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
  useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Home, FolderOpen, Plus, BookOpen, Settings, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "My Projects", path: "/projects" },
    { icon: Plus, label: "New Project", path: "/projects/new" },
    { icon: BookOpen, label: "Templates", path: "/templates" },
    { icon: FileText, label: "My Content", path: "/content" },
  ];

  const renderMenuItem = (item: { icon: React.ElementType, label: string, path: string }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <SidebarMenuItem key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton 
              className={cn(
                "w-full justify-start gap-3", 
                active && "bg-accent text-accent-foreground font-medium"
              )}
              asChild
            >
              <Link to={item.path} aria-current={active ? "page" : undefined}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="z-50"
            hidden={state !== "collapsed"}
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">EduForge AI</span>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      className={cn(
                        "w-full justify-start gap-3", 
                        isActive("/settings") && "bg-accent text-accent-foreground font-medium"
                      )} 
                      asChild
                    >
                      <Link to="/settings" aria-current={isActive("/settings") ? "page" : undefined}>
                        <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right"
                    className="z-50" 
                    hidden={state !== "collapsed"}
                  >
                    Settings
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 mt-auto">
        <p className="text-xs text-muted-foreground">© 2025 EduForge AI</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
