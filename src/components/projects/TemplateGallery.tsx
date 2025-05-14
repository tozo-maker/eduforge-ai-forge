
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTemplate } from "@/types/project";
import { TemplateCard } from "@/components/projects/TemplateCard";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, GraduationCap, BookMarked, Layers, Search } from "lucide-react";

interface TemplateGalleryProps {
  templates: ProjectTemplate[];
  onSelectTemplate: (template: ProjectTemplate) => void;
}

// Group templates by type
const groupTemplatesByType = (templates: ProjectTemplate[]) => {
  const grouped: Record<string, ProjectTemplate[]> = {
    all: templates,
    lesson_plan: [],
    course_module: [],
    assessment: [],
    study_guide: [],
    curriculum: [],
  };

  templates.forEach(template => {
    if (grouped[template.type]) {
      grouped[template.type].push(template);
    }
  });

  return grouped;
};

export function TemplateGallery({ templates, onSelectTemplate }: TemplateGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const groupedTemplates = groupTemplatesByType(templates);
  
  const filteredTemplates = (templates: ProjectTemplate[]) => {
    if (!searchQuery) return templates;
    return templates.filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatProjectType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Choose a Template</h2>
          <p className="text-muted-foreground mt-1">
            Select a template to start creating your educational content
          </p>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>All Templates</span>
            </TabsTrigger>
            <TabsTrigger value="lesson_plan" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Lesson Plans</span>
            </TabsTrigger>
            <TabsTrigger value="course_module" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Course Modules</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="study_guide" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              <span>Study Guides</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <TabsContent key={type} value={type} className="mt-0">
              {filteredTemplates(typeTemplates).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates(typeTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => onSelectTemplate(template)}
                      aria-label={`Select ${template.name} template`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No templates found</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    No {type !== 'all' ? formatProjectType(type) : ''} templates match your search criteria. 
                    Try adjusting your search or browse all templates.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TemplateGallery;
