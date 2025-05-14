
import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
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

  const navigationItems = [
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
      <SidebarMenuItem key={item.path} className="mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton 
              className={cn(
                "w-full justify-start gap-3", 
                active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"
              )}
              asChild
            >
              <Link to={item.path} aria-current={active ? "page" : undefined}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
      <SidebarContent className="py-4">
        <div className="mb-6 px-4">
          <div className="font-bold text-xl text-primary flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="group-data-[collapsible=icon]:hidden">EduForge AI</span>
          </div>
        </div>

        <div className="mt-6">
          <SidebarMenu>
            {navigationItems.map(renderMenuItem)}
          </SidebarMenu>
        </div>

        <div className="mt-6 px-3">
          <div className="py-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden px-4">
            Settings
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton 
                    className={cn(
                      "w-full justify-start gap-3", 
                      isActive("/settings") ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"
                    )} 
                    asChild
                  >
                    <Link to="/settings" aria-current={isActive("/settings") ? "page" : undefined}>
                      <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
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
        </div>
      </SidebarContent>
      <SidebarFooter className="py-3 px-4 mt-auto border-t">
        <p className="text-xs text-muted-foreground">© 2025 EduForge AI</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
