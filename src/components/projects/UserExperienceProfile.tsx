
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, User, MessageCircle, FileText } from "lucide-react";

interface UserExperienceProfileProps {
  onProfileChange: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export interface UserProfile {
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  interactionStyle: 'guided' | 'collaborative' | 'autonomous';
  detailLevel: number; // 1-5 scale
  adaptOverTime: boolean;
}

export function UserExperienceProfile({ 
  onProfileChange, 
  initialProfile = {
    expertiseLevel: 'intermediate',
    interactionStyle: 'collaborative',
    detailLevel: 3,
    adaptOverTime: true
  }
}: UserExperienceProfileProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const handleProfileChange = (key: keyof UserProfile, value: any) => {
    const updatedProfile = { ...profile, [key]: value };
    setProfile(updatedProfile);
    onProfileChange(updatedProfile);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Experience Profile
        </CardTitle>
        <CardDescription>
          Customize how EduForge AI interacts with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Expertise Level</Label>
          <RadioGroup
            value={profile.expertiseLevel}
            onValueChange={(value) => 
              handleProfileChange('expertiseLevel', value as UserProfile['expertiseLevel'])
            }
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner" className="cursor-pointer">Beginner</Label>
              <span className="text-xs text-muted-foreground ml-2">
                (More guidance and explanations)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate" className="cursor-pointer">Intermediate</Label>
              <span className="text-xs text-muted-foreground ml-2">
                (Balanced guidance and efficiency)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced" className="cursor-pointer">Advanced</Label>
              <span className="text-xs text-muted-foreground ml-2">
                (More efficiency, less explanation)
              </span>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Preferred Interaction Style</Label>
          <div className="grid grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer border-2 transition-all ${
                profile.interactionStyle === 'guided' ? 'border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => handleProfileChange('interactionStyle', 'guided')}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Settings className="h-10 w-10 mb-2 text-primary/70" />
                <div className="font-medium">Guided</div>
                <div className="text-xs text-center text-muted-foreground">
                  AI leads with step-by-step assistance
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer border-2 transition-all ${
                profile.interactionStyle === 'collaborative' ? 'border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => handleProfileChange('interactionStyle', 'collaborative')}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <MessageCircle className="h-10 w-10 mb-2 text-primary/70" />
                <div className="font-medium">Collaborative</div>
                <div className="text-xs text-center text-muted-foreground">
                  Equal partnership with AI suggestions
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer border-2 transition-all ${
                profile.interactionStyle === 'autonomous' ? 'border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => handleProfileChange('interactionStyle', 'autonomous')}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <FileText className="h-10 w-10 mb-2 text-primary/70" />
                <div className="font-medium">Autonomous</div>
                <div className="text-xs text-center text-muted-foreground">
                  You lead, AI provides resources
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Output Detail Level</Label>
            <span className="text-sm">{['Minimal', 'Basic', 'Standard', 'Detailed', 'Comprehensive'][profile.detailLevel - 1]}</span>
          </div>
          <Slider
            value={[profile.detailLevel]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => handleProfileChange('detailLevel', value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Less detail</span>
            <span>More detail</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="adapt-over-time" 
            checked={profile.adaptOverTime}
            onCheckedChange={(checked) => handleProfileChange('adaptOverTime', checked)}
          />
          <Label htmlFor="adapt-over-time">Adapt preferences over time based on my usage</Label>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserExperienceProfile;
