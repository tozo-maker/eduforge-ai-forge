
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectConfig } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, FileText, LayoutGrid, Layout, LayoutList, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: ProjectConfig;
  onClick?: () => void;
  className?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  "aria-label"?: string;
}

export function ProjectCard({ project, className, ...props }: ProjectCardProps) {
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
        return <LayoutGrid className="h-5 w-5" />;
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
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer border hover:border-primary/30 group ${className || ''}`}
      {...props}
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
        <Button 
          size="sm" 
          className="group-hover:bg-primary gap-2" 
          asChild
        >
          <Link to={`/projects/${project.id}`}>
            Open <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
