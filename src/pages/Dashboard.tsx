
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import { TemplateCard } from '@/components/projects/TemplateCard';
import projectTemplates from '@/data/projectTemplates';
import { BookOpen, FilePlus, FolderPlus, LayoutGrid, Plus, RefreshCw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects: recentProjects, isLoading, error, fetchProjects } = useProjects();
  
  const handleRefresh = () => {
    fetchProjects();
  };

  const emptyState = (
    <div className="py-20 text-center">
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
            <Plus className="h-4 w-4" /> New Project
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

  const loadingSkeletons = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-[220px] w-full" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! Manage your educational content projects.
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" className="text-sm" asChild>
              <Link to="/projects">View All</Link>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          loadingSkeletons
        ) : error ? (
          <Card className="bg-muted/20 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Projects</CardTitle>
              <CardDescription>There was a problem loading your projects. Please try again.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Retry Loading Projects
              </Button>
            </CardFooter>
          </Card>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.slice(0, 4).map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => { window.location.href = `/projects/${project.id}`; }}
              />
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>

      {/* Featured Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Templates</h2>
          <Button variant="ghost" size="sm" className="text-sm" asChild>
            <Link to="/templates">View All Templates</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projectTemplates.slice(0, 3).map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onSelect={() => { window.location.href = `/templates/${template.id}`; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
