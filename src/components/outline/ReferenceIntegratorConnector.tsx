
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Outline, Reference } from '@/types/outline';
import { referenceExtractor } from '@/services/referenceExtractor';
import { ReferenceIntegrator } from './ReferenceIntegrator';
import { Loader2, Link, BookOpen } from 'lucide-react';

interface ReferenceIntegratorConnectorProps {
  outline: Outline;
  onUpdateOutline: (outline: Outline) => void;
}

export function ReferenceIntegratorConnector({ outline, onUpdateOutline }: ReferenceIntegratorConnectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [referencePlacements, setReferencePlacements] = useState<Record<string, string[]>>({});
  
  const references = outline.references || [];
  
  // Run analysis on references and suggest placements
  const analyzeReferences = async () => {
    if (!references || references.length === 0) {
      toast({
        description: "Add references to your project before analyzing"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Try to get suggestions from the API
      const suggestions = await referenceExtractor.suggestReferencePlacements(
        outline.rootNodes, 
        references
      );
      
      // If API call failed or returned empty, fall back to local analysis
      const finalPlacements = Object.keys(suggestions).length === 0 
        ? referenceExtractor.generateLocalReferenceSuggestions(outline.rootNodes, references)
        : suggestions;
      
      setReferencePlacements(finalPlacements);
      setHasAnalyzed(true);
      
      const placementCount = Object.keys(finalPlacements).length;
      
      // Show toast with results
      if (placementCount > 0) {
        toast({
          title: "Reference Analysis Complete",
          description: `Found ${placementCount} potential placements for your references.`
        });
      } else {
        toast({
          description: "No reference placements found. Try adding more detailed references."
        });
      }
    } catch (error) {
      console.error("Error analyzing references:", error);
      toast({
        title: "Analysis Error",
        description: "Could not complete reference analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Apply the suggested placements to the outline
  const applyReferencePlacements = () => {
    // Create a deep copy of the outline
    const updatedOutline = JSON.parse(JSON.stringify(outline));
    
    // Add or update nodeReferences in the outline
    updatedOutline.nodeReferences = {
      ...(updatedOutline.nodeReferences || {}),
      ...referencePlacements
    };
    
    // Update the outline
    onUpdateOutline(updatedOutline);
    
    toast({
      title: "References Applied",
      description: `Updated ${Object.keys(referencePlacements).length} content sections with references.`
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          Reference Analysis and Integration
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={analyzeReferences}
              disabled={isAnalyzing || references.length === 0}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Analyze References
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              onClick={applyReferencePlacements}
              disabled={!hasAnalyzed || Object.keys(referencePlacements).length === 0}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Apply Suggestions
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReferenceIntegrator 
          outline={outline}
          onUpdateOutline={onUpdateOutline}
          suggestedPlacements={referencePlacements}
          hasAnalyzedReferences={hasAnalyzed}
        />
      </CardContent>
    </Card>
  );
}

export default ReferenceIntegratorConnector;
