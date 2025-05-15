
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProject } from '@/hooks/useProject';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectContentNavigation } from '@/components/projects/ProjectContentNavigation';
import { RichTextEditor } from '@/components/content/RichTextEditor';
import { MediaGallery } from '@/components/content/MediaGallery';
import { CollaborationPanel } from '@/components/content/CollaborationPanel';
import { CommentsPanel } from '@/components/content/CommentsPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Content = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Simulate loading content
  useEffect(() => {
    if (project) {
      // In a real app, we would fetch content from a database
      setContent(`<h1>${project.name} Content</h1><p>Start editing this content to create your educational materials.</p>`);
    }
  }, [project]);
  
  const handleSaveContent = async () => {
    setIsSaving(true);
    
    // In a real app, this would save to a database
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: "Content Saved",
      description: "Your changes have been saved successfully."
    });
    
    setIsSaving(false);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/outline`)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Outline
          </Button>
          
          <Button 
            onClick={handleSaveContent}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <ProjectContentNavigation />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex justify-center">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <RichTextEditor
            initialContent={content}
            onChange={setContent}
            projectId={projectId}
          />
        </TabsContent>
        
        <TabsContent value="media">
          <MediaGallery projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="collaboration">
          <CollaborationPanel projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="comments">
          <CommentsPanel 
            projectId={projectId}
            content={content}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Content;
