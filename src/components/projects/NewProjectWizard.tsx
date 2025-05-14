
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProjectConfig, ProjectTemplate } from '@/types/project';
import { useProject } from '@/hooks/useProject';
import projectTemplates from '@/data/projectTemplates';
import { TemplateGallery } from '@/components/projects/TemplateGallery';
import { ProjectConfigWizard } from '@/components/projects/ProjectConfigWizard';

type WizardStep = 'template-selection' | 'project-configuration';

export function NewProjectWizard() {
  const [step, setStep] = useState<WizardStep>('template-selection');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | undefined>();
  const { saveProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setStep('project-configuration');
  };

  const handleCreateProject = async (config: ProjectConfig) => {
    try {
      const result = await saveProject(config);
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      
      if (result && result.id) {
        navigate(`/projects/${result.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (step === 'project-configuration') {
      setStep('template-selection');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-1">
          {step === 'template-selection' 
            ? 'Choose a template to get started with your educational content project' 
            : 'Configure your project settings to generate tailored content'
          }
        </p>
      </div>

      {step === 'template-selection' ? (
        <TemplateGallery 
          templates={projectTemplates} 
          onSelectTemplate={handleSelectTemplate}
        />
      ) : (
        <ProjectConfigWizard 
          template={selectedTemplate} 
          onSave={handleCreateProject}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default NewProjectWizard;
