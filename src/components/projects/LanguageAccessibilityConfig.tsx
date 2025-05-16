
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CulturalContext, TerminologyType, AccessibilityFeature, LanguageConfig } from '@/types/project';
import { LanguageSamplePreview } from './LanguageSamplePreview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageAccessibilityConfigProps {
  config: LanguageConfig;
  onConfigChange: (config: LanguageConfig) => void;
}

export function LanguageAccessibilityConfig({ config, onConfigChange }: LanguageAccessibilityConfigProps) {
  const handleReadabilityChange = (value: number[]) => {
    onConfigChange({
      ...config,
      readabilityLevel: value[0]
    });
  };

  const handleTerminologyChange = (value: TerminologyType) => {
    onConfigChange({
      ...config,
      terminology: value
    });
  };

  const handleCulturalContextChange = (value: CulturalContext) => {
    onConfigChange({
      ...config,
      culturalContext: value
    });
  };

  const toggleAccessibilityFeature = (feature: AccessibilityFeature) => {
    const features = [...config.accessibilityFeatures];
    const index = features.indexOf(feature);
    
    if (index === -1) {
      features.push(feature);
    } else {
      features.splice(index, 1);
    }
    
    onConfigChange({
      ...config,
      accessibilityFeatures: features
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Readability</CardTitle>
            <CardDescription>
              Set the complexity level of the generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="mb-1">Reading Level: {config.readabilityLevel}/10</Label>
                <Slider
                  value={[config.readabilityLevel]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={handleReadabilityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Elementary</span>
                  <span>Middle School</span>
                  <span>High School</span>
                  <span>College</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Terminology Style</Label>
                <Select 
                  value={config.terminology} 
                  onValueChange={value => handleTerminologyChange(value as TerminologyType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select terminology style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (Everyday language)</SelectItem>
                    <SelectItem value="standard">Standard (Common terminology)</SelectItem>
                    <SelectItem value="academic">Academic (Discipline-specific terminology)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cultural Context</Label>
                <Select 
                  value={config.culturalContext} 
                  onValueChange={value => handleCulturalContextChange(value as CulturalContext)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cultural context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General (Universal)</SelectItem>
                    <SelectItem value="multicultural">Multicultural (Diverse perspectives)</SelectItem>
                    <SelectItem value="indigenous">Indigenous (Traditional knowledge)</SelectItem>
                    <SelectItem value="culturally_responsive">Culturally Responsive (Tailored to audience)</SelectItem>
                    <SelectItem value="global">Global (International context)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>
              Select features to make content more accessible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="screen-reader"
                  checked={config.accessibilityFeatures.includes('screen_reader_friendly')}
                  onCheckedChange={() => toggleAccessibilityFeature('screen_reader_friendly')}
                />
                <Label htmlFor="screen-reader">Screen Reader Friendly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="simplified-language"
                  checked={config.accessibilityFeatures.includes('simplified_language')}
                  onCheckedChange={() => toggleAccessibilityFeature('simplified_language')}
                />
                <Label htmlFor="simplified-language">Simplified Language</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="high-contrast"
                  checked={config.accessibilityFeatures.includes('high_contrast')}
                  onCheckedChange={() => toggleAccessibilityFeature('high_contrast')}
                />
                <Label htmlFor="high-contrast">High Contrast</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="alternative-text"
                  checked={config.accessibilityFeatures.includes('alternative_text')}
                  onCheckedChange={() => toggleAccessibilityFeature('alternative_text')}
                />
                <Label htmlFor="alternative-text">Alternative Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="closed-captioning"
                  checked={config.accessibilityFeatures.includes('closed_captioning')}
                  onCheckedChange={() => toggleAccessibilityFeature('closed_captioning')}
                />
                <Label htmlFor="closed-captioning">Closed Captioning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="multi-sensory"
                  checked={config.accessibilityFeatures.includes('multi_sensory')}
                  onCheckedChange={() => toggleAccessibilityFeature('multi_sensory')}
                />
                <Label htmlFor="multi-sensory">Multi-Sensory</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <LanguageSamplePreview config={config} topic="science" />
      </div>
    </div>
  );
}

export default LanguageAccessibilityConfig;
