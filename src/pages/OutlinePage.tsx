import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  PenLine, 
  LineChart, 
  History, 
  Layers, 
  ChevronLeft,
  Edit,
  Save,
  FileSymlink,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Outline, OutlineNode } from '@/types/outline';
import { OutlineGenerator } from '@/components/outline/OutlineGenerator';
import { OutlineEditor } from '@/components/outline/OutlineEditor';
import { OutlineAnalytics } from '@/components/outline/OutlineAnalytics';
import { OutlineVersioning } from '@/components/outline/OutlineVersioning';
import { OutlineExport } from '@/components/outline/OutlineExport';
import { calculateTotalWordCount, calculateTotalDuration, generateOutlineNodes } from '@/services/outlineGeneration';
import { saveOutlineVersion } from '@/services/outlineVersioning';
import { standardsDatabase } from '@/data/standardsDatabase';
import { ContentStructureVisualizer } from '@/components/projects/ContentStructureVisualizer';
import { validateOutlineCoherence } from '@/services/outlineValidation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ProjectContentNavigation } from '@/components/projects/ProjectContentNavigation';

export default function OutlinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(projectId);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [contentStructure, setContentStructure] = useState<'sequential' | 'hierarchical' | 'modular' | 'spiral'>('sequential');
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  // Handle generation of a new outline
  const handleOutlineGenerated = (newOutline: Outline) => {
    setOutline(newOutline);
    setActiveTab('edit');
    
    // Save the initial version
    saveOutlineVersion(newOutline, 'Initial generation');
    
    // Validate the outline
    const issues = validateOutlineCoherence(newOutline);
    setValidationIssues(issues);
  };

  // Handle saving outline changes
  const handleSaveOutline = (updatedOutline: Outline) => {
    setOutline(updatedOutline);
    
    // Validate the outline
    const issues = validateOutlineCoherence(updatedOutline);
    setValidationIssues(issues);
    
    // Save a version
    saveOutlineVersion(updatedOutline, 'Updated outline');
  };

  // Handle restoring a version
  const handleVersionRestore = (restoredOutline: Outline) => {
    setOutline(restoredOutline);
    
    // Validate the outline
    const issues = validateOutlineCoherence(restoredOutline);
    setValidationIssues(issues);
  };

  // Handle creating a branch
  const handleBranchCreate = (branchedOutline: Outline) => {
    setOutline(branchedOutline);
    
    // Validate the outline
    const issues = validateOutlineCoherence(branchedOutline);
    setValidationIssues(issues);
  };

  // Generate preview outline nodes based on selected structure
  const generatePreviewOutline = (structure: 'sequential' | 'hierarchical' | 'modular' | 'spiral'): OutlineNode[] => {
    if (!project) return [];
    
    // Simulate outline nodes based on structure type
    return generateOutlineNodes(
      project, 
      'medium', 
      true, 
      true, 
      0, 
      [],
      structure
    ).slice(0, structure === 'modular' ? 6 : 4); // Limit to a few nodes for preview
  };

  // Handle structure change
  const handleStructureChange = (structure: 'sequential' | 'hierarchical' | 'modular' | 'spiral') => {
    setContentStructure(structure);
    
    // Show toast notification when structure changes
    toast({
      title: "Structure Updated",
      description: `Content structure set to ${structure}`,
    });
  };

  // Get project standards
  const projectStandards = standardsDatabase.filter(std => 
    project?.standards?.some(projStd => 
      projStd.id === std.id || 
      (typeof projStd === 'string' && projStd === std.id)
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name} Outline</h1>
            <p className="text-muted-foreground">
              {project.type} • {project.subject} • {project.gradeLevel} Grade
            </p>
          </div>
        </div>
        
        {outline && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-sm">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>
                {calculateTotalWordCount(outline.rootNodes)} words • {calculateTotalDuration(outline.rootNodes)} mins
              </span>
            </div>
            <Button 
              onClick={() => {
                toast({
                  title: "Outline Exported",
                  description: "Your outline has been exported to the content editor."
                });
                // In a real app, this would navigate to the content editor
                // with the outline data
                navigate(`/projects/${projectId}/content`);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Continue to Content Editor
            </Button>
          </div>
        )}
      </div>
      
      <ProjectContentNavigation />
      
      {/* Content Structure Visualizer - Now integrated with the outline system */}
      <ContentStructureVisualizer 
        selectedStructure={contentStructure}
        onStructureChange={handleStructureChange}
        outlineNodes={outline?.rootNodes || generatePreviewOutline(contentStructure)}
        onVisualizeOutline={generatePreviewOutline}
      />
      
      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Structural Issues Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Your outline has {validationIssues.length} validation issues to address:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {validationIssues.slice(0, 3).map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
              {validationIssues.length > 3 && (
                <li>...and {validationIssues.length - 3} more issues</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="generate" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>Generate</span>
          </TabsTrigger>
          <TabsTrigger 
            value="edit" 
            className="flex items-center gap-1.5"
            disabled={!outline}
          >
            <PenLine className="h-4 w-4" />
            <span>Edit</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analyze" 
            className="flex items-center gap-1.5"
            disabled={!outline}
          >
            <LineChart className="h-4 w-4" />
            <span>Analyze</span>
          </TabsTrigger>
          <TabsTrigger 
            value="versions" 
            className="flex items-center gap-1.5"
            disabled={!outline}
          >
            <History className="h-4 w-4" />
            <span>Versions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="export" 
            className="flex items-center gap-1.5"
            disabled={!outline}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <OutlineGenerator 
            projectConfig={project} 
            onOutlineGenerated={handleOutlineGenerated}
            selectedStructure={contentStructure} 
          />
        </TabsContent>
        
        <TabsContent value="edit">
          {outline ? (
            <OutlineEditor 
              outline={outline} 
              standards={projectStandards}
              onSave={handleSaveOutline} 
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No outline available. Generate an outline first.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analyze">
          {outline ? (
            <OutlineAnalytics 
              outline={outline}
              standards={projectStandards}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No outline available. Generate an outline first.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="versions">
          {outline ? (
            <OutlineVersioning 
              outline={outline}
              onVersionRestore={handleVersionRestore}
              onBranchCreate={handleBranchCreate}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No outline available. Generate an outline first.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="export">
          {outline ? (
            <OutlineExport outline={outline} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No outline available. Generate an outline first.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
