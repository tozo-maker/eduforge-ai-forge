
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
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { FeaturedTemplates } from '@/components/dashboard/FeaturedTemplates';
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

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} />

      {/* Search - always visible */}
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

      {/* Recent Projects Section */}
      <RecentProjects 
        projects={filteredProjects}
        searchQuery={searchQuery}
        isLoading={isLoading}
        error={error}
        isRetrying={isRetrying}
        onRefresh={fetchProjects}
        onClearSearch={() => setSearchQuery('')}
      />

      {/* Featured Templates Section */}
      <FeaturedTemplates templates={projectTemplates.slice(0, 3)} />
    </div>
  );
};

export default Dashboard;
