
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessibilityFeature, CulturalContext, TerminologyType, LanguageConfig } from '@/types/project';
import { RefreshCw, MessageSquare, Globe, FileText } from "lucide-react";

interface LanguageAccessibilityConfigProps {
  config: LanguageConfig;
  onConfigChange: (config: LanguageConfig) => void;
}

export function LanguageAccessibilityConfig({ 
  config, 
  onConfigChange 
}: LanguageAccessibilityConfigProps) {
  const [sampleText, setSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const handleConfigChange = (key: keyof LanguageConfig, value: any) => {
    const updatedConfig = { ...config, [key]: value };
    onConfigChange(updatedConfig);
    setSampleText(null); // Reset sample text when configuration changes
  };

  const handleAccessibilityFeatureToggle = (feature: AccessibilityFeature) => {
    const updatedFeatures = config.accessibilityFeatures.includes(feature)
      ? config.accessibilityFeatures.filter(f => f !== feature)
      : [...config.accessibilityFeatures, feature];
    
    handleConfigChange('accessibilityFeatures', updatedFeatures);
  };

  const generateSampleText = () => {
    setLoadingSample(true);
    setTimeout(() => {
      // This would be replaced with an actual API call to generate text with Claude
      const readabilityLevel = config.readabilityLevel;
      const culturalContext = config.culturalContext;
      const terminology = config.terminology;
      
      let sample = "";
      if (readabilityLevel <= 3) {
        sample = "The sun is big. It gives us light. Plants need light to grow. People need plants.";
      } else if (readabilityLevel <= 6) {
        sample = "The sun is the most important star in our solar system. It provides light and heat that makes life on Earth possible. Plants use sunlight to make food through photosynthesis.";
      } else {
        sample = "The sun, a G-type main-sequence star at the center of our solar system, emits electromagnetic radiation that enables photosynthesis in plants, the foundation of most terrestrial ecosystems. Its thermonuclear reactions convert hydrogen into helium, releasing energy that maintains Earth's biosphere.";
      }

      if (terminology === 'academic') {
        sample += " Pedagogical implications include the utilization of solar phenomena to illustrate fundamental scientific principles.";
      }

      if (culturalContext === 'multicultural') {
        sample += " Various cultures throughout history have interpreted the significance of the sun differently, often incorporating it into their mythologies and belief systems.";
      }

      setSampleText(sample);
      setLoadingSample(false);
    }, 1000);
  };

  const readabilityLabels = [
    '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
    '6th Grade', '7th-8th Grade', '9th-10th Grade', '11th-12th Grade', 'College'
  ];

  const accessibilityOptions: {value: AccessibilityFeature; label: string; description: string}[] = [
    { value: 'screen_reader_friendly', label: 'Screen Reader Friendly', description: 'Optimized for screen readers and assistive technologies' },
    { value: 'simplified_language', label: 'Simplified Language', description: 'Uses straightforward language with clear explanations' },
    { value: 'high_contrast', label: 'High Contrast', description: 'Ensures text has sufficient contrast with backgrounds' },
    { value: 'alternative_text', label: 'Alternative Text', description: 'Provides text alternatives for images and visual elements' },
    { value: 'closed_captioning', label: 'Closed Captioning', description: 'Includes captions for audio and video content' },
    { value: 'multi_sensory', label: 'Multi-Sensory', description: 'Incorporates multiple modes of engagement (visual, audio, etc.)' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language & Accessibility
        </CardTitle>
        <CardDescription>
          Configure language complexity, cultural context, and accessibility features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="language">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="language">Language Settings</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="language" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Readability Level</Label>
                <span className="text-sm font-medium">{readabilityLabels[config.readabilityLevel - 1]}</span>
              </div>
              <Slider
                value={[config.readabilityLevel]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => handleConfigChange('readabilityLevel', value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Simpler</span>
                <span>More Complex</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cultural Context</Label>
              <Select 
                value={config.culturalContext}
                onValueChange={(value) => handleConfigChange('culturalContext', value as CulturalContext)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cultural context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General/Universal</SelectItem>
                  <SelectItem value="multicultural">Multicultural</SelectItem>
                  <SelectItem value="indigenous">Indigenous Perspectives</SelectItem>
                  <SelectItem value="culturally_responsive">Culturally Responsive</SelectItem>
                  <SelectItem value="global">Global Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Terminology Level</Label>
              <RadioGroup
                value={config.terminology}
                onValueChange={(value) => 
                  handleConfigChange('terminology', value as TerminologyType)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="cursor-pointer">Simple</Label>
                  <span className="text-xs text-muted-foreground">(Basic vocabulary with explanations)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="cursor-pointer">Standard</Label>
                  <span className="text-xs text-muted-foreground">(Grade-appropriate terminology)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="academic" id="academic" />
                  <Label htmlFor="academic" className="cursor-pointer">Academic</Label>
                  <span className="text-xs text-muted-foreground">(Domain-specific academic language)</span>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full gap-2"
                variant="outline"
                onClick={generateSampleText}
                disabled={loadingSample}
              >
                {loadingSample ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating Sample...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Generate Language Sample
                  </>
                )}
              </Button>
              
              {sampleText && (
                <Card className="mt-3 bg-muted/30">
                  <CardContent className="p-3">
                    <FileText className="h-4 w-4 mb-2 text-muted-foreground" />
                    <p className="text-sm">{sampleText}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-6 pt-4">
            <div>
              <Label className="text-base mb-3 block">Accessibility Features</Label>
              <div className="space-y-3">
                {accessibilityOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={config.accessibilityFeatures.includes(option.value)}
                      onCheckedChange={() => handleAccessibilityFeatureToggle(option.value)}
                    />
                    <div>
                      <Label 
                        htmlFor={option.value}
                        className="font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default LanguageAccessibilityConfig;
