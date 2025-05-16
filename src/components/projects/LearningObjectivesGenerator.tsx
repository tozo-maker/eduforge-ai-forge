
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2 } from 'lucide-react';
import { ProjectType, Subject, GradeLevel } from '@/types/project';
import { learningObjectiveService } from '@/services/learningObjectiveService';

interface LearningObjectivesGeneratorProps {
  projectName: string;
  projectType: ProjectType;
  description: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  onSelectObjectives: (objectives: string[]) => void;
  onCancel: () => void;
}

export function LearningObjectivesGenerator({
  projectName,
  projectType,
  description,
  subject,
  gradeLevel,
  onSelectObjectives,
  onCancel
}: LearningObjectivesGeneratorProps) {
  const [generatedObjectives, setGeneratedObjectives] = useState<string[]>([]);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const objectives = await learningObjectiveService.generateLearningObjectives(
        projectName,
        projectType,
        description,
        subject,
        gradeLevel
      );
      
      setGeneratedObjectives(objectives);
      // Pre-select all generated objectives
      setSelectedObjectives(objectives);
    } catch (err) {
      setError('Failed to generate learning objectives. Please try again.');
      console.error('Learning objectives generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleObjective = (objective: string) => {
    if (selectedObjectives.includes(objective)) {
      setSelectedObjectives(selectedObjectives.filter(obj => obj !== objective));
    } else {
      setSelectedObjectives([...selectedObjectives, objective]);
    }
  };

  const handleSelectAll = () => {
    setSelectedObjectives([...generatedObjectives]);
  };

  const handleSelectNone = () => {
    setSelectedObjectives([]);
  };

  const handleConfirm = () => {
    onSelectObjectives(selectedObjectives);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Learning Objectives Generator
        </CardTitle>
        <CardDescription>
          Generate learning objectives based on your project details
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!generatedObjectives.length && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Click the button below to generate learning objectives based on:
              <br />
              <span className="font-medium">{projectName}</span> - <span className="italic">{subject.replace('_', ' ')}</span> for <span className="italic">{gradeLevel} grade</span>
            </p>
            <Button onClick={handleGenerate} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Objectives
            </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Generating learning objectives...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {generatedObjectives.length > 0 && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>Select None</Button>
            </div>
            
            <div className="space-y-2">
              {generatedObjectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox 
                    id={`objective-${index}`} 
                    checked={selectedObjectives.includes(objective)}
                    onCheckedChange={() => toggleObjective(objective)}
                  />
                  <label 
                    htmlFor={`objective-${index}`} 
                    className="cursor-pointer text-sm"
                  >
                    {objective}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {generatedObjectives.length > 0 && !isLoading && (
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedObjectives.length === 0}>
            Use Selected Objectives ({selectedObjectives.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
