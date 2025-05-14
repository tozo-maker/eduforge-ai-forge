
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
        {/* Removed search bar from header as it's now in the Dashboard directly */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path
                d="M8 1.5V4.5M8 11.5V14.5M3.5 8H0.5M15.5 8H12.5M13.3536 2.64645L11.2322 4.76777M4.76777 11.2322L2.64645 13.3536M13.3536 13.3536L11.2322 11.2322M4.76777 4.76777L2.64645 2.64645"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
