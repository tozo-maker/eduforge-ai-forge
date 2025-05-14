
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { TemplateCard } from "@/components/projects/TemplateCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import projectTemplates from "@/data/projectTemplates";
import { ProjectConfig, ProjectTemplate } from "@/types/project";
import ProjectConfigurator from "@/components/projects/ProjectConfigurator";
import { BookOpen, FolderOpen, Plus } from "lucide-react";

const Index = () => {
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | undefined>();
  const [recentProjects, setRecentProjects] = useState<ProjectConfig[]>([]);

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowConfigurator(true);
  };

  const handleCreateProject = (config: ProjectConfig) => {
    // In a real app, we would save this to a database
    const newProject = {
      ...config,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setRecentProjects([newProject, ...recentProjects]);
    setShowConfigurator(false);
    setSelectedTemplate(undefined);
  };

  if (showConfigurator) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-6">
          <ProjectConfigurator 
            template={selectedTemplate} 
            onSave={handleCreateProject}
            onCancel={() => {
              setShowConfigurator(false);
              setSelectedTemplate(undefined);
            }} 
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to EduForge AI</h1>
            <p className="text-muted-foreground mt-1">
              Create educational content powered by AI. Get started by selecting a template.
            </p>
          </div>
          <Button onClick={() => setShowConfigurator(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Button variant="ghost" size="sm" className="text-sm">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                  <Plus className="h-5 w-5" />
                </div>
                Create New
              </CardTitle>
              <CardDescription>Start creating a new educational project</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setShowConfigurator(true)}>
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
              <Button className="w-full" variant="outline">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2">
                  <FolderOpen className="h-5 w-5" />
                </div>
                My Projects
              </CardTitle>
              <CardDescription>Access all your existing projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View All Projects
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Templates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projectTemplates.slice(0, 6).map(template => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onSelect={() => handleTemplateSelect(template)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
