import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen, Lightbulb, Sparkles, BookIcon, Link as LinkIcon, FileText, Video } from 'lucide-react';
import { ProjectConfig } from '@/types/project';
import { OutlineGenerationParams, AIModelType, Outline, Reference } from '@/types/outline';
import { generateOutline } from '@/services/outlineGeneration';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    model: 'claude-3-haiku', // Updated to use claude-3-haiku by default
    includeAssessments: true,
    includeActivities: true,
    focusAreas: [],
    referenceUrls: [],
    structureType: selectedStructure
  });
  
  const [focusArea, setFocusArea] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  
  // New reference form
  const [newReference, setNewReference] = useState<{
    title: string;
    url: string;
    notes: string;
    type: 'article' | 'book' | 'video' | 'website' | 'research';
  }>({
    title: '',
    url: '',
    notes: '',
    type: 'article'
  });

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

  // Add a new reference 
  const addReference = () => {
    if (!newReference.title.trim()) {
      toast({
        description: "Reference title is required",
        variant: "destructive"
      });
      return;
    }
    
    const reference: Reference = {
      ...newReference,
      id: crypto.randomUUID()
    };
    
    setReferences([...references, reference]);
    
    // Also add URL to referenceUrls for backward compatibility
    if (newReference.url) {
      setGenerationParams(prev => ({
        ...prev,
        referenceUrls: [...(prev.referenceUrls || []), newReference.url]
      }));
    }
    
    // Reset form
    setNewReference({
      title: '',
      url: '',
      notes: '',
      type: 'article'
    });
  };

  // Remove a reference
  const removeReference = (id: string) => {
    const ref = references.find(r => r.id === id);
    setReferences(references.filter(r => r.id !== id));
    
    // Also remove from referenceUrls if it exists
    if (ref?.url) {
      setGenerationParams(prev => ({
        ...prev,
        referenceUrls: prev.referenceUrls?.filter(url => url !== ref.url)
      }));
    }
  };

  // Get reference icon based on type
  const getReferenceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'book':
        return <BookIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'website':
      case 'research':
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const handleGenerateOutline = async () => {
    try {
      setIsGenerating(true);
      
      console.log('Generating outline with params:', generationParams);
      
      const outline = await generateOutline({
        ...generationParams,
        projectConfig,
        structureType: selectedStructure // Ensure we're using the latest structure
      });
      
      if (outline) {
        // Add references to the outline
        const outlineWithReferences = {
          ...outline,
          references,
          nodeReferences: {} // Initialize empty mapping
        };
        
        onOutlineGenerated(outlineWithReferences);
        toast({
          title: "Outline Generated",
          description: "Your outline has been successfully created.",
        });
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error 
          ? error.message 
          : "There was an error generating your outline. Please try again.",
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
                <SelectItem value="claude-3-haiku">Claude 3 Haiku (Recommended)</SelectItem>
                {/* Commented out models that might not be available */}
                {/* <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</SelectItem> */}
                {/* <SelectItem value="claude-3-opus">Claude 3 Opus (Advanced)</SelectItem> */}
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
        
        <div className="space-y-3">
          <Label className="block">Reference Materials</Label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input 
              value={newReference.title} 
              onChange={(e) => setNewReference({...newReference, title: e.target.value})}
              placeholder="Title" 
              className="md:col-span-2"
            />
            
            <Input 
              value={newReference.url} 
              onChange={(e) => setNewReference({...newReference, url: e.target.value})}
              placeholder="URL (optional)" 
              className="md:col-span-2"
            />
            
            <select 
              className="border rounded-md px-3 py-1"
              value={newReference.type}
              onChange={(e) => setNewReference({
                ...newReference, 
                type: e.target.value as any
              })}
            >
              <option value="article">Article</option>
              <option value="book">Book</option>
              <option value="video">Video</option>
              <option value="website">Website</option>
              <option value="research">Research</option>
            </select>
          </div>
          
          <Textarea
            value={newReference.notes}
            onChange={(e) => setNewReference({...newReference, notes: e.target.value})}
            placeholder="Notes about this reference (optional)"
            rows={2}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addReference}
            className="w-full"
          >
            Add Reference
          </Button>
          
          {references.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 p-2 font-medium text-sm">
                References ({references.length})
              </div>
              <div className="p-2 space-y-2">
                {references.map(ref => (
                  <div key={ref.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="flex items-center">
                        {getReferenceIcon(ref.type)}
                        <span className="ml-1 font-medium">{ref.title}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {ref.type}
                        </Badge>
                      </div>
                      {ref.url && (
                        <div className="text-xs text-blue-500">
                          <a href={ref.url} target="_blank" rel="noopener noreferrer">
                            {ref.url}
                          </a>
                        </div>
                      )}
                      {ref.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {ref.notes.substring(0, 60)}{ref.notes.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeReference(ref.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
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
