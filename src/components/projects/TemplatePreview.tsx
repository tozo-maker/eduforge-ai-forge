
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ProjectTemplate, ProjectType } from '@/types/project';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Layout, List, CheckSquare } from "lucide-react";

interface TemplatePreviewProps {
  template: ProjectTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Tabs defaultValue="structure">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="structure" className="flex gap-2">
              <Layout className="h-4 w-4" /> Structure
            </TabsTrigger>
            <TabsTrigger value="sample" className="flex gap-2">
              <FileText className="h-4 w-4" /> Sample Content
            </TabsTrigger>
            <TabsTrigger value="components" className="flex gap-2">
              <List className="h-4 w-4" /> Components
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="structure" className="mt-0 space-y-4">
              <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                <StructurePreview type={template.type} />
              </AspectRatio>
              <div>
                <h3 className="text-lg font-medium">{template.name} Structure</h3>
                <p className="text-sm text-muted-foreground">{getStructureDescription(template.type)}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sample" className="mt-0">
              <div className="border rounded-md p-4 space-y-4">
                <SampleContent type={template.type} />
              </div>
            </TabsContent>
            
            <TabsContent value="components" className="mt-0">
              <div className="space-y-3">
                {getTemplateComponents(template.type).map((component, index) => (
                  <div key={index} className="flex items-start p-2 border rounded-md">
                    <CheckSquare className="h-4 w-4 mr-2 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">{component.title}</h4>
                      <p className="text-sm text-muted-foreground">{component.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const StructurePreview = ({ type }: { type: ProjectType }) => {
  // This would be replaced with actual structure visualizations
  const getStructureComponent = () => {
    switch (type) {
      case 'lesson_plan':
        return (
          <div className="h-full flex flex-col p-4">
            <div className="h-1/5 w-full bg-primary/20 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Lesson Introduction</span>
            </div>
            <div className="h-2/5 w-full bg-primary/30 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Main Activities</span>
            </div>
            <div className="h-1/5 w-full bg-primary/20 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Assessment</span>
            </div>
            <div className="h-1/5 w-full bg-primary/10 rounded-md flex items-center justify-center">
              <span className="font-medium text-xs">Conclusion & Extensions</span>
            </div>
          </div>
        );
      case 'course_module':
        return (
          <div className="h-full p-4">
            <div className="h-1/6 w-full bg-primary/20 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Module Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 h-4/6 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-primary/30 rounded-md flex items-center justify-center">
                  <span className="font-medium text-xs">Lesson {i}</span>
                </div>
              ))}
            </div>
            <div className="h-1/6 w-full bg-primary/20 rounded-md flex items-center justify-center">
              <span className="font-medium text-xs">Module Assessment</span>
            </div>
          </div>
        );
      case 'assessment':
        return (
          <div className="h-full flex flex-col p-4">
            <div className="h-1/6 w-full bg-primary/20 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Instructions</span>
            </div>
            <div className="h-4/6 w-full bg-primary/30 rounded-md mb-2 flex flex-col p-2 gap-2">
              <div className="h-1/5 w-full bg-white/30 rounded flex items-center justify-center">
                <span className="font-medium text-xs">Question 1</span>
              </div>
              <div className="h-1/5 w-full bg-white/30 rounded flex items-center justify-center">
                <span className="font-medium text-xs">Question 2</span>
              </div>
              <div className="h-1/5 w-full bg-white/30 rounded flex items-center justify-center">
                <span className="font-medium text-xs">Question 3</span>
              </div>
              <div className="h-1/5 w-full bg-white/30 rounded flex items-center justify-center">
                <span className="font-medium text-xs">Question 4</span>
              </div>
            </div>
            <div className="h-1/6 w-full bg-primary/10 rounded-md flex items-center justify-center">
              <span className="font-medium text-xs">Scoring Guide</span>
            </div>
          </div>
        );
      case 'study_guide':
        return (
          <div className="h-full flex flex-col p-4">
            <div className="h-1/6 w-full bg-primary/20 rounded-md mb-2 flex items-center justify-center">
              <span className="font-medium text-xs">Key Concepts</span>
            </div>
            <div className="flex gap-2 h-4/6 mb-2">
              <div className="w-1/3 bg-primary/30 rounded-md flex items-center justify-center">
                <span className="font-medium text-xs">Topic 1</span>
              </div>
              <div className="w-2/3 flex flex-col gap-2">
                <div className="h-1/3 bg-primary/10 rounded-md flex items-center justify-center">
                  <span className="font-medium text-xs">Notes</span>
                </div>
                <div className="h-1/3 bg-primary/10 rounded-md flex items-center justify-center">
                  <span className="font-medium text-xs">Practice</span>
                </div>
                <div className="h-1/3 bg-primary/10 rounded-md flex items-center justify-center">
                  <span className="font-medium text-xs">Examples</span>
                </div>
              </div>
            </div>
            <div className="h-1/6 w-full bg-primary/20 rounded-md flex items-center justify-center">
              <span className="font-medium text-xs">Review Questions</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Preview not available
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full bg-muted-foreground/5">
      {getStructureComponent()}
    </div>
  );
};

const SampleContent = ({ type }: { type: ProjectType }) => {
  switch (type) {
    case 'lesson_plan':
      return (
        <>
          <div>
            <h3 className="font-semibold">Properties of Matter</h3>
            <p className="text-muted-foreground text-sm">Grade 5 Science • 45 minutes</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Learning Objectives:</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Describe the properties of matter including mass, volume, and density</li>
              <li>Differentiate between physical and chemical properties</li>
              <li>Conduct simple experiments to observe properties of matter</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Engage (5 minutes):</h4>
            <p className="text-sm">Display a variety of objects with different properties. Ask students to think about what makes each object unique and how we might describe them scientifically.</p>
          </div>
        </>
      );
    case 'assessment':
      return (
        <>
          <div>
            <h3 className="font-semibold">Fractions Assessment</h3>
            <p className="text-muted-foreground text-sm">Grade 4 Mathematics • 30 minutes</p>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold">1. Equivalent Fractions</h4>
              <p className="text-sm">Circle the fraction that is equivalent to 2/4:</p>
              <p className="text-sm">a) 1/4   b) 1/2   c) 3/4   d) 1/8</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">2. Adding Fractions</h4>
              <p className="text-sm">Calculate: 1/4 + 2/4 = _____</p>
            </div>
          </div>
        </>
      );
    default:
      return (
        <div className="py-8 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Sample content preview will appear here.</p>
        </div>
      );
  }
};

