
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ProjectType, 
  Duration, 
  StructureType,
  GradeLevel,
  PedagogicalApproach 
} from '@/types/project';
import { Progress } from '@/components/ui/progress';
import { FileText, Clock } from 'lucide-react';

interface AdaptiveWordCountCalculatorProps {
  projectType: ProjectType;
  gradeLevel: GradeLevel;
  duration: Duration;
  structureType?: StructureType;
  learningObjectives: string[];
  pedagogicalApproach: PedagogicalApproach;
}

export function AdaptiveWordCountCalculator({
  projectType,
  gradeLevel,
  duration,
  structureType = 'sequential',
  learningObjectives,
  pedagogicalApproach
}: AdaptiveWordCountCalculatorProps) {
  const [wordCountEstimate, setWordCountEstimate] = useState({ min: 0, max: 0, complexity: 'medium' });
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(0);

  useEffect(() => {
    // Calculate base word count by project type
    const baseWordCounts: Record<ProjectType, { min: number; max: number }> = {
      lesson_plan: { min: 500, max: 1500 },
      course_module: { min: 2000, max: 5000 },
      curriculum: { min: 3000, max: 8000 },
      assessment: { min: 300, max: 1200 },
      study_guide: { min: 1000, max: 3000 }
    };
    
    let { min, max } = baseWordCounts[projectType];
    
    // Adjust by duration
    const durationMultipliers: Record<Duration, number> = {
      '15_minutes': 0.5,
      '30_minutes': 0.75,
      '45_minutes': 1.0,
      '60_minutes': 1.25,
      '90_minutes': 1.5,
      'multi_day': 2.0
    };
    
    min *= durationMultipliers[duration];
    max *= durationMultipliers[duration];
    
    // Adjust by grade level
    // Higher grades typically have more complex content
    if (['k', '1st', '2nd', '3rd'].includes(gradeLevel)) {
      min *= 0.6;
      max *= 0.6;
    } else if (['4th', '5th', '6th'].includes(gradeLevel)) {
      min *= 0.8;
      max *= 0.8;
    } else if (['higher_education', 'professional'].includes(gradeLevel)) {
      min *= 1.3;
      max *= 1.3;
    }
    
    // Adjust by number of learning objectives
    const objectiveCount = learningObjectives.filter(obj => obj.trim().length > 0).length;
    if (objectiveCount > 0) {
      min *= (1 + (objectiveCount * 0.1));
      max *= (1 + (objectiveCount * 0.1));
    }
    
    // Adjust by structure type
    if (structureType === 'hierarchical' || structureType === 'spiral') {
      min *= 1.2;
      max *= 1.2;
    }
    
    // Adjust by pedagogical approach
    if (['inquiry_based', 'project_based'].includes(pedagogicalApproach)) {
      min *= 1.15;
      max *= 1.15;
    } else if (['direct_instruction', 'flipped_classroom'].includes(pedagogicalApproach)) {
      min *= 0.9;
      max *= 0.9;
    }
    
    // Round to nearest 50
    min = Math.round(min / 50) * 50;
    max = Math.round(max / 50) * 50;
    
    // Determine complexity
    let complexity = 'medium';
    const avgWordCount = (min + max) / 2;
    if (avgWordCount < 1000) {
      complexity = 'low';
    } else if (avgWordCount > 3000) {
      complexity = 'high';
    }
    
    // Calculate estimated reading time (average adult reads at ~250 words per minute)
    // Adjust reading speed based on grade level
    let readingSpeed = 250;
    if (['k', '1st', '2nd', '3rd', '4th', '5th'].includes(gradeLevel)) {
      readingSpeed = 150; // Younger students read slower
    } else if (['higher_education', 'professional'].includes(gradeLevel)) {
      readingSpeed = 300; // Advanced readers read faster
    }
    
    const averageWords = (min + max) / 2;
    const readingTime = Math.round(averageWords / readingSpeed);
    
    setWordCountEstimate({ min, max, complexity });
    setReadingTimeMinutes(readingTime);
  }, [projectType, gradeLevel, duration, structureType, learningObjectives, pedagogicalApproach]);

  // Determine complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-500';
      case 'high': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  // Calculate progress percentage for the progress bar
  const getProgressPercentage = () => {
    const maxWordCount = 10000; // Arbitrary max for progress bar display
    const avg = (wordCountEstimate.min + wordCountEstimate.max) / 2;
    return Math.min(Math.round((avg / maxWordCount) * 100), 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Length Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Estimated Word Count</span>
              <span className="text-sm font-mono">
                {wordCountEstimate.min.toLocaleString()} - {wordCountEstimate.max.toLocaleString()}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Complexity</span>
              <span className={`font-medium capitalize ${getComplexityColor(wordCountEstimate.complexity)}`}>
                {wordCountEstimate.complexity}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Reading Time</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTimeMinutes} {readingTimeMinutes === 1 ? 'minute' : 'minutes'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdaptiveWordCountCalculator;
