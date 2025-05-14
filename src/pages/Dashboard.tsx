
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import { TemplateCard } from '@/components/projects/TemplateCard';
import projectTemplates from '@/data/projectTemplates';
import { BookOpen, FilePlus, FolderPlus, LayoutGrid, Plus, RefreshCw, Search } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects: recentProjects, isLoading, error, fetchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const handleRefresh = () => {
    fetchProjects();
  };

  // Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return recentProjects;
    return recentProjects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentProjects, searchQuery]);

  const emptyState = (
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
        <Skeleton key={i} className="h-[220px] w-full animate-pulse" />
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
        <Button asChild className="gap-2 self-start" size="sm">
          <Link to="/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      {/* Search - now visible on all screen sizes */}
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm" 
              onClick={handleRefresh}
              aria-label="Refresh projects"
            >
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
          <Card className="bg-muted/30 border-destructive/50 transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Projects</CardTitle>
              <CardDescription>There was a problem loading your projects. Please try again.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="w-full gap-2"
                aria-label="Retry loading projects"
              >
                <RefreshCw className="h-4 w-4" /> Retry Loading Projects
              </Button>
            </CardFooter>
          </Card>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.slice(0, 4).map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => { window.location.href = `/projects/${project.id}`; }}
                className="transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                tabIndex={0}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = `/projects/${project.id}`;
                  }
                }}
                aria-label={`Open ${project.name} project`}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">No Projects Found</CardTitle>
              <CardDescription>No projects match your search query. Try a different search term or create a new project.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="gap-2 mr-2"
              >
                Clear Search
              </Button>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-1" /> New Project
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          emptyState
        )}
      </div>

      {/* Featured Templates */}
      <div className="space-y-4 mt-8">
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
              className="transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              tabIndex={0}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = `/templates/${template.id}`;
                }
              }}
              aria-label={`Use ${template.name} template`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
