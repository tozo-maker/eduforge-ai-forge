
import React from 'react';
import { ProjectTemplate } from '@/types/project';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/projects/TemplateCard';
import { Link } from 'react-router-dom';

interface FeaturedTemplatesProps {
  templates: ProjectTemplate[];
}

export const FeaturedTemplates: React.FC<FeaturedTemplatesProps> = ({ templates }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured Templates</h2>
        <Button variant="ghost" size="sm" className="text-sm" asChild>
          <Link to="/templates">View All Templates</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <TemplateCard 
            key={template.id} 
            template={template}
            tabIndex={0}
            aria-label={`Use ${template.name} template`}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = `/templates/${template.id}`;
              }
            }}
            onSelect={() => { window.location.href = `/templates/${template.id}`; }}
            className="transition-all duration-200 hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        ))}
      </div>
    </div>
  );
};
