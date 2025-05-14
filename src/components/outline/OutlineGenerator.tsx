
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import { ProjectConfig } from '@/types/project';
import { OutlineGenerationParams, AIModelType, Outline } from '@/types/outline';
import { generateOutline } from '@/services/outlineGeneration';
import { toast } from '@/hooks/use-toast';

interface OutlineGeneratorProps {
  projectConfig: ProjectConfig;
  onOutlineGenerated: (outline: Outline) => void;
  selectedStructure?: 'sequential' | 'hierarchical' | 'modular' | 'spiral';
}

export function OutlineGenerator({ 
  projectConfig, 
  onOutlineGenerated,
  selectedStructure = 'sequential'
}: OutlineGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationParams, setGenerationParams] = useState<OutlineGenerationParams>({
    projectConfig,
    detailLevel: 'medium',
    model: 'claude-3-haiku',
    includeAssessments: true,
    includeActivities: true,
    focusAreas: [],
    referenceUrls: [],
    structureType: selectedStructure
  });
  const [focusArea, setFocusArea] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  // Update generation params when selected structure changes
  React.useEffect(() => {
    setGenerationParams(prev => ({
      ...prev,
      structureType: selectedStructure
    }));
  }, [selectedStructure]);

  const handleParamChange = <K extends keyof OutlineGenerationParams>(
    key: K, 
    value: OutlineGenerationParams[K]
  ) => {
    setGenerationParams(prev => ({ ...prev, [key]: value }));
  };

  const addFocusArea = () => {
    if (focusArea.trim()) {
      setGenerationParams(prev => ({
        ...prev,
        focusAreas: [...(prev.focusAreas || []), focusArea.trim()]
      }));
      setFocusArea('');
    }
  };

  const removeFocusArea = (index: number) => {
    setGenerationParams(prev => ({
      ...prev,
      focusAreas: prev.focusAreas?.filter((_, i) => i !== index)
    }));
  };

  const addReferenceUrl = () => {
    if (referenceUrl.trim()) {
      setGenerationParams(prev => ({
        ...prev,
        referenceUrls: [...(prev.referenceUrls || []), referenceUrl.trim()]
      }));
      setReferenceUrl('');
    }
  };

  const removeReferenceUrl = (index: number) => {
    setGenerationParams(prev => ({
      ...prev,
      referenceUrls: prev.referenceUrls?.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateOutline = async () => {
    try {
      setIsGenerating(true);
      
      const outline = await generateOutline({
        ...generationParams,
        projectConfig,
        structureType: selectedStructure // Ensure we're using the latest structure
      });
      
      if (outline) {
        onOutlineGenerated(outline);
        toast({
          title: "Outline Generated",
          description: "Your outline has been successfully created.",
        });
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Generate Outline
        </CardTitle>
        <CardDescription>
          Create an AI-powered outline based on your project configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-3 rounded-md border mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Using {selectedStructure} structure</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your outline will be generated based on the {selectedStructure} structure selected above.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select 
              value={generationParams.model} 
              onValueChange={(value) => handleParamChange('model', value as AIModelType)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-instant">Claude Instant (Fast)</SelectItem>
                <SelectItem value="claude-2">Claude 2 (Balanced)</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus (Advanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="detailLevel">Detail Level</Label>
            <Select 
              value={generationParams.detailLevel} 
              onValueChange={(value) => handleParamChange('detailLevel', value as any)}
            >
              <SelectTrigger id="detailLevel">
                <SelectValue placeholder="Select detail level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-level">High-Level (Brief)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="detailed">Detailed (Comprehensive)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="includeAssessments" 
              checked={generationParams.includeAssessments}
              onCheckedChange={(value) => handleParamChange('includeAssessments', value)}
            />
            <Label htmlFor="includeAssessments">Include Assessments</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="includeActivities" 
              checked={generationParams.includeActivities}
              onCheckedChange={(value) => handleParamChange('includeActivities', value)}
            />
            <Label htmlFor="includeActivities">Include Activities</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="block">Focus Areas (Optional)</Label>
          <div className="flex gap-2">
            <Input 
              value={focusArea} 
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="Add specific focus area" 
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addFocusArea()}
            />
            <Button type="button" variant="outline" onClick={addFocusArea}>Add</Button>
          </div>
          {generationParams.focusAreas && generationParams.focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {generationParams.focusAreas.map((area, index) => (
                <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md flex items-center space-x-1">
                  <span>{area}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-4 w-4 p-0" 
                    onClick={() => removeFocusArea(index)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label className="block">Reference Materials (Optional)</Label>
          <div className="flex gap-2">
            <Input 
              value={referenceUrl} 
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="Add URL to reference material" 
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addReferenceUrl()}
            />
            <Button type="button" variant="outline" onClick={addReferenceUrl}>Add</Button>
          </div>
          {generationParams.referenceUrls && generationParams.referenceUrls.length > 0 && (
            <div className="space-y-2 mt-2">
              {generationParams.referenceUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                  <span className="text-sm truncate">{url}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeReferenceUrl(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleGenerateOutline} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Outline
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default OutlineGenerator;
