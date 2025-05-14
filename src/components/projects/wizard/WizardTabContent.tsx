
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { BasicInfoTab } from './BasicInfoTab';
import { StandardsIntegration } from '@/components/projects/StandardsIntegration';
import { ContentStructureVisualizer } from '@/components/projects/ContentStructureVisualizer';
import { LanguageAccessibilityConfig } from '@/components/projects/LanguageAccessibilityConfig';
import { UserExperienceProfile } from '@/components/projects/UserExperienceProfile';
import { ProjectConfig, EducationalStandard, StructureType, LanguageConfig, UserProfile } from '@/types/project';

interface WizardTabContentProps {
  activeTab: string;
  projectConfig: Partial<ProjectConfig>;
  handleConfigChange: (field: string, value: any) => void;
  handleLearningObjectivesChange: (index: number, value: string) => void;
  addLearningObjective: () => void;
  removeLearningObjective: (index: number) => void;
  handleStandardsChange: (standards: EducationalStandard[]) => void;
  handleContentStructureChange: (structure: StructureType) => void;
  languageConfig: LanguageConfig;
  setLanguageConfig: React.Dispatch<React.SetStateAction<LanguageConfig>>;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export function WizardTabContent({
  activeTab,
  projectConfig,
  handleConfigChange,
  handleLearningObjectivesChange,
  addLearningObjective,
  removeLearningObjective,
  handleStandardsChange,
  handleContentStructureChange,
  languageConfig,
  setLanguageConfig,
  userProfile,
  setUserProfile
}: WizardTabContentProps) {
  return (
    <>
      <TabsContent value="basic" className="p-6 space-y-6">
        <BasicInfoTab 
          projectConfig={projectConfig}
          handleConfigChange={handleConfigChange}
          handleLearningObjectivesChange={handleLearningObjectivesChange}
          addLearningObjective={addLearningObjective}
          removeLearningObjective={removeLearningObjective}
        />
      </TabsContent>

      <TabsContent value="standards" className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Educational Standards</h2>
          <p className="text-muted-foreground">Link your content to educational standards</p>
        </div>

        <StandardsIntegration
          selectedStandards={projectConfig.standards || []}
          onStandardsChange={handleStandardsChange}
        />
      </TabsContent>

      <TabsContent value="structure" className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Content Structure</h2>
          <p className="text-muted-foreground">Choose how your content will be organized</p>
        </div>

        <ContentStructureVisualizer
          selectedStructure={projectConfig.contentStructure as StructureType || 'sequential'}
          onStructureChange={(structure) => handleContentStructureChange(structure)}
        />
      </TabsContent>

      <TabsContent value="language" className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Language & Accessibility</h2>
          <p className="text-muted-foreground">Configure language complexity and accessibility features</p>
        </div>

        <LanguageAccessibilityConfig
          config={languageConfig}
          onConfigChange={setLanguageConfig}
        />
      </TabsContent>

      <TabsContent value="profile" className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">AI Interaction Profile</h2>
          <p className="text-muted-foreground">Customize how EduForge AI assists you</p>
        </div>

        <UserExperienceProfile
          initialProfile={userProfile}
          onProfileChange={setUserProfile}
        />
      </TabsContent>
    </>
  );
}

export default WizardTabContent;
