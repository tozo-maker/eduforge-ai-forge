import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Link } from 'react-router-dom';
import { TemplateCard } from '@/components/projects/TemplateCard';
import projectTemplates from '@/data/projectTemplates';
import { BookOpen, FilePlus, FolderPlus, LayoutGrid, Plus, Settings } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects: recentProjects, isLoading, fetchProjects } = useProjects();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
        <Button variant="outline" className="gap-2">
          <LayoutGrid className="h-4 w-4" /> Browse Templates
        </Button>
      </div>
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
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="ghost" size="sm" className="text-sm" asChild>
            <Link to="/projects">View All</Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-2/3 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                <FilePlus className="h-5 w-5" />
              </div>
              Create New
            </CardTitle>
            <CardDescription>Start creating a new educational project</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Create Project
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                <BookOpen className="h-5 w-5" />
              </div>
              Templates
            </CardTitle>
            <CardDescription>Browse our collection of educational templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                <Settings className="h-5 w-5" />
              </div>
              Settings
            </CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/settings">Account Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projectTemplates.slice(0, 3).map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onSelect={() => console.log(`Selected template: ${template.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
