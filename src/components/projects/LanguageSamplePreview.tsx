
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageConfig } from '@/types/project';
import { generateLanguageSample } from '@/services/languageSampleGenerator';
import { Sparkles, Loader2 } from 'lucide-react';

interface LanguageSamplePreviewProps {
  config: LanguageConfig;
  topic?: string;
}

export function LanguageSamplePreview({ config, topic = "science" }: LanguageSamplePreviewProps) {
  const [sample, setSample] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    generateSample();
  }, []);

  const generateSample = async () => {
    setIsGenerating(true);
    try {
      const generatedSample = await generateLanguageSample(config, { topic, maxLength: 400 });
      setSample(generatedSample);
    } catch (error) {
      console.error("Failed to generate language sample:", error);
      setSample("Could not generate a sample. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getReadabilityLabel = (level: number) => {
    if (level <= 2) return 'elementary';
    if (level <= 5) return 'middle school';
    if (level <= 8) return 'high school';
    return 'advanced';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Sample Content Preview</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateSample}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Regenerate
              </>
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          {topic} content sample with {getReadabilityLabel(config.readabilityLevel)} readability
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Generating AI content...</p>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm">{sample}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between">
        <div>
          Readability: {config.readabilityLevel}/10
        </div>
        <div>
          Style: {config.terminology} terminology
        </div>
      </CardFooter>
    </Card>
  );
}

export default LanguageSamplePreview;
