
import React, { useState, useEffect } from 'react';
import { Subject, GradeLevel } from '@/types/project';
import { topicSuggestionsService, TopicSuggestion } from '@/services/topicSuggestionsService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubjectSuggestionsProps {
  selectedSubject: Subject;
  gradeLevel: GradeLevel;
  learningObjectives: string[];
  onSelectAdditionalSubject?: (subject: Subject) => void;
}

export function SubjectSuggestions({ 
  selectedSubject, 
  gradeLevel, 
  learningObjectives,
  onSelectAdditionalSubject
}: SubjectSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only get suggestions if there's a selected subject
    if (selectedSubject) {
      setLoading(true);
      
      // Use the AI service to generate suggestions
      topicSuggestionsService.getComplementarySubjects(
        selectedSubject, 
        gradeLevel, 
        learningObjectives
      ).then(results => {
        setSuggestions(results);
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching subject suggestions:", error);
        setLoading(false);
        setSuggestions([]);
      });
    } else {
      setSuggestions([]);
    }
  }, [selectedSubject, gradeLevel, learningObjectives]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!selectedSubject || suggestions.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Complementary Subject Areas</CardTitle>
        <CardDescription>
          AI-suggested subjects that pair well with {selectedSubject.replace('_', ' ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Analyzing educational connections...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion.subject} className="flex items-start justify-between border-b pb-2 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium capitalize">
                      {suggestion.subject.replace('_', ' ')}
                    </h4>
                    <Badge variant="outline" className={getScoreColor(suggestion.relevanceScore)}>
                      {suggestion.relevanceScore}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                </div>
                {onSelectAdditionalSubject && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onSelectAdditionalSubject(suggestion.subject)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add as secondary subject</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubjectSuggestions;
