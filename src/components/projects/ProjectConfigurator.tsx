
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectConfig, ProjectTemplate, AccessibilityFeature } from "@/types/project";
import { Label } from "@/components/ui/label";

interface ProjectConfiguratorProps {
  template?: ProjectTemplate;
  onSave: (config: ProjectConfig) => void;
  onCancel: () => void;
}

const GRADE_LEVELS = [
  { value: "k", label: "Kindergarten" },
  { value: "1st", label: "1st Grade" },
  { value: "2nd", label: "2nd Grade" },
  { value: "3rd", label: "3rd Grade" },
  { value: "4th", label: "4th Grade" },
  { value: "5th", label: "5th Grade" },
  { value: "6th", label: "6th Grade" },
  { value: "7th", label: "7th Grade" },
  { value: "8th", label: "8th Grade" },
  { value: "9th", label: "9th Grade" },
  { value: "10th", label: "10th Grade" },
  { value: "11th", label: "11th Grade" },
  { value: "12th", label: "12th Grade" },
  { value: "higher_education", label: "Higher Education" },
  { value: "professional", label: "Professional" },
];

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "language_arts", label: "Language Arts" },
  { value: "social_studies", label: "Social Studies" },
  { value: "foreign_language", label: "Foreign Language" },
  { value: "arts", label: "Arts" },
  { value: "physical_education", label: "Physical Education" },
  { value: "computer_science", label: "Computer Science" },
  { value: "other", label: "Other" },
];

const PEDAGOGICAL_APPROACHES = [
  { value: "direct_instruction", label: "Direct Instruction" },
  { value: "inquiry_based", label: "Inquiry-Based Learning" },
  { value: "project_based", label: "Project-Based Learning" },
  { value: "flipped_classroom", label: "Flipped Classroom" },
  { value: "differentiated", label: "Differentiated Instruction" },
  { value: "universal_design", label: "Universal Design for Learning" },
  { value: "socratic_method", label: "Socratic Method" },
  { value: "cooperative_learning", label: "Cooperative Learning" },
];

const CULTURAL_CONTEXTS = [
  { value: "general", label: "General" },
  { value: "multicultural", label: "Multicultural" },
  { value: "indigenous", label: "Indigenous" },
  { value: "culturally_responsive", label: "Culturally Responsive" },
  { value: "global", label: "Global" },
];

const ACCESSIBILITY_FEATURES = [
  { value: "screen_reader_friendly", label: "Screen Reader Friendly" },
  { value: "simplified_language", label: "Simplified Language" },
  { value: "high_contrast", label: "High Contrast" },
  { value: "alternative_text", label: "Alternative Text" },
  { value: "closed_captioning", label: "Closed Captioning" },
  { value: "multi_sensory", label: "Multi-Sensory" },
];

const ASSESSMENT_TYPES = [
  { value: "formative", label: "Formative" },
  { value: "summative", label: "Summative" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "performance_based", label: "Performance-Based" },
  { value: "peer_assessment", label: "Peer Assessment" },
  { value: "self_assessment", label: "Self Assessment" },
];

const DURATIONS = [
  { value: "15_minutes", label: "15 Minutes" },
  { value: "30_minutes", label: "30 Minutes" },
  { value: "45_minutes", label: "45 Minutes" },
  { value: "60_minutes", label: "60 Minutes" },
  { value: "90_minutes", label: "90 Minutes" },
  { value: "multi_day", label: "Multi-Day" },
];

export function ProjectConfigurator({ template, onSave, onCancel }: ProjectConfiguratorProps) {
  const defaultConfig: ProjectConfig = {
    name: template?.name || "",
    description: "",
    type: template?.defaultConfig?.type || "lesson_plan",
    subject: template?.defaultConfig?.subject || "mathematics",
    gradeLevel: template?.defaultConfig?.gradeLevel || "6th",
    standards: [],
    learningObjectives: [],
    pedagogicalApproach: template?.defaultConfig?.pedagogicalApproach || "direct_instruction",
    culturalContext: template?.defaultConfig?.culturalContext || "general",
    accessibility: template?.defaultConfig?.accessibility || [],
    assessmentType: template?.defaultConfig?.assessmentType || "formative",
    duration: template?.defaultConfig?.duration || "45_minutes",
  };

  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [objective, setObjective] = useState("");

  const handleAddObjective = () => {
    if (objective.trim()) {
      setConfig({
        ...config,
        learningObjectives: [...config.learningObjectives, objective.trim()],
      });
      setObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setConfig({
      ...config,
      learningObjectives: config.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const handleAccessibilityChange = (feature: AccessibilityFeature, checked: boolean) => {
    if (checked) {
      setConfig({
        ...config,
        accessibility: [...config.accessibility, feature],
      });
    } else {
      setConfig({
        ...config,
        accessibility: config.accessibility.filter(item => item !== feature),
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Configure Your Project</CardTitle>
        <CardDescription>
          {template 
            ? `Creating a ${template.name} project. Customize the settings below.`
            : "Set up your educational project with the following parameters."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input 
              id="name"
              value={config.name} 
              onChange={e => setConfig({...config, name: e.target.value})}
              placeholder="Enter project name" 
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={config.description || ""} 
              onChange={e => setConfig({...config, description: e.target.value})}
              placeholder="Brief description of your project" 
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={config.subject} 
                onValueChange={value => setConfig({...config, subject: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select 
                value={config.gradeLevel} 
                onValueChange={value => setConfig({...config, gradeLevel: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pedagogicalApproach">Pedagogical Approach</Label>
              <Select 
                value={config.pedagogicalApproach} 
                onValueChange={value => setConfig({...config, pedagogicalApproach: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select approach" />
                </SelectTrigger>
                <SelectContent>
                  {PEDAGOGICAL_APPROACHES.map(approach => (
                    <SelectItem key={approach.value} value={approach.value}>
                      {approach.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="culturalContext">Cultural Context</Label>
              <Select 
                value={config.culturalContext} 
                onValueChange={value => setConfig({...config, culturalContext: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  {CULTURAL_CONTEXTS.map(context => (
                    <SelectItem key={context.value} value={context.value}>
                      {context.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <Select 
                value={config.assessmentType} 
                onValueChange={value => setConfig({...config, assessmentType: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={config.duration} 
                onValueChange={value => setConfig({...config, duration: value as any})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(duration => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Learning Objectives</Label>
            <div className="flex items-center mt-1 space-x-2">
              <Input 
                value={objective} 
                onChange={e => setObjective(e.target.value)}
                placeholder="Add a learning objective" 
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
              />
              <Button type="button" onClick={handleAddObjective} size="sm">Add</Button>
            </div>
            {config.learningObjectives.length > 0 && (
              <div className="mt-3 space-y-2">
                {config.learningObjectives.map((obj, index) => (
                  <div key={index} className="flex items-center justify-between bg-accent p-2 rounded-md">
                    <span className="text-sm">{obj}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveObjective(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label className="mb-2 block">Accessibility Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACCESSIBILITY_FEATURES.map(feature => (
                <div key={feature.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={feature.value}
                    checked={config.accessibility.includes(feature.value as AccessibilityFeature)}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange(feature.value as AccessibilityFeature, checked === true)
                    }
                  />
                  <Label
                    htmlFor={feature.value}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(config)}>
          Create Project
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectConfigurator;
