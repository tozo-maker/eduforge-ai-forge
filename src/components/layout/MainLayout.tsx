
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import { LanguageSelector } from "./LanguageSelector";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end p-2 bg-background border-b">
            <LanguageSelector />
          </div>
          <AppHeader />
          <main className="flex-1 p-6">
            <div className="container">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;
