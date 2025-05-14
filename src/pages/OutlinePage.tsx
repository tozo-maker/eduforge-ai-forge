
import React, { useState } from 'react';
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
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Outline } from '@/types/outline';
import { OutlineGenerator } from '@/components/outline/OutlineGenerator';
import { OutlineEditor } from '@/components/outline/OutlineEditor';
import { OutlineAnalytics } from '@/components/outline/OutlineAnalytics';
import { OutlineVersioning } from '@/components/outline/OutlineVersioning';
import { calculateTotalWordCount, calculateTotalDuration } from '@/services/outlineGeneration';
import { saveOutlineVersion } from '@/services/outlineVersioning';
import { standardsDatabase } from '@/data/standardsDatabase';

export default function OutlinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(projectId);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

  // Handle generation of a new outline
  const handleOutlineGenerated = (newOutline: Outline) => {
    setOutline(newOutline);
    setActiveTab('edit');
    
    // Save the initial version
    saveOutlineVersion(newOutline, 'Initial generation');
  };

  // Handle saving outline changes
  const handleSaveOutline = (updatedOutline: Outline) => {
    setOutline(updatedOutline);
  };

  // Handle restoring a version
  const handleVersionRestore = (restoredOutline: Outline) => {
    setOutline(restoredOutline);
  };

  // Handle creating a branch
  const handleBranchCreate = (branchedOutline: Outline) => {
    setOutline(branchedOutline);
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
        </TabsList>
        
        <TabsContent value="generate">
          <OutlineGenerator 
            projectConfig={project} 
            onOutlineGenerated={handleOutlineGenerated} 
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
      </Tabs>
    </div>
  );
}