const getStructureDescription = (type: ProjectType): string => {
  switch (type) {
    case 'lesson_plan':
      return "This template follows a structured format with clear sections for objectives, activities, assessments, and extensions. Ideal for delivering focused classroom instruction.";
    case 'course_module':
      return "Organized as a collection of related lessons with module-level objectives, assessments, and resources. Designed for coherent, multi-day learning experiences.";
    case 'assessment':
      return "Includes a variety of question types, clear instructions, and scoring guidelines. Can be adapted for formative or summative assessment purposes.";
    case 'study_guide':
      return "Presents information in a user-friendly format with key concepts, examples, practice problems, and self-check questions for independent learning.";
    default:
      return "This template provides a structured format for educational content creation.";
  }
};

const getTemplateComponents = (type: ProjectType): {title: string; description: string}[] => {
  switch (type) {
    case 'lesson_plan':
      return [
        {title: "Learning Objectives", description: "Clear, measurable objectives aligned to standards"},
        {title: "Engagement Activity", description: "Hook to capture student interest and activate prior knowledge"},
        {title: "Direct Instruction", description: "Teacher-led presentation of key concepts"},
        {title: "Guided Practice", description: "Supported application of new knowledge"},
        {title: "Independent Practice", description: "Individual student work to demonstrate understanding"},
        {title: "Formative Assessment", description: "Checks for understanding throughout the lesson"},
        {title: "Closure", description: "Summary of learning and preview of future lessons"},
        {title: "Differentiation", description: "Modifications for different learning needs"}
      ];
    case 'course_module':
      return [
        {title: "Module Overview", description: "Introduction and big picture goals"},
        {title: "Learning Sequence", description: "Progressive series of lessons"},
        {title: "Resources Bank", description: "Materials needed for all lessons"},
        {title: "Lesson Plans", description: "Detailed instructions for each lesson"},
        {title: "Module Assessment", description: "Comprehensive evaluation of learning"},
        {title: "Extension Activities", description: "Additional challenges for advanced learners"}
      ];
    case 'assessment':
      return [
        {title: "Instructions", description: "Clear directions for students"},
        {title: "Multiple Choice", description: "Selected-response questions"},
        {title: "Short Answer", description: "Brief constructed responses"},
        {title: "Extended Response", description: "In-depth written answers"},
        {title: "Rubrics", description: "Scoring guides for constructed responses"},
        {title: "Answer Key", description: "Correct answers and explanations"}
      ];
    case 'study_guide':
      return [
        {title: "Key Concepts", description: "Essential terminology and ideas"},
        {title: "Visual Aids", description: "Diagrams, charts, and graphs"},
        {title: "Example Problems", description: "Step-by-step worked examples"},
        {title: "Practice Exercises", description: "Activities to reinforce learning"},
        {title: "Review Questions", description: "Self-check for understanding"}
      ];
    default:
      return [
        {title: "Content Sections", description: "Organized divisions of material"},
        {title: "Learning Activities", description: "Engagement opportunities"},
        {title: "Assessment Components", description: "Ways to check understanding"}
      ];
  }
};

export default TemplatePreview;
