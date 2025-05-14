
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
  SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Home, BookOpen, FolderOpen, FileText, Settings, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">EduForge AI</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/dashboard") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/projects") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/projects">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>My Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/projects/new") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New Project</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/templates") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/templates">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/content") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/content">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn("w-full justify-start", isActive("/settings") && "bg-accent text-accent-foreground font-medium")} 
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 text-xs text-muted-foreground">
        <p>© 2025 EduForge AI</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
