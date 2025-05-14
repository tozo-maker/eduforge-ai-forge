
import React, { useState } from 'react';
import { ProjectConfig, ProjectTemplate, EducationalStandard } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentStructureVisualizer } from '@/components/projects/ContentStructureVisualizer';
import { StandardsIntegration } from '@/components/projects/StandardsIntegration';
import { UserExperienceProfile, UserProfile } from '@/components/projects/UserExperienceProfile';
import { LanguageAccessibilityConfig } from '@/components/projects/LanguageAccessibilityConfig';
import { Form } from '@/components/ui/form';
import { ChevronRight, ChevronLeft, ArrowRight, Check, File, Book, MessageCircle, Sparkles, Globe, Settings } from 'lucide-react';

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
    contentStructure: 'sequential'
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    expertiseLevel: 'intermediate',
    interactionStyle: 'collaborative',
    detailLevel: 3,
    adaptOverTime: true
  });

  const [languageConfig, setLanguageConfig] = useState({
    readabilityLevel: 6,
    culturalContext: 'general',
    terminology: 'standard',
    accessibilityFeatures: ['screen_reader_friendly']
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

  const handleContentStructureChange = (structure: string) => {
    handleConfigChange('contentStructure', structure);
  };

  const handleSubmit = () => {
    onSave(projectConfig as ProjectConfig);
  };

  const handleNextTab = () => {
    if (activeTab === 'basic') setActiveTab('standards');
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
    basic: projectConfig.name && projectConfig.subject && projectConfig.gradeLevel,
    standards: true,
    structure: true,
    language: true,
    profile: true
  };

  const allTabsComplete = 
    tabStatus.basic && 
    tabStatus.standards && 
    tabStatus.structure && 
    tabStatus.language && 
    tabStatus.profile;

  const grades = [
    { value: 'k', label: 'Kindergarten' },
    { value: '1st', label: '1st Grade' },
    { value: '2nd', label: '2nd Grade' },
    { value: '3rd', label: '3rd Grade' },
    { value: '4th', label: '4th Grade' },
    { value: '5th', label: '5th Grade' },
    { value: '6th', label: '6th Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '8th', label: '8th Grade' },
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' },
    { value: 'higher_education', label: 'Higher Education' },
    { value: 'professional', label: 'Professional Development' },
  ];

  const subjects = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'language_arts', label: 'Language Arts' },
    { value: 'social_studies', label: 'Social Studies' },
    { value: 'foreign_language', label: 'Foreign Language' },
    { value: 'arts', label: 'Arts' },
    { value: 'physical_education', label: 'Physical Education' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'other', label: 'Other' },
  ];

  const approaches = [
    { value: 'direct_instruction', label: 'Direct Instruction' },
    { value: 'inquiry_based', label: 'Inquiry Based' },
    { value: 'project_based', label: 'Project Based' },
    { value: 'flipped_classroom', label: 'Flipped Classroom' },
    { value: 'differentiated', label: 'Differentiated' },
    { value: 'universal_design', label: 'Universal Design' },
    { value: 'socratic_method', label: 'Socratic Method' },
    { value: 'cooperative_learning', label: 'Cooperative Learning' },
  ];

  const assessments = [
    { value: 'formative', label: 'Formative' },
    { value: 'summative', label: 'Summative' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'performance_based', label: 'Performance Based' },
    { value: 'peer_assessment', label: 'Peer Assessment' },
    { value: 'self_assessment', label: 'Self Assessment' },
  ];

  const durations = [
    { value: '15_minutes', label: '15 Minutes' },
    { value: '30_minutes', label: '30 Minutes' },
    { value: '45_minutes', label: '45 Minutes' },
    { value: '60_minutes', label: '60 Minutes' },
    { value: '90_minutes', label: '90 Minutes' },
    { value: 'multi_day', label: 'Multi-Day' },
  ];

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

          <TabsContent value="basic" className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Project Details</h2>
              <p className="text-muted-foreground">Enter the basic information about your project</p>
            </div>

            <Form className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium">
                    Project Name
                  </label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={projectConfig.name || ''}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="project-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="project-description"
                    placeholder="Briefly describe your project"
                    value={projectConfig.description || ''}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select
                      value={projectConfig.subject}
                      onValueChange={(value) => handleConfigChange('subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade Level</label>
                    <Select
                      value={projectConfig.gradeLevel}
                      onValueChange={(value) => handleConfigChange('gradeLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Objectives</label>
                  {projectConfig.learningObjectives?.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => handleLearningObjectivesChange(index, e.target.value)}
                        placeholder="Enter a learning objective"
                        className="flex-1"
                      />
                      {projectConfig.learningObjectives!.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeLearningObjective(index)}
                          className="shrink-0"
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLearningObjective}
                    className="mt-2"
                  >
                    Add Objective
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pedagogical Approach</label>
                    <Select
                      value={projectConfig.pedagogicalApproach}
                      onValueChange={(value) => handleConfigChange('pedagogicalApproach', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approach" />
                      </SelectTrigger>
                      <SelectContent>
                        {approaches.map((approach) => (
                          <SelectItem key={approach.value} value={approach.value}>
                            {approach.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assessment Type</label>
                    <Select
                      value={projectConfig.assessmentType}
                      onValueChange={(value) => handleConfigChange('assessmentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assessments.map((assessment) => (
                          <SelectItem key={assessment.value} value={assessment.value}>
                            {assessment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select
                    value={projectConfig.duration}
                    onValueChange={(value) => handleConfigChange('duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Form>
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
              selectedStructure={projectConfig.contentStructure || 'sequential'}
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
        </Tabs>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={isFirstTab ? onCancel : handlePrevTab}
          className="px-4 gap-2"
        >
          {isFirstTab ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" /> Back
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          {isLastTab && (
            <Button 
              onClick={handleSubmit} 
              disabled={!tabStatus.basic}
              className="gap-2"
            >
              Create Project <Check className="h-4 w-4" />
            </Button>
          )}
          
          {!isLastTab && (
            <Button 
              onClick={handleNextTab}
              disabled={activeTab === 'basic' && !tabStatus.basic}
              className="gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectConfigWizard;
