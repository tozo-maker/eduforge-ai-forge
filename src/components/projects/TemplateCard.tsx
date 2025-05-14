
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectTemplate } from "@/types/project";
import { Book, BookOpen, FileText, FolderOpen, Grid2X2, ArrowRight, Eye } from "lucide-react";

interface TemplateCardProps {
  template: ProjectTemplate;
  onSelect?: () => void;
  onViewDetails?: () => void;
  className?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  "aria-label"?: string;
}

export function TemplateCard({ template, onSelect, onViewDetails, className, ...props }: TemplateCardProps) {
  const getTemplateIcon = () => {
    switch (template.icon) {
      case "book-open":
        return <BookOpen className="h-5 w-5" />;
      case "grid-2x2":
        return <Grid2X2 className="h-5 w-5" />;
      case "layout-list":
        return <Book className="h-5 w-5" />;
      case "folder":
        return <FolderOpen className="h-5 w-5" />;
      case "circle-check":
        return <FileText className="h-5 w-5" />;
      case "book":
        return <Book className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatProjectType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <Card 
      className={`overflow-hidden h-full flex flex-col transition-all hover:shadow-md cursor-pointer border-2 hover:border-primary/30 group ${className || ''}`}
      onClick={handleCardClick}
      {...props}
    >
      <CardHeader className="p-6">
        <div className="flex space-x-3 items-center">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {getTemplateIcon()}
          </div>
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="text-xs">
              {formatProjectType(template.type)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails();
          }}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button 
          className="group-hover:bg-primary gap-2" 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
        >
          Use Template <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TemplateCard;
