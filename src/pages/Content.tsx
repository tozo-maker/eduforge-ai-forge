import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

import { ProjectContentNavigation } from '@/components/projects/ProjectContentNavigation';

const Content = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Editor</h1>
        
        {/* Other page header content */}
      </div>
      
      <ProjectContentNavigation />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main content area */}
          <div className="text-center py-16 bg-muted/50 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Content Editor Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The content editor is under development. Start by creating an outline to organize your educational content.
            </p>
            <Button 
              className="mt-4"
              onClick={() => navigate(`/projects/${projectId}/outline`)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Go to Outline Editor
            </Button>
          </div>
        </div>
        
        <div>
          {/* Sidebar content */}
        </div>
      </div>
    </div>
  );
};

export default Content;
