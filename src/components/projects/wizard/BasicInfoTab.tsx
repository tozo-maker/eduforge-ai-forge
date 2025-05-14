
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectConfig } from '@/types/project';

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
  const grades = [
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
    { value: 'professional', label: 'Professional Development' },
  ];

  const subjects = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'language_arts', label: 'Language Arts' },
    { value: 'social_studies', label: 'Social Studies' },
    { value: 'foreign_language', label: 'Foreign Language' },
    { value: 'arts', label: 'Arts' },
    { value: 'physical_education', label: 'Physical Education' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'other', label: 'Other' },
  ];

  const approaches = [
    { value: 'direct_instruction', label: 'Direct Instruction' },
    { value: 'inquiry_based', label: 'Inquiry Based' },
    { value: 'project_based', label: 'Project Based' },
    { value: 'flipped_classroom', label: 'Flipped Classroom' },
    { value: 'differentiated', label: 'Differentiated' },
    { value: 'universal_design', label: 'Universal Design' },
    { value: 'socratic_method', label: 'Socratic Method' },
    { value: 'cooperative_learning', label: 'Cooperative Learning' },
  ];

  const assessments = [
    { value: 'formative', label: 'Formative' },
    { value: 'summative', label: 'Summative' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'performance_based', label: 'Performance Based' },
    { value: 'peer_assessment', label: 'Peer Assessment' },
    { value: 'self_assessment', label: 'Self Assessment' },
  ];

  const durations = [
    { value: '15_minutes', label: '15 Minutes' },
    { value: '30_minutes', label: '30 Minutes' },
    { value: '45_minutes', label: '45 Minutes' },
    { value: '60_minutes', label: '60 Minutes' },
    { value: '90_minutes', label: '90 Minutes' },
    { value: 'multi_day', label: 'Multi-Day' },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Project Details</h2>
        <p className="text-muted-foreground">Enter the basic information about your project</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectConfig.name || ''}
              onChange={(e) => handleConfigChange('name', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="project-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="project-description"
              placeholder="Briefly describe your project"
              value={projectConfig.description || ''}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={projectConfig.subject}
                onValueChange={(value) => handleConfigChange('subject', value)}
              >
                <SelectTrigger>
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
              <label className="text-sm font-medium">Grade Level</label>
              <Select
                value={projectConfig.gradeLevel}
                onValueChange={(value) => handleConfigChange('gradeLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Learning Objectives</label>
            {projectConfig.learningObjectives?.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={objective}
                  onChange={(e) => handleLearningObjectivesChange(index, e.target.value)}
                  placeholder="Enter a learning objective"
                  className="flex-1"
                />
                {projectConfig.learningObjectives!.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeLearningObjective(index)}
                    className="shrink-0"
                  >
                    &times;
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLearningObjective}
              className="mt-2"
            >
              Add Objective
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pedagogical Approach</label>
              <Select
                value={projectConfig.pedagogicalApproach}
                onValueChange={(value) => handleConfigChange('pedagogicalApproach', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approach" />
                </SelectTrigger>
                <SelectContent>
                  {approaches.map((approach) => (
                    <SelectItem key={approach.value} value={approach.value}>
                      {approach.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assessment Type</label>
              <Select
                value={projectConfig.assessmentType}
                onValueChange={(value) => handleConfigChange('assessmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.value} value={assessment.value}>
                      {assessment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <Select
              value={projectConfig.duration}
              onValueChange={(value) => handleConfigChange('duration', value)}
            >
              <SelectTrigger>
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
      </div>
    </>
  );
}

export default BasicInfoTab;
