
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import { TemplateCard } from '@/components/projects/TemplateCard';
import projectTemplates from '@/data/projectTemplates';
import { RefreshCw, Plus, Search, ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { EmptyProjectState } from '@/components/dashboard/EmptyProjectState';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects: recentProjects, isLoading, error, fetchProjects, isRetrying } = useProjects();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return recentProjects;
    return recentProjects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentProjects, searchQuery]);

  // Create proper event handlers that call fetchProjects
  const handleRefresh = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! Manage your educational content projects.
        </p>
      </div>

      {/* Search Section */}
      <div className="w-full max-w-lg relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm gap-2" 
              onClick={handleRefresh}
              disabled={isRetrying}
              aria-label="Refresh projects"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <Button variant="ghost" size="sm" className="text-sm" asChild>
              <Link to="/projects">View All</Link>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="text-lg font-semibold text-destructive">Error Loading Projects</h3>
            <p className="text-muted-foreground mt-2">There was a problem loading your projects. Please try again.</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4 gap-2"
              disabled={isRetrying}
              aria-label="Retry loading projects"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
              {isRetrying ? 'Retrying...' : 'Retry Loading Projects'}
            </Button>
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.slice(0, 6).map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                tabIndex={0}
                aria-label={`Open ${project.name} project`}
                className="transition-all duration-200 hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="rounded-lg border bg-muted/20 p-6">
            <h3 className="text-lg font-semibold">No Projects Found</h3>
            <p className="text-muted-foreground mt-2">No projects match your search query. Try a different search term or create a new project.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="gap-2"
              >
                Clear Search
              </Button>
              <Button asChild className="gap-2">
                <Link to="/projects/new">
                  <Plus className="h-4 w-4" /> New Project
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <EmptyProjectState />
        )}
      </div>

      {/* Featured Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Templates</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/templates">View All Templates</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectTemplates.slice(0, 3).map(template => (
            <div key={template.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {template.icon === "BookOpen" && <BookIcon />}
                    {template.icon === "LayoutGrid" && <LayoutGridIcon />}
                    {template.icon === "FileText" && <FileTextIcon />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.type}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description}</p>
                <Button variant="outline" className="w-full gap-2 justify-center" asChild>
                  <Link to={`/templates/${template.id}`}>
                    Use Template <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper components for template icons
const BookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20V2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

const LayoutGridIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
  <path d="M3 3H10V10H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M14 3H21V10H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3 14H10V21H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M14 14H21V21H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

const FileTextIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export default Dashboard;
