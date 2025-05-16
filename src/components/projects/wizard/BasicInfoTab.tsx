
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { ProjectConfig, ProjectType, Subject, GradeLevel, PedagogicalApproach, AssessmentType, Duration } from '@/types/project';
import { SubjectSuggestions } from '@/components/projects/SubjectSuggestions'; 
import { AdaptiveWordCountCalculator } from '@/components/projects/AdaptiveWordCountCalculator';
import { LearningObjectivesGenerator } from '@/components/projects/LearningObjectivesGenerator';

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
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(true);
  const [showObjectivesGenerator, setShowObjectivesGenerator] = useState(false);

  const projectTypes: {value: ProjectType, label: string}[] = [
    {value: 'lesson_plan', label: 'Lesson Plan'},
    {value: 'course_module', label: 'Course Module'},
    {value: 'curriculum', label: 'Curriculum'},
    {value: 'assessment', label: 'Assessment'},
    {value: 'study_guide', label: 'Study Guide'}
  ];

  const subjects: {value: Subject, label: string}[] = [
    {value: 'mathematics', label: 'Mathematics'},
    {value: 'science', label: 'Science'},
    {value: 'language_arts', label: 'Language Arts'},
    {value: 'social_studies', label: 'Social Studies'},
    {value: 'foreign_language', label: 'Foreign Language'},
    {value: 'arts', label: 'Arts'},
    {value: 'physical_education', label: 'Physical Education'},
    {value: 'computer_science', label: 'Computer Science'},
    {value: 'other', label: 'Other'}
  ];

  const gradeLevels: {value: GradeLevel, label: string}[] = [
    {value: 'k', label: 'Kindergarten'},
    {value: '1st', label: '1st Grade'},
    {value: '2nd', label: '2nd Grade'},
    {value: '3rd', label: '3rd Grade'},
    {value: '4th', label: '4th Grade'},
    {value: '5th', label: '5th Grade'},
    {value: '6th', label: '6th Grade'},
    {value: '7th', label: '7th Grade'},
    {value: '8th', label: '8th Grade'},
    {value: '9th', label: '9th Grade'},
    {value: '10th', label: '10th Grade'},
    {value: '11th', label: '11th Grade'},
    {value: '12th', label: '12th Grade'},
    {value: 'higher_education', label: 'Higher Education'},
    {value: 'professional', label: 'Professional Development'}
  ];

  const pedagogicalApproaches: {value: PedagogicalApproach, label: string}[] = [
    {value: 'direct_instruction', label: 'Direct Instruction'},
    {value: 'inquiry_based', label: 'Inquiry Based'},
    {value: 'project_based', label: 'Project Based'},
    {value: 'flipped_classroom', label: 'Flipped Classroom'},
    {value: 'differentiated', label: 'Differentiated Instruction'},
    {value: 'universal_design', label: 'Universal Design for Learning'},
    {value: 'socratic_method', label: 'Socratic Method'},
    {value: 'cooperative_learning', label: 'Cooperative Learning'}
  ];

  const assessmentTypes: {value: AssessmentType, label: string}[] = [
    {value: 'formative', label: 'Formative'},
    {value: 'summative', label: 'Summative'},
    {value: 'diagnostic', label: 'Diagnostic'},
    {value: 'performance_based', label: 'Performance Based'},
    {value: 'peer_assessment', label: 'Peer Assessment'},
    {value: 'self_assessment', label: 'Self Assessment'}
  ];

  const durations: {value: Duration, label: string}[] = [
    {value: '15_minutes', label: '15 Minutes'},
    {value: '30_minutes', label: '30 Minutes'},
    {value: '45_minutes', label: '45 Minutes'},
    {value: '60_minutes', label: '60 Minutes'},
    {value: '90_minutes', label: '90 Minutes'},
    {value: 'multi_day', label: 'Multi-Day'}
  ];

  const handleSecondarySubject = (subject: Subject) => {
    // This would add a secondary subject to the configuration
    // For now, we'll just show a toast or alert, but this could be expanded
    // to create a multi-subject project
    alert(`Selected ${subject.replace('_', ' ')} as a secondary subject`);
  };

  const handleSelectObjectives = (objectives: string[]) => {
    // Replace current objectives with the selected ones
    const newObjectives = [...objectives];
    handleConfigChange('learningObjectives', newObjectives);
    setShowObjectivesGenerator(false);
  };

  // Show the AI generator button only when we have enough context
  const canGenerateObjectives = 
    !!projectConfig.name && 
    !!projectConfig.type && 
    !!projectConfig.subject && 
    !!projectConfig.gradeLevel;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input 
            id="name"
            value={projectConfig.name || ''}
            onChange={(e) => handleConfigChange('name', e.target.value)}
            placeholder="Enter project name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Project Type *</Label>
          <Select 
            value={projectConfig.type} 
            onValueChange={(value) => handleConfigChange('type', value as ProjectType)}
          >
            <SelectTrigger id="type">
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={projectConfig.description || ''}
          onChange={(e) => handleConfigChange('description', e.target.value)}
          placeholder="Enter a brief description of your project"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select 
            value={projectConfig.subject} 
            onValueChange={(value) => handleConfigChange('subject', value as Subject)}
          >
            <SelectTrigger id="subject">
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
          <Label htmlFor="gradeLevel">Grade Level *</Label>
          <Select 
            value={projectConfig.gradeLevel} 
            onValueChange={(value) => handleConfigChange('gradeLevel', value as GradeLevel)}
          >
            <SelectTrigger id="gradeLevel">
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
      
      {/* Subject suggestions component */}
      {projectConfig.subject && (
        <SubjectSuggestions
          selectedSubject={projectConfig.subject as Subject}
          gradeLevel={projectConfig.gradeLevel as GradeLevel}
          learningObjectives={projectConfig.learningObjectives || []}
          onSelectAdditionalSubject={handleSecondarySubject}
        />
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Learning Objectives *</Label>
          {canGenerateObjectives && (
            <Dialog open={showObjectivesGenerator} onOpenChange={setShowObjectivesGenerator}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <LearningObjectivesGenerator
                  projectName={projectConfig.name || ''}
                  projectType={projectConfig.type as ProjectType}
                  description={projectConfig.description || ''}
                  subject={projectConfig.subject as Subject}
                  gradeLevel={projectConfig.gradeLevel as GradeLevel}
                  onSelectObjectives={handleSelectObjectives}
                  onCancel={() => setShowObjectivesGenerator(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {(projectConfig.learningObjectives || []).map((objective, index) => (
          <div className="flex gap-2" key={index}>
            <Input
              value={objective}
              onChange={(e) => handleLearningObjectivesChange(index, e.target.value)}
              placeholder={`Objective ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeLearningObjective(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLearningObjective}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add Objective
        </Button>
      </div>
      
      {showAdditionalOptions && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pedagogicalApproach">Pedagogical Approach</Label>
            <Select 
              value={projectConfig.pedagogicalApproach} 
              onValueChange={(value) => handleConfigChange('pedagogicalApproach', value as PedagogicalApproach)}
            >
              <SelectTrigger id="pedagogicalApproach">
                <SelectValue placeholder="Select approach" />
              </SelectTrigger>
              <SelectContent>
                {pedagogicalApproaches.map((approach) => (
                  <SelectItem key={approach.value} value={approach.value}>
                    {approach.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assessmentType">Assessment Type</Label>
            <Select 
              value={projectConfig.assessmentType} 
              onValueChange={(value) => handleConfigChange('assessmentType', value as AssessmentType)}
            >
              <SelectTrigger id="assessmentType">
                <SelectValue placeholder="Select assessment type" />
              </SelectTrigger>
              <SelectContent>
                {assessmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select 
              value={projectConfig.duration} 
              onValueChange={(value) => handleConfigChange('duration', value as Duration)}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Word Count Calculator */}
      {projectConfig.type && projectConfig.gradeLevel && projectConfig.duration && (
        <div className="mt-6">
          <AdaptiveWordCountCalculator
            projectType={projectConfig.type as ProjectType}
            gradeLevel={projectConfig.gradeLevel as GradeLevel}
            duration={projectConfig.duration as Duration}
            structureType={projectConfig.contentStructure}
            learningObjectives={projectConfig.learningObjectives || []}
            pedagogicalApproach={projectConfig.pedagogicalApproach as PedagogicalApproach}
          />
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;
