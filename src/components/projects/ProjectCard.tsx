
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectConfig } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, FileText, Grid2X2, Layout, LayoutList, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: ProjectConfig;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getProjectIcon = () => {
    switch (project.type) {
      case "lesson_plan":
        return <BookOpen className="h-5 w-5" />;
      case "course_module":
        return <LayoutList className="h-5 w-5" />;
      case "curriculum":
        return <Layout className="h-5 w-5" />;
      case "assessment":
        return <FileText className="h-5 w-5" />;
      case "study_guide":
        return <Grid2X2 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatProjectType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getSubjectLabel = (subject: string) => {
    return subject.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer border-2 hover:border-primary/30 group" 
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Open ${project.name} project`}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    >
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex space-x-2 items-center">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              {getProjectIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>
                {formatProjectType(project.type)} • {getSubjectLabel(project.subject)}
              </CardDescription>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {project.updatedAt && formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      {project.description && (
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="p-6 pt-0 flex justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="text-xs bg-accent rounded-full px-2 py-1">
            {project.gradeLevel}
          </div>
          <div className="text-xs bg-accent rounded-full px-2 py-1">
            {project.duration.replace('_', ' ')}
          </div>
        </div>
        <Button size="sm" className="group-hover:bg-primary gap-2">
          Open <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
