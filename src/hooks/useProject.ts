
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectConfig } from '@/types/project';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useProject = (projectId?: string) => {
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProject(data as ProjectConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      toast({
        title: 'Error',
        description: 'Failed to load project details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (projectData: Partial<ProjectConfig>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      if (project?.id) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update({
            ...projectData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)
          .select('*')
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setProject(data as ProjectConfig);
        toast({
          title: 'Success',
          description: 'Project updated successfully.',
        });
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              ...projectData,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select('*')
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setProject(data as ProjectConfig);
        toast({
          title: 'Success',
          description: 'Project created successfully.',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save project'));
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save project.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }

    return project;
  };

  const deleteProject = async () => {
    if (!project?.id) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        throw new Error(error.message);
      }

      setProject(null);
      toast({
        title: 'Success',
        description: 'Project deleted successfully.',
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { project, isLoading, error, fetchProject, saveProject, deleteProject };
};
