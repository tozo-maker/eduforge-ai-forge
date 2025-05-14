
import React from 'react';
import { ProjectConfig } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import { RefreshCw, Plus, FolderPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyProjectState } from './EmptyProjectState';

interface RecentProjectsProps {
  projects: ProjectConfig[];
  searchQuery: string;
  isLoading: boolean;
  error: Error | null;
  isRetrying: boolean;
  onRefresh: () => void;
  onClearSearch: () => void;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  searchQuery,
  isLoading,
  error,
  isRetrying,
  onRefresh,
  onClearSearch
}) => {
  const loadingSkeletons = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-[220px] w-full animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm" 
            onClick={onRefresh}
            disabled={isRetrying}
            aria-label="Refresh projects"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} /> 
            {isRetrying ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="ghost" size="sm" className="text-sm" asChild>
            <Link to="/projects">View All</Link>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        loadingSkeletons
      ) : error ? (
        <Card className="bg-muted/30 border-destructive/50 transition-colors hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Projects</CardTitle>
            <CardDescription>There was a problem loading your projects. Please try again.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="w-full gap-2"
              disabled={isRetrying}
              aria-label="Retry loading projects"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
              {isRetrying ? 'Retrying...' : 'Retry Loading Projects'}
            </Button>
          </CardFooter>
        </Card>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              tabIndex={0}
              aria-label={`Open ${project.name} project`}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = `/projects/${project.id}`;
                }
              }}
              onClick={() => { window.location.href = `/projects/${project.id}`; }}
              className="transition-all duration-200 hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
          ))}
        </div>
      ) : searchQuery ? (
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">No Projects Found</CardTitle>
            <CardDescription>No projects match your search query. Try a different search term or create a new project.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={onClearSearch}
              className="gap-2"
            >
              Clear Search
            </Button>
            <Button asChild className="gap-2">
              <Link to="/projects/new">
                <Plus className="h-4 w-4" /> New Project
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <EmptyProjectState />
      )}
    </div>
  );
};
