
import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hidden md:flex" />
          <div className="font-bold text-xl text-edu-blue-600">EduForge AI</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
