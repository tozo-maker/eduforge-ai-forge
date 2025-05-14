
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FolderPlus, LayoutGrid } from 'lucide-react';

export const EmptyProjectState: React.FC = () => {
  return (
    <div className="py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <FolderPlus className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">Create Your First Project</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Get started by creating a new educational content project or choose from our templates.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button asChild className="gap-2">
          <Link to="/projects/new">
            <FolderPlus className="h-4 w-4" /> New Project
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/templates">
            <LayoutGrid className="h-4 w-4" /> Browse Templates
          </Link>
        </Button>
      </div>
    </div>
  );
};
