
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-bold text-xl text-edu-blue-600">EduForge AI</div>
        </div>
        <div className="hidden md:flex items-center gap-2 flex-1 ml-8 mr-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-full pl-8 bg-background"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">Help</Button>
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
