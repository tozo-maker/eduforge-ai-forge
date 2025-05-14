
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const EmptyProjectState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary">
          <path d="M4 20H20M4 4H10M4 8H8M4 12H14M14 4H20V16H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-2xl font-bold mb-2">Create Your First Project</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Get started by creating a new educational content project or choose from our templates.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button className="gap-2" size="lg" asChild>
          <Link to="/projects/new">
            <Plus className="h-5 w-5" />
            New Project
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/templates">
            Browse Templates
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyProjectState;
