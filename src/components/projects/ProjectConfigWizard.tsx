
import React, { useState } from 'react';
import { 
  ProjectConfig, 
  ProjectTemplate, 
  EducationalStandard, 
  StructureType, 
  UserProfile,
  LanguageConfig,
  CulturalContext,
  TerminologyType,
  AccessibilityFeature
} from '@/types/project';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, Book, Settings, Globe, Sparkles } from 'lucide-react';
import { WizardTabContent } from './wizard/WizardTabContent';
import { WizardNavigation } from './wizard/WizardNavigation';
import { toast } from '@/hooks/use-toast';

interface ProjectConfigWizardProps {
  template?: ProjectTemplate;
  onSave: (config: ProjectConfig) => void;
  onCancel: () => void;
}

export function ProjectConfigWizard({ template, onSave, onCancel }: ProjectConfigWizardProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [projectConfig, setProjectConfig] = useState<Partial<ProjectConfig>>({
    ...template?.defaultConfig,
    name: '',
    description: '',
    type: template?.type,
    subject: 'mathematics',
    gradeLevel: '6th',
    standards: [],
    learningObjectives: [''],
    pedagogicalApproach: template?.defaultConfig?.pedagogicalApproach || 'direct_instruction',
    culturalContext: 'general',
    accessibility: template?.defaultConfig?.accessibility || [],
    assessmentType: template?.defaultConfig?.assessmentType || 'formative',
    duration: template?.defaultConfig?.duration || '45_minutes',
    contentStructure: 'sequential' as StructureType
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    expertiseLevel: 'intermediate',
    interactionStyle: 'collaborative',
    detailLevel: 3,
    adaptOverTime: true
  });

  const [languageConfig, setLanguageConfig] = useState<LanguageConfig>({
    readabilityLevel: 6,
    culturalContext: 'general' as CulturalContext,
    terminology: 'standard' as TerminologyType,
    accessibilityFeatures: ['screen_reader_friendly'] as AccessibilityFeature[]
  });

  const handleConfigChange = (field: string, value: any) => {
    setProjectConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleLearningObjectivesChange = (index: number, value: string) => {
    const objectives = [...(projectConfig.learningObjectives || [])];
    objectives[index] = value;
    handleConfigChange('learningObjectives', objectives);
  };

  const addLearningObjective = () => {
    const objectives = [...(projectConfig.learningObjectives || []), ''];
    handleConfigChange('learningObjectives', objectives);
  };

  const removeLearningObjective = (index: number) => {
    const objectives = [...(projectConfig.learningObjectives || [])];
    objectives.splice(index, 1);
    handleConfigChange('learningObjectives', objectives);
  };

  const handleStandardsChange = (standards: EducationalStandard[]) => {
    handleConfigChange('standards', standards);
  };

  const handleContentStructureChange = (structure: StructureType) => {
    handleConfigChange('contentStructure', structure);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields before submitting
      if (!projectConfig.name?.trim()) {
        toast({
          title: "Missing information",
          description: "Please provide a project name",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }

      if (!projectConfig.type) {
        toast({
          title: "Missing information",
          description: "Please select a project type",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }

      if (!projectConfig.subject) {
        toast({
          title: "Missing information",
          description: "Please select a subject",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }

      if (!projectConfig.gradeLevel) {
        toast({
          title: "Missing information",
          description: "Please select a grade level",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }
      
      // Check learning objectives
      if (!projectConfig.learningObjectives?.length || !projectConfig.learningObjectives[0].trim()) {
        toast({
          title: "Missing information",
          description: "Please add at least one learning objective",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }
      
      // Merge language and user profile settings into the project config
      const finalConfig: ProjectConfig = {
        ...projectConfig,
        name: projectConfig.name!,
        type: projectConfig.type!,
        subject: projectConfig.subject!,
        gradeLevel: projectConfig.gradeLevel!,
        learningObjectives: projectConfig.learningObjectives!.filter(obj => obj.trim()),
        standards: projectConfig.standards || []
      } as ProjectConfig;
      
      console.log("Saving project with config:", finalConfig);
      
      onSave(finalConfig);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextTab = () => {
    if (activeTab === 'basic') {
      // Validate basic info before proceeding
      if (!projectConfig.name?.trim()) {
        toast({
          title: "Missing information",
          description: "Please provide a project name",
          variant: "destructive",
        });
        return;
      }

      if (!projectConfig.type) {
        toast({
          title: "Missing information",
          description: "Please select a project type",
          variant: "destructive",
        });
        return;
      }

      setActiveTab('standards');
    }
    else if (activeTab === 'standards') setActiveTab('structure');
    else if (activeTab === 'structure') setActiveTab('language');
    else if (activeTab === 'language') setActiveTab('profile');
  };

  const handlePrevTab = () => {
    if (activeTab === 'profile') setActiveTab('language');
    else if (activeTab === 'language') setActiveTab('structure');
    else if (activeTab === 'structure') setActiveTab('standards');
    else if (activeTab === 'standards') setActiveTab('basic');
  };

  const isFirstTab = activeTab === 'basic';
  const isLastTab = activeTab === 'profile';

  const tabStatus = {
    basic: !!projectConfig.name && !!projectConfig.subject && !!projectConfig.gradeLevel && 
           !!projectConfig.learningObjectives?.length && !!projectConfig.learningObjectives[0],
    standards: true, // Standards are optional
    structure: true,
    language: true,
    profile: true
  };

  return (
    <div className="space-y-6">
      <Card className="w-full mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic" className="flex items-center gap-1.5">
              <File className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="standards" className="flex items-center gap-1.5">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Standards</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Structure</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Language</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Profile</span>
            </TabsTrigger>
          </TabsList>

          <WizardTabContent 
            activeTab={activeTab}
            projectConfig={projectConfig}
            handleConfigChange={handleConfigChange}
            handleLearningObjectivesChange={handleLearningObjectivesChange}
            addLearningObjective={addLearningObjective}
            removeLearningObjective={removeLearningObjective}
            handleStandardsChange={handleStandardsChange}
            handleContentStructureChange={handleContentStructureChange}
            languageConfig={languageConfig}
            setLanguageConfig={setLanguageConfig}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        </Tabs>
      </Card>

      <WizardNavigation 
        activeTab={activeTab}
        isFirstTab={isFirstTab}
        isLastTab={isLastTab}
        tabStatus={tabStatus}
        handleNextTab={handleNextTab}
        handlePrevTab={handlePrevTab}
        handleSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}

export default ProjectConfigWizard;
