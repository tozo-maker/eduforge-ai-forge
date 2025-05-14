
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText } from 'lucide-react';

export function ProjectContentNavigation() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <Button
          variant="outline"
          className="rounded-r-none gap-1"
          onClick={() => navigate(`/projects/${projectId}/outline`)}
        >
          <BookOpen className="h-4 w-4" />
          Outline
        </Button>
        <Button
          variant="outline"
          className="rounded-l-none gap-1"
          onClick={() => navigate(`/projects/${projectId}/content`)}
        >
          <FileText className="h-4 w-4" />
          Content
        </Button>
      </div>
    </div>
  );
}

export default ProjectContentNavigation;
