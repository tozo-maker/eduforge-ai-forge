
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTemplate } from "@/types/project";
import { TemplateCard } from "@/components/projects/TemplateCard";
import { TemplatePreview } from "@/components/projects/TemplatePreview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookOpen, FileText, GraduationCap, BookMarked, Layers, Search, Wand, MessageCircle, LightbulbIcon } from "lucide-react";
import { analyzeUserGoals } from "@/services/aiGuidance";
import { Textarea } from "@/components/ui/textarea";

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
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [goalDescription, setGoalDescription] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
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

  const handleViewTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
  };

  const handleAskAi = () => {
    setIsAiThinking(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const recommendation = analyzeUserGoals({ description: goalDescription });
      setAiRecommendation(recommendation);
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Choose a Template</h2>
              <p className="text-muted-foreground mt-1">
                Select a template to start creating your educational content
              </p>
            </div>
            <div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Wand className="h-4 w-4" />
                    AI Project Guidance
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <LightbulbIcon className="h-5 w-5" />
                      AI Project Assistant
                    </SheetTitle>
                    <SheetDescription>
                      Describe your teaching goals and get personalized template recommendations
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">What are you trying to create?</h3>
                      <Textarea
                        placeholder="E.g., I need to create a science lesson about plants for 3rd graders with hands-on activities..."
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleAskAi} 
                      className="w-full gap-2" 
                      disabled={!goalDescription.trim() || isAiThinking}
                    >
                      {isAiThinking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          Get Recommendations
                        </>
                      )}
                    </Button>

                    {aiRecommendation && (
                      <div className="space-y-4 pt-2">
                        <div className="rounded-md bg-muted/50 p-3">
                          <h4 className="font-medium">AI Recommendation:</h4>
                          <p className="text-sm mt-1">{aiRecommendation.explanation}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recommended Templates:</h4>
                          <div className="grid gap-3">
                            {aiRecommendation.recommendedTemplates.map((template: ProjectTemplate) => (
                              <Card key={template.id} className="p-2 hover:bg-muted/30 cursor-pointer" onClick={() => onSelectTemplate(template)}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground">{formatProjectType(template.type)}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="gap-1">
                                    <span>Use</span>
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Best Practices:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {aiRecommendation.bestPractices.map((practice: string, index: number) => (
                              <li key={index} className="text-sm">{practice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
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
                    <div key={template.id}>
                      <Dialog>
                        <TemplateCard
                          template={template}
                          onSelect={() => onSelectTemplate(template)}
                          onViewDetails={() => handleViewTemplate(template)}
                          aria-label={`Select ${template.name} template`}
                        />
                        <DialogTrigger className="hidden">View Template</DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>
                              {template.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="pt-4">
                            <TemplatePreview template={template} />
                          </div>
                          <div className="flex justify-end mt-6">
                            <Button onClick={() => onSelectTemplate(template)}>Use This Template</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
