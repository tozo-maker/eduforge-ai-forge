
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ProjectType, 
  Subject, 
  GradeLevel, 
  PedagogicalApproach, 
  CulturalContext, 
  AssessmentType, 
  Duration, 
  AccessibilityFeature, 
  ProjectConfig 
} from '@/types/project';
import { X, Plus, Sparkles } from 'lucide-react';
import { SubjectSuggestions } from '@/components/projects/SubjectSuggestions';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { learningObjectiveService } from '@/services/learningObjectiveService';
import { toast } from '@/hooks/use-toast';

interface BasicInfoTabProps {
  projectConfig: Partial<ProjectConfig>;
  handleConfigChange: (field: string, value: any) => void;
  handleLearningObjectivesChange: (index: number, value: string) => void;
  addLearningObjective: () => void;
  removeLearningObjective: (index: number) => void;
}

export function BasicInfoTab({
  projectConfig,
  handleConfigChange,
  handleLearningObjectivesChange,
  addLearningObjective,
  removeLearningObjective
}: BasicInfoTabProps) {
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: 'lesson_plan', label: 'Lesson Plan' },
    { value: 'course_module', label: 'Course Module' },
    { value: 'curriculum', label: 'Curriculum' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'study_guide', label: 'Study Guide' }
  ];

  const subjects: { value: Subject; label: string }[] = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'language_arts', label: 'Language Arts' },
    { value: 'social_studies', label: 'Social Studies' },
    { value: 'foreign_language', label: 'Foreign Language' },
    { value: 'arts', label: 'Arts' },
    { value: 'physical_education', label: 'Physical Education' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'other', label: 'Other' }
  ];

  const gradeLevels: { value: GradeLevel; label: string }[] = [
    { value: 'k', label: 'Kindergarten' },
    { value: '1st', label: '1st Grade' },
    { value: '2nd', label: '2nd Grade' },
    { value: '3rd', label: '3rd Grade' },
    { value: '4th', label: '4th Grade' },
    { value: '5th', label: '5th Grade' },
    { value: '6th', label: '6th Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '8th', label: '8th Grade' },
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' },
    { value: 'higher_education', label: 'Higher Education' },
    { value: 'professional', label: 'Professional' }
  ];

  const generateLearningObjectives = async () => {
    try {
      if (!projectConfig.name || !projectConfig.type || !projectConfig.subject || !projectConfig.gradeLevel) {
        toast({
          title: "Missing Information",
          description: "Please fill in project name, type, subject and grade level before generating objectives.",
          variant: "destructive"
        });
        return;
      }

      setIsGeneratingObjectives(true);
      toast({
        title: "Generating Objectives",
        description: "AI is creating learning objectives based on your project details...",
      });

      const objectives = await learningObjectiveService.generateLearningObjectives(
        projectConfig.name,
        projectConfig.type as ProjectType,
        projectConfig.description || "",
        projectConfig.subject as Subject,
        projectConfig.gradeLevel as GradeLevel
      );

      if (objectives && objectives.length > 0) {
        // Replace all existing objectives with the generated ones
        handleConfigChange('learningObjectives', objectives);
        
        toast({
          title: "Objectives Generated",
          description: `Successfully generated ${objectives.length} learning objectives.`,
        });
      } else {
        throw new Error("No objectives were generated");
      }
    } catch (error) {
      console.error("Error generating learning objectives:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate learning objectives. Please add them manually.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Define the basic information about your educational project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input 
              id="project-name"
              placeholder="Enter a name for your project"
              value={projectConfig.name || ''}
              onChange={(e) => handleConfigChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea 
              id="project-description"
              placeholder="Briefly describe the purpose and scope of this project"
              value={projectConfig.description || ''}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type *</Label>
              <Select 
                value={projectConfig.type} 
                onValueChange={(value) => handleConfigChange('type', value)}
              >
                <SelectTrigger id="project-type">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-subject">Subject *</Label>
              <Select 
                value={projectConfig.subject} 
                onValueChange={(value) => handleConfigChange('subject', value)}
              >
                <SelectTrigger id="project-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade-level">Grade Level *</Label>
              <Select 
                value={projectConfig.gradeLevel} 
                onValueChange={(value) => handleConfigChange('gradeLevel', value)}
              >
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {projectConfig.subject && projectConfig.gradeLevel && projectConfig.learningObjectives && (
        <SubjectSuggestions
          selectedSubject={projectConfig.subject as Subject}
          gradeLevel={projectConfig.gradeLevel as GradeLevel}
          learningObjectives={projectConfig.learningObjectives}
        />
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>
              Define what students should be able to do after completing this content
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateLearningObjectives}
                  disabled={isGeneratingObjectives}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isGeneratingObjectives ? "Generating..." : "Generate"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate AI-powered learning objectives based on your project details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectConfig.learningObjectives?.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Objective ${index + 1}`}
                value={objective}
                onChange={(e) => handleLearningObjectivesChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLearningObjective(index)}
                disabled={projectConfig.learningObjectives?.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={addLearningObjective}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Objective
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
